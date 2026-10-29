#!/usr/bin/env bash
# Benchmark-Abschirmung fuer macOS, keine vollstaendige Host-Isolation.
# Nutzung (Ziel vorher anlegen, ausserhalb des Benchmark-Repositories):
#   ./run-opencode-benchmark-sandbox.sh ~/Benchmark-Sandbox/modell-lauf
# Der Skriptstandort ist beliebig. Geschuetzt werden das Benchmark-Repository
# und der gesamte Elternordner des Ziels, mit Ausnahme des Ziels selbst.
# Inhalte/Verzeichnislisten sind gesperrt; Metadaten (stat) bleiben verfuegbar.
# Globale Config, Skills, Agents, Plugins, Jev und Netzwerk bleiben lesbar/nutzbar.
# Externe MCP-/Browser-Dienste und bereits gespeicherte Sessions werden NICHT isoliert.
#
# Optionen per Umgebung:
# OC_SANDBOX_BENCH_REPO    Benchmark-Repository (Default: bisheriger LLM-Bench-Pfad)
# OC_SANDBOX_BLOCK_READ   Weitere existierende gesperrte Ordner, mit : getrennt
# OC_SANDBOX_EXTRA_RW     Weitere existierende beschreibbare Tool-Ordner (: getrennt)
# OC_SANDBOX_CONFIG_RW=1  Auch ~/.config/opencode beschreibbar machen
# OC_SANDBOX_CMD=/bin/sh  Anderen Befehl innerhalb derselben Sandbox testen
# Achtung: Gemeinsame Tool-Caches/State sind freigegeben; keine Anti-Ausbruch-Garantie.
set -euo pipefail

die() { echo "Sandbox: $*" >&2; exit 1; }
usage() { echo "Nutzung: $0 <existierender-modellordner> [opencode-argumente...]" >&2; }
esc() { printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'; }
canonical_dir() { (cd "$1" && pwd -P); }
within() { [ "$1" = "$2" ] || [[ "$1" == "$2"/* ]]; }

if [ "$#" -eq 0 ]; then usage; exit 2; fi
[ "$(uname -s)" = Darwin ] || die "Dieser Wrapper benoetigt macOS."
[ -x /usr/bin/sandbox-exec ] || die "sandbox-exec fehlt."
TARGET_ARG="$1"
shift
[ -d "$TARGET_ARG" ] || die "Zielordner fehlt: $TARGET_ARG (vorher anlegen)."
TARGET="$(canonical_dir "$TARGET_ARG")"
WORKSPACE="$(canonical_dir "$TARGET/..")"
HOME_REAL="$(canonical_dir "$HOME")"
case "$WORKSPACE" in
  /|/Users|"$HOME_REAL") die "Bitte einen eigenen Arbeitsbereich verwenden, z. B. ~/Benchmark-Sandbox/modell-lauf." ;;
esac

BENCH_REPO="${OC_SANDBOX_BENCH_REPO:-$HOME_REAL/Clouds/Projekte/KI/LLM-Bench}"
[ -d "$BENCH_REPO" ] || die "Benchmark-Repository fehlt: $BENCH_REPO. OC_SANDBOX_BENCH_REPO setzen."
BENCH_REPO="$(canonical_dir "$BENCH_REPO")"
BLOCKED=("$BENCH_REPO")
if [ -n "${OC_SANDBOX_BLOCK_READ:-}" ]; then
  IFS=':' read -r -a EXTRA_BLOCKED <<< "$OC_SANDBOX_BLOCK_READ"
  for p in "${EXTRA_BLOCKED[@]}"; do
    [ -d "$p" ] || die "Gesperrter Ordner fehlt: $p"
    BLOCKED+=("$(canonical_dir "$p")")
  done
fi
for p in "${BLOCKED[@]}"; do
  if within "$TARGET" "$p" || within "$p" "$TARGET"; then
    die "Ziel und gesperrter Ordner duerfen sich nicht ueberlappen: $p"
  fi
done

# Keine Git-/Config-Discovery in einem anderen Projekt als dem Ziel starten.
# Ein eigenstaendiges Git-Repository direkt im Ziel ist erlaubt; keines wird angelegt.
if command -v git >/dev/null 2>&1; then
  REPO_ROOT="$(git -C "$TARGET" rev-parse --show-toplevel 2>/dev/null || true)"
  if [ -n "$REPO_ROOT" ]; then
    REPO_ROOT="$(canonical_dir "$REPO_ROOT")"
    [ "$REPO_ROOT" = "$TARGET" ] || die "Ziel liegt in einem uebergeordneten Git-Repository: $REPO_ROOT"
  fi
fi

CMD="${OC_SANDBOX_CMD:-opencode}"
ARGS=("$@")
if [ "${CMD##*/}" = opencode ]; then
  for a in ${ARGS[@]+"${ARGS[@]}"}; do
    case "$a" in
      --server|--server=*|--standalone=*) die "Externe Server und --standalone=... sind nicht erlaubt." ;;
    esac
  done
  case "${ARGS[0]:-}" in
    run|mini) ARGS=("${ARGS[0]}" --standalone ${ARGS[@]+"${ARGS[@]:1}"}) ;;
    ""|-*) ARGS=(--standalone ${ARGS[@]+"${ARGS[@]}"}) ;;
    *) die "Nur TUI, run und mini sind in diesem Wrapper vorgesehen." ;;
  esac
fi

# Schreibausnahmen fuer die bisherige OpenCode-/Tool-Umgebung.
# Lesen ausserhalb der geschuetzten Projektbereiche bleibt grundsaetzlich erlaubt.
RW_PATHS=("$TARGET")
for p in "$HOME_REAL/.local/share/opencode" "$HOME_REAL/.local/state/opencode" \
         "$HOME_REAL/.opencode" "$HOME_REAL/.npm" "$HOME_REAL/.bun" "$HOME_REAL/.cache"; do
  if [ -d "$p" ]; then p="$(canonical_dir "$p")"; fi
  RW_PATHS+=("$p")
done
if [ "${OC_SANDBOX_CONFIG_RW:-0}" = 1 ]; then
  RW_PATHS+=("$HOME_REAL/.config/opencode")
fi
if [ -n "${OC_SANDBOX_EXTRA_RW:-}" ]; then
  IFS=':' read -r -a EXTRA_RW <<< "$OC_SANDBOX_EXTRA_RW"
  for p in "${EXTRA_RW[@]}"; do
    [ -d "$p" ] || die "Zusaetzlicher Tool-Ordner fehlt: $p"
    RW_PATHS+=("$(canonical_dir "$p")")
  done
fi
RW=""
for p in "${RW_PATHS[@]}"; do
  if [ "$p" != "$TARGET" ]; then
    if within "$p" "$WORKSPACE" || within "$WORKSPACE" "$p"; then
      die "Tool-Schreibausnahme ueberlappt den Arbeitsbereich: $p"
    fi
    for blocked in "${BLOCKED[@]}"; do
      if within "$p" "$blocked" || within "$blocked" "$p"; then
        die "Tool-Schreibausnahme ueberlappt geschuetzten Ordner: $p"
      fi
    done
  fi
  RW="$RW (subpath \"$(esc "$p")\")"
done

PROTECTED="(subpath \"$(esc "$WORKSPACE")\")"
for p in "${BLOCKED[@]}"; do
  PROTECTED="$PROTECTED (subpath \"$(esc "$p")\")"
done

# file-read-data sperrt Dateiinhalte UND readdir, aber nicht stat.
# service.json zuletzt sperren, damit kein gemeinsamer Dienst genutzt wird.
PROFILE="(version 1)
(allow default)
(deny file-write* (subpath \"$(esc "$HOME_REAL")\"))
(allow file-write*$RW)
(deny file-read-data $PROTECTED)
(deny file-write* $PROTECTED)
(allow file-read-data (subpath \"$(esc "$TARGET")\"))
(allow file-write* (subpath \"$(esc "$TARGET")\"))
(deny file-read* (subpath \"$(esc "$HOME_REAL/.ssh")\"))
(deny file-read* (literal \"$(esc "$HOME_REAL/.local/state/opencode/service.json")\")
                 (literal \"$(esc "$HOME_REAL/.config/opencode/service.json")\"))"

echo "Sandbox: Projekt $TARGET" >&2
echo "Sandbox: Inhalte gesperrt in $WORKSPACE (ausser Projekt) und ${BLOCKED[*]}" >&2
echo "Sandbox: Globale Tools/Config und MCPs bleiben verfuegbar; keine vollstaendige Host-Isolation." >&2
cd "$TARGET"
exec /usr/bin/sandbox-exec -p "$PROFILE" "$CMD" ${ARGS[@]+"${ARGS[@]}"}
