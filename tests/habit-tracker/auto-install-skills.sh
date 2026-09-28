#!/usr/bin/env bash
# auto-install-skills.sh — installiert die Bench-Skills lokal im Projektordner (opencode).
#
# Aufruf:
#   ./auto-install-skills.sh                          # im aktuellen Ordner, OHNE Jev
#   ./auto-install-skills.sh --with-jev               # im aktuellen Ordner, MIT Jev
#   ./auto-install-skills.sh -d run-01                # Projektordner (relativ), wird bei Bedarf angelegt
#   ./auto-install-skills.sh -d ../tests/qwen --with-jev
#   ./auto-install-skills.sh -d ~/bench/run-02        # auch absolut oder mit ~
#   ./auto-install-skills.sh --dry-run -d run-01      # zeigt nur, was passieren würde
#
# Optionen:
#   -d, --dir <ordner>   Projektverzeichnis, in dem die Skills installiert werden
#                        (Standard: aktueller Ordner). Relative Pfade gelten ab dem
#                        Ordner, aus dem du das Skript aufrufst.
#   --with-jev           zusätzlich den Jev-Skill installieren
#   --dry-run            nur anzeigen, nichts installieren oder anlegen
#   -h, --help           diese Hilfe
set -euo pipefail

# ---- Konfiguration ---------------------------------------------------------
AGENT="opencode"

# Basis-Skills: "repo|skill-name" (in jedem Lauf installiert)
BASE_SKILLS=(
  "leonxlnx/taste-skill|minimalist-ui"
  "ai-enhanced-engineer/aiee-skills|vite-pwa-patterns"
)

# Jev-Skill (nur mit --with-jev), Quelle: https://www.skills.sh/okooo5km/jev/jev
JEV_REPO="okooo5km/jev"
JEV_SKILL="jev"

# Projektlokaler Skill-Ordner (Standard der skills-CLI im Projektmodus)
SKILLS_DIR=".agents/skills"
# ---------------------------------------------------------------------------

WITH_JEV=0
DRY_RUN=0
TARGET="."

usage() { sed -n '2,20p' "$0"; }

while [ $# -gt 0 ]; do
  case "$1" in
    -d|--dir)
      [ $# -ge 2 ] || { echo "Nach $1 fehlt der Ordner." >&2; exit 1; }
      TARGET="$2"; shift 2 ;;
    --dir=*)    TARGET="${1#--dir=}"; shift ;;
    --with-jev) WITH_JEV=1; shift ;;
    --dry-run)  DRY_RUN=1; shift ;;
    -h|--help)  usage; exit 0 ;;
    -*)         echo "Unbekannte Option: $1" >&2; usage >&2; exit 1 ;;
    *)          TARGET="$1"; shift ;;   # loses Argument = Ordner (wie bisher)
  esac
done

# ~ am Anfang selbst auflösen (falls es in Anführungszeichen kam)
case "$TARGET" in
  "~")   TARGET="$HOME" ;;
  "~/"*) TARGET="$HOME/${TARGET#\~/}" ;;
esac

# Ordner anlegen, falls nötig
if [ ! -d "$TARGET" ]; then
  if [ "$DRY_RUN" -eq 1 ]; then
    echo "[dry-run] mkdir -p $TARGET"
  else
    mkdir -p "$TARGET"
    echo "Ordner angelegt: $TARGET"
  fi
fi

# In den Ordner wechseln (im Dry-Run ohne existierenden Ordner: nur Pfad berechnen)
if [ -d "$TARGET" ]; then
  cd "$TARGET"
  RESOLVED="$(pwd)"
else
  case "$TARGET" in
    /*) RESOLVED="$TARGET" ;;
    *)  RESOLVED="$PWD/${TARGET#./}" ;;
  esac
fi

SKILLS=("${BASE_SKILLS[@]}")
if [ "$WITH_JEV" -eq 1 ]; then
  if [ -z "$JEV_REPO" ] || [ -z "$JEV_SKILL" ]; then
    echo "Für --with-jev bitte JEV_REPO und JEV_SKILL oben im Skript eintragen." >&2
    exit 1
  fi
  SKILLS+=("$JEV_REPO|$JEV_SKILL")
fi

echo "Projektordner: $RESOLVED"
echo "Modus: $([ "$WITH_JEV" -eq 1 ] && echo 'MIT Jev' || echo 'OHNE Jev')"
echo

for entry in "${SKILLS[@]}"; do
  repo="${entry%%|*}"
  skill="${entry##*|}"

  if [ -d "$SKILLS_DIR/$skill" ]; then
    echo "✓ $skill ist schon installiert, überspringe"
    continue
  fi

  cmd=(npx --yes skills add "$repo" --skill "$skill" -a "$AGENT" -y)
  if [ "$DRY_RUN" -eq 1 ]; then
    echo "[dry-run] (in $RESOLVED) ${cmd[*]}"
  else
    echo "→ installiere $skill aus $repo"
    "${cmd[@]}"
  fi
done

# Warnung, falls ein Jev-Skill im "ohne Jev"-Lauf noch herumliegt
if [ "$WITH_JEV" -eq 0 ] && [ -n "$JEV_SKILL" ] && [ -d "$SKILLS_DIR/$JEV_SKILL" ]; then
  echo
  echo "⚠ Achtung: $JEV_SKILL liegt noch in $SKILLS_DIR, obwohl dieser Lauf OHNE Jev sein soll." >&2
fi

echo
echo "Aktive Skills in $RESOLVED/$SKILLS_DIR:"
if [ -d "$SKILLS_DIR" ]; then ls -1 "$SKILLS_DIR"; else echo "(noch keine)"; fi
