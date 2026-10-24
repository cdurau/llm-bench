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
#   ./auto-install-skills.sh --check -d run-01        # nur prüfen: lokal == Upstream? (nichts schreiben)
#   ./auto-install-skills.sh --update -d run-01       # vorhandene Skills auf Upstream-Stand ziehen
#
# Optionen:
#   -d, --dir <ordner>   Projektverzeichnis, in dem die Skills installiert werden
#                        (Standard: aktueller Ordner). Relative Pfade gelten ab dem
#                        Ordner, aus dem du das Skript aufrufst.
#   --with-jev           zusätzlich den Jev-Skill installieren
#   --dry-run            nur anzeigen, nichts installieren oder anlegen
#   --check              Fingerprints der installierten Skills gegen GitHub vergleichen
#                        (nur lesen, nichts installieren). Exit 1 bei Abweichung.
#   --update             `skills update` im Zielordner ausführen (nur vorhandene Skills)
#   -h, --help           diese Hilfe
#
# Hinweis: Skills sind Teil des Lauf-Artefakts. In geschlossenen Modellläufen
# nicht aktualisieren, sonst ist der Lauf nicht mehr reproduzierbar.
set -euo pipefail

# ---- Konfiguration ---------------------------------------------------------
AGENT="opencode"

# Basis-Skills: "repo|skill-name|pfad-der-SKILL.md" (in jedem Lauf installiert)
BASE_SKILLS=(
  "leonxlnx/taste-skill-classics|minimalist-ui|skills/minimalist-skill/SKILL.md"
  "ai-enhanced-engineer/aiee-skills|vite-pwa-patterns|skills/vite-pwa-patterns/SKILL.md"
)

# Jev-Skill (nur mit --with-jev), Quelle: https://www.skills.sh/okooo5km/jev/jev
JEV_REPO="okooo5km/jev"
JEV_SKILL="jev"
JEV_PATH="jev/SKILL.md"

# Projektlokaler Skill-Ordner (Standard der skills-CLI im Projektmodus)
SKILLS_DIR=".agents/skills"
# ---------------------------------------------------------------------------

WITH_JEV=0
DRY_RUN=0
MODE="install"   # install | check | update
TARGET="."

usage() { sed -n '2,26p' "$0"; }

while [ $# -gt 0 ]; do
  case "$1" in
    -d|--dir)
      [ $# -ge 2 ] || { echo "Nach $1 fehlt der Ordner." >&2; exit 1; }
      TARGET="$2"; shift 2 ;;
    --dir=*)    TARGET="${1#--dir=}"; shift ;;
    --with-jev) WITH_JEV=1; shift ;;
    --dry-run)  DRY_RUN=1; shift ;;
    --check)    MODE="check"; shift ;;
    --check-only) MODE="check"; shift ;;
    --update)   MODE="update"; shift ;;
    --upgrade)  MODE="update"; shift ;;
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
    echo "Für --with-jev bitte JEV_REPO, JEV_SKILL und JEV_PATH oben im Skript eintragen." >&2
    exit 1
  fi
  SKILLS+=("$JEV_REPO|$JEV_SKILL|$JEV_PATH")
fi

echo "Projektordner: $RESOLVED"
echo "Modus: $([ "$WITH_JEV" -eq 1 ] && echo 'MIT Jev' || echo 'OHNE Jev') [$MODE]"
echo

# Fingerprint einer SKILL.md-Datei
fingerprint() {
  md5 -q "$1"
}

# Upstream-SKILL.md nach $1 herunterladen (raw.githubusercontent.com, main oder master)
fetch_upstream() {
  local repo="$2" path="$3" branch
  for branch in main master; do
    curl -sfL "https://raw.githubusercontent.com/$repo/$branch/$path" -o "$1" 2>/dev/null \
      && return 0
  done
  return 1
}

if [ "$MODE" = "check" ]; then
  rc=0
  tmp_up="$(mktemp -t skills-upstream)"
  trap 'rm -f "$tmp_up"' EXIT
  CHECK_SKILLS=("${BASE_SKILLS[@]}")
  # Jev nur prüfen, wenn er in diesem Lauf tatsächlich installiert ist
  [ -d "$SKILLS_DIR/$JEV_SKILL" ] && CHECK_SKILLS+=("$JEV_REPO|$JEV_SKILL|$JEV_PATH")
  printf '%-20s %-10s %-34s %-34s\n' "SKILL" "STATUS" "LOKAL" "UPSTREAM"
  for entry in "${CHECK_SKILLS[@]}"; do
    repo="${entry%%|*}"; rest="${entry#*|}"
    skill="${rest%%|*}"; path="${rest##*|}"
    if [ -f "$SKILLS_DIR/$skill/SKILL.md" ]; then
      local_md5="$(fingerprint "$SKILLS_DIR/$skill/SKILL.md")"
    else
      printf '%-20s %-10s %-34s %-34s\n' "$skill" "fehlt" "-" "-"
      rc=1; continue
    fi
    if fetch_upstream "$tmp_up" "$repo" "$path"; then
      up_md5="$(fingerprint "$tmp_up")"
      if [ "$local_md5" = "$up_md5" ]; then status="aktuell"
      else status="veraltet"; rc=1; fi
    else
      up_md5="-"; status="offline"; rc=1
    fi
    printf '%-20s %-10s %-34s %-34s\n' "$skill" "$status" "$local_md5" "$up_md5"
  done
  echo
  [ "$rc" -eq 0 ] && echo "Alle geprüften Skills entsprechen dem Upstream-Stand." \
    || echo "Abweichung gefunden (oder Upstream nicht erreichbar)." >&2
  exit "$rc"
fi

if [ "$MODE" = "update" ] && [ "$DRY_RUN" -eq 0 ]; then
  if [ -f "skills-lock.json" ] || [ -d "$SKILLS_DIR" ]; then
    echo "→ aktualisiere installierte Skills (npx skills update -p -y)"
    npx --yes skills update -p -y
  else
    echo "Keine installierten Skills in $RESOLVED gefunden, nichts zu aktualisieren." >&2
  fi
  echo
fi

for entry in "${SKILLS[@]}"; do
  repo="${entry%%|*}"; rest="${entry#*|}"
  skill="${rest%%|*}"

  if [ -d "$SKILLS_DIR/$skill" ]; then
    echo "✓ $skill ist schon installiert, überspringe"
    continue
  fi

  cmd=(npx --yes skills add "$repo" --skill "$skill" -a "$AGENT" -y)
  if [ "$DRY_RUN" -eq 1 ]; then
    echo "[dry-run] (in $RESOLVED) ${cmd[*]}"
  elif [ "$MODE" = "update" ]; then
    echo "[update] $skill fehlt lokal — nicht automatisch installiert (Installationspfad: ohne --update)"
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
