#!/usr/bin/env python3
"""Read a complete OpenCode v2 export and emit reproducible timing evidence.

Usage: python3 scripts/analyze_opencode_session.py PATH/benchmark/session01.json
All durations use integer Unix milliseconds. Assistant intervals include model
prefill/generation and enclosed tools; they are not productive work or CPU time.
Compaction brackets lack a completion timestamp and are not measured idle time.
"""

import argparse
import hashlib
import json
import re
from collections import Counter
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from pathlib import Path
from zoneinfo import ZoneInfo


def iso(milliseconds, tz=timezone.utc):
    return (datetime(1970, 1, 1, tzinfo=timezone.utc)
            + timedelta(milliseconds=milliseconds)).astimezone(tz).isoformat(
                timespec="milliseconds")


def union_ms(intervals):
    total = 0
    end = None
    for start, stop in sorted(intervals):
        if stop < start:
            raise ValueError("Reversed interval")
        total += max(0, stop - max(start, end if end is not None else start))
        end = max(stop, end if end is not None else stop)
    return total


def token_totals(messages):
    return {
        **{key: sum(m.get("tokens", {}).get(key, 0) for m in messages)
           for key in ("input", "output", "reasoning")},
        "cache": {key: sum(m.get("tokens", {}).get("cache", {}).get(key, 0)
                           for m in messages) for key in ("read", "write")},
    }


def analyze(path):
    raw = path.read_bytes()  # Parse the entire export, including the final long text.
    session = json.loads(raw)
    info, messages = session["info"], session["messages"]
    start, end = info["time"]["created"], info["time"]["idle"]
    idle = [m for m in messages if m["type"] == "idle"]
    if not idle or idle[-1]["time"]["created"] != end:
        raise ValueError("Session idle timestamp has no matching final idle event")
    if end < start:
        raise ValueError("Session ends before creation")
    assistants = [m for m in messages if m["type"] == "assistant"]
    intervals = [(m["time"]["created"], m["time"]["completed"])
                 for m in assistants]
    if any(a < start or b > end for a, b in intervals):
        raise ValueError("Assistant interval is outside the session span")
    compactions = []
    for index, message in enumerate(messages):
        if message["type"] != "compaction":
            continue
        following = next(m for m in messages[index + 1:]
                         if m["type"] in ("assistant", "idle"))
        a, b = message["time"]["created"], following["time"]["created"]
        compactions.append({"message_index": index, "id": message["id"],
                            "start_ms": a, "next_event_ms": b,
                            "bracket_ms": b - a, "status": message.get("status"),
                            "completion_timestamp_present": "completed" in message["time"]})
    brackets = [(c["start_ms"], c["next_event_ms"]) for c in compactions]
    assistant_ms = union_ms(intervals)
    bracket_ms = union_ms(brackets)
    covered_ms = union_ms(intervals + brackets)
    tokens = token_totals(messages)
    user_messages = [{"message_index": i, "id": m["id"], "time": m["time"]}
                     for i, m in enumerate(messages) if m["type"] == "user"]
    tool_records = [{"message_index": i, "content_index": j, "id": c["id"],
                     "name": c["name"], "time": c["time"],
                     "status": c["state"]["status"],
                     "command": c["state"].get("input", {}).get("command"),
                     "exit": c["state"].get("metadata", {}).get("exit")}
                    for i, m in enumerate(messages)
                    for j, c in enumerate(m.get("content", [])) if c["type"] == "tool"]
    gate_pattern = re.compile(
        r"(?:^|&&|;|\|\|)\s*(?:npm\s+(?:run\s+)?(?:build|test|lint)\b"
        r"|(?:npx\s+)?(?:tsc|vitest|oxlint|eslint|vite\s+build)\b)")
    gates = [t for t in tool_records if t["command"] and gate_pattern.search(t["command"])]
    last = assistants[-1]
    last_tool = max(tool_records, key=lambda t: t["time"]["completed"])
    peak = max(enumerate(messages), key=lambda item: item[1].get("tokens", {}).get("input", 0))
    return {
        "source": {"path": path.as_posix(), "bytes": len(raw),
                   "sha256": hashlib.sha256(raw).hexdigest()},
        "session": info,
        "canonical": {"start_field": "info.time.created", "end_field": "info.time.idle",
                      "start_ms": start, "end_ms": end, "elapsed_ms": end - start,
                      "elapsed_seconds": str(Decimal(end - start) / 1000),
                      "elapsed_minutes": str(Decimal(end - start) / 60000),
                      "start_utc": iso(start), "end_utc": iso(end),
                      "start_berlin": iso(start, ZoneInfo("Europe/Berlin")),
                      "end_berlin": iso(end, ZoneInfo("Europe/Berlin")),
                      "final_idle_id": idle[-1]["id"]},
        "event_counts": dict(Counter(m["type"] for m in messages)),
        "user_messages": user_messages,
        "timing": {"assistant_interval_union_ms": assistant_ms,
                   "compaction_bracket_union_ms": bracket_ms,
                   "assistant_compaction_overlap_ms": assistant_ms + bracket_ms - covered_ms,
                   "other_uncovered_ms": end - start - covered_ms,
                   "compactions": compactions,
                   "manual_wait_ms": None, "production_build_ms": None,
                   "note": "Compaction brackets and other gaps are not measured user pauses. "
                           "Tools are already enclosed in assistant intervals."},
        "tokens": {"session_reported": info["tokens"], "exported_message_sum": tokens,
                   "by_message_type": {kind: token_totals([m for m in messages if m["type"] == kind])
                                       for kind in sorted({m["type"] for m in messages})},
                   "session_minus_message_sum": {
                       k: info["tokens"][k] - tokens[k] for k in ("input", "output", "reasoning")},
                   "peak_input": {"tokens": peak[1]["tokens"]["input"],
                                  "message_index": peak[0], "type": peak[1]["type"]}},
        "tools": {"count": len(tool_records),
                  "status_counts": dict(Counter(t["status"] for t in tool_records)),
                  "ran_to_completed_union_ms": union_ms(
                      [(t["time"]["ran"], t["time"]["completed"]) for t in tool_records]),
                  "recorded_build_test_lint_commands": gates,
                  "last_record": last_tool,
                  "elapsed_to_last_tool_ms": last_tool["time"]["completed"] - start},
        "final_assistant": {"id": last["id"], "time": last["time"],
                            "duration_ms": last["time"]["completed"] - last["time"]["created"],
                            "finish": last["finish"], "rawFinish": last["rawFinish"],
                            "tokens": last["tokens"],
                            "text_characters": sum(len(c.get("text", ""))
                                                   for c in last["content"] if c["type"] == "text"),
                            "tool_count": sum(c["type"] == "tool" for c in last["content"]),
                            "snapshot_files": last.get("snapshot", {}).get("files", [])},
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("session", type=Path)
    args = parser.parse_args()
    print(json.dumps(analyze(args.session), indent=2, ensure_ascii=False))
