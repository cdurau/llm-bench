#!/usr/bin/env bash
# Strikte Variante von run-opencode-sandbox.sh:
# Der Agent kann nur den uebergebenen Modellordner sowie die noetigen OpenCode-/Tool-
# Speicherpfade lesen/schreiben. Das restliche Home-Verzeichnis (und damit alle
# uebergeordneten/parallem Ordner) wird fuer Lesen und Schreiben gesperrt.
#
# Systempfade (/System, /usr, /bin, ...) bleiben ausfuehrbar/lesbar, sonst wuerden
# opencode, node, npm etc. nicht laufen.
#
# Nutzung:  ./run-opencode-sandbox_strict.sh <modellordner> [opencode-argumente...]
#           OC_SANDBOX_EXTRA_RW="/pfad/a:/pfad/b"  zusaetzliche beschreibbare/lesbare Pfade
#           OC_SANDBOX_CONFIG_RW=1                ~/.config/opencode beschreibbar machen
#           OC_SANDBOX_ALLOW_SECRETS=1            ~/.config/.secrets freigeben
#           OC_SANDBOX_CMD=zsh                    statt opencode anderen Befehl
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Nutzung: $0 <modellordner> [opencode-argumente...]" >&2
  exit 2
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
TARGET="$1"
shift

[ -d "$TARGET" ] || TARGET="$SCRIPT_DIR/$TARGET"
if [ ! -d "$TARGET" ]; then
  echo "Modellordner nicht gefunden: $1" >&2
  exit 1
fi
TARGET="$(cd "$TARGET" && pwd -P)"

case "$TARGET" in
  "$SCRIPT_DIR/tools"|"$SCRIPT_DIR/tools"/*)
    echo "tools/ darf nicht als Schreibziel verwendet werden: $TARGET" >&2; exit 1 ;;
  "$SCRIPT_DIR"/?*) ;;
  *) echo "Modellordner muss unter $SCRIPT_DIR liegen: $TARGET" >&2; exit 1 ;;
esac

HOME_REAL="$(cd "$HOME" && pwd -P)"
CMD="${OC_SANDBOX_CMD:-opencode}"

ARGS=("$@")
if [ "$CMD" = "opencode" ]; then
  for a in ${ARGS[@]+"${ARGS[@]}"}; do
    case "$a" in
      --server|--server=*) echo "--server ist in der Sandbox verboten." >&2; exit 1 ;;
    esac
  done
  case "${ARGS[0]:-}" in
    run|mini) ARGS=("${ARGS[0]}" --standalone ${ARGS[@]+"${ARGS[@]:1}"}) ;;
    ""|-*) ARGS=(--standalone ${ARGS[@]+"${ARGS[@]}"}) ;;
    *) ;;
  esac
fi

esc() { printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'; }

# Pfade, die lesbar + schreibbar sein duerfen (neben TARGET).
BASE_PATHS=(
  "$TARGET"
  "$HOME_REAL/.local/share/opencode"
  "$HOME_REAL/.local/state/opencode"
  "$HOME_REAL/.opencode"
  "$HOME_REAL/.npm"
  "$HOME_REAL/.bun"
  "$HOME_REAL/.cache"
  "$HOME_REAL/.config/opencode"
)

RW=""
for p in "${BASE_PATHS[@]}"; do
  RW="$RW (subpath \"$(esc "$p")\")"
done
if [ -n "${OC_SANDBOX_EXTRA_RW:-}" ]; then
  IFS=':' read -r -a EXTRA <<< "$OC_SANDBOX_EXTRA_RW"
  for p in "${EXTRA[@]}"; do RW="$RW (subpath \"$(esc "$p")\")"; done
fi

# Schreiben: Home sperren, nur BASE + extra zulassen.
DENY_WRITE="(subpath \"$(esc "$HOME_REAL")\")"

# Lesen: ganzes Home sperren, nur BASE + extra + {file:...}-Refs zulassen.
DENY_READ="(subpath \"$(esc "$HOME_REAL")\")"
DENY_READ="$DENY_READ (subpath \"$(esc "$HOME_REAL/.ssh")\")"
DENY_READ="$DENY_READ (literal \"$(esc "$HOME_REAL/.local/state/opencode/service.json")\")"
DENY_READ="$DENY_READ (literal \"$(esc "$HOME_REAL/.config/opencode/service.json")\")"
if [ "${OC_SANDBOX_ALLOW_SECRETS:-0}" != "1" ]; then
  DENY_READ="$DENY_READ (subpath \"$(esc "$HOME_REAL/.config/.secrets")\")"
fi

CONFIG_DIR="$HOME_REAL/.config/opencode"
ALLOW_READ=""
for p in "${BASE_PATHS[@]}"; do
  ALLOW_READ="$ALLOW_READ (subpath \"$(esc "$p")\")"
done
if [ -n "${OC_SANDBOX_EXTRA_RW:-}" ]; then
  for p in "${EXTRA[@]}"; do ALLOW_READ="$ALLOW_READ (subpath \"$(esc "$p")\")"; done
fi
if [ "${OC_SANDBOX_CONFIG_RW:-0}" != "1" ]; then
  # config standardmaessig lesbar (bereits in BASE_PATHS), aber nicht schreibbar:
  # Schreibliste oben enthaelt config nur via BASE_PATHS (immer). Daher hier entfernen?
  :
fi

# Globale Agent-Skills/AGENTS (z. B. ~/.agents) bleiben lesbar, aber nicht schreibbar.
ALLOW_READ="$ALLOW_READ (subpath \"$(esc "$HOME_REAL/.agents")\")"

# {file:...}-Refs aus globaler Config bleiben lesbar.
for cfg in "$CONFIG_DIR/opencode.json" "$CONFIG_DIR/opencode.jsonc"; do
  [ -f "$cfg" ] || continue
  while IFS= read -r ref; do
    f="${ref#\{file:}"; f="${f%\}}"
    case "$f" in
      "~/"*) f="$HOME_REAL/${f#\~/}" ;;
      /*) ;;
      *) f="$CONFIG_DIR/$f" ;;
    esac
    ALLOW_READ="$ALLOW_READ (literal \"$(esc "$f")\")"
  done < <(grep -o '{file:[^}]*}' "$cfg" || true)
done

# Write_allow: BASE (TARGET + data) + config nur wenn OC_SANDBOX_CONFIG_RW=1.
RW=""
for p in "$TARGET" \
         "$HOME_REAL/.local/share/opencode" "$HOME_REAL/.local/state/opencode" \
         "$HOME_REAL/.opencode" "$HOME_REAL/.npm" "$HOME_REAL/.bun" "$HOME_REAL/.cache"; do
  RW="$RW (subpath \"$(esc "$p")\")"
done
if [ "${OC_SANDBOX_CONFIG_RW:-0}" = "1" ]; then
  RW="$RW (subpath \"$(esc "$HOME_REAL/.config/opencode")\")"
fi
if [ -n "${OC_SANDBOX_EXTRA_RW:-}" ]; then
  for p in "${EXTRA[@]}"; do RW="$RW (subpath \"$(esc "$p")\")"; done
fi

PROFILE="(version 1)
(allow default)
(deny file-write* $DENY_WRITE)
(allow file-write*$RW)
(deny file-read* $DENY_READ)
(allow file-read*$ALLOW_READ)"

echo "Sandbox (strikt): lesbar/schreibbar NUR in $TARGET (+ OpenCode-Daten/State, ~/.opencode, ~/.npm, ~/.bun, ~/.cache, ~/.config/opencode lesbar). Rest von \$HOME nicht sichtbar." >&2
cd "$TARGET"
exec sandbox-exec -p "$PROFILE" "$CMD" ${ARGS[@]+"${ARGS[@]}"}