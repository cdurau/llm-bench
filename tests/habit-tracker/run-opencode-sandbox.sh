#!/usr/bin/env bash
# Startet OpenCode v2 (oder einen anderen Befehl) in einem Modellordner mit macOS-Schreibsperre.
# Schreiben ist im gesamten Home verboten, ausser im Modellordner, den OpenCode-Daten-/State-Ordnern,
# ~/.opencode, ~/.npm, ~/.bun und ~/.cache. ~/.config/opencode bleibt nur lesbar.
# Lesen, Netz, npm und Tools bleiben frei. /tmp und /var/folders liegen ausserhalb des Homes.
#
# OpenCode v2 nutzt sonst den Hintergrund-Dienst (`opencode serve --service`), der ausserhalb der
# Sandbox laeuft und Tools dort ausfuehren wuerde. Deshalb wird immer --standalone gesetzt
# (privater Server als Kindprozess, also ebenfalls gesperrt), --server ist verboten und die
# Dienst-Zugangsdaten (service.json) sind nicht lesbar.
#
# Nutzung:  ./run-opencode-sandbox.sh <modellordner> [opencode-argumente...]
#           ./run-opencode-sandbox.sh <modellordner> run --auto "Prompt..."
# Optional: OC_SANDBOX_EXTRA_RW="/pfad/a:/pfad/b"  zusaetzliche beschreibbare Pfade
#           OC_SANDBOX_CONFIG_RW=1                ~/.config/opencode beschreibbar machen
#           OC_SANDBOX_ALLOW_SECRETS=1            ~/.config/.secrets ganz freigeben (per {file:...} in
#                                                 opencode.json eingebundene Keys sind immer lesbar)
#           OC_SANDBOX_CMD=zsh                    statt opencode einen anderen Befehl starten
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Nutzung: $0 <modellordner> [opencode-argumente...]" >&2
  exit 2
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
TARGET="$1"
shift

# Relativer Name wird im Habit-Tracker-Ordner aufgeloest.
[ -d "$TARGET" ] || TARGET="$SCRIPT_DIR/$TARGET"
if [ ! -d "$TARGET" ]; then
  echo "Modellordner nicht gefunden: $1 (Ordner vorher anlegen und Skills installieren)" >&2
  exit 1
fi
TARGET="$(cd "$TARGET" && pwd -P)"

# Nur Ordner unterhalb von tests/habit-tracker zulassen, nie den Ordner selbst und nie tools/.
case "$TARGET" in
  "$SCRIPT_DIR/tools"|"$SCRIPT_DIR/tools"/*)
    echo "tools/ darf nicht als Schreibziel verwendet werden: $TARGET" >&2; exit 1 ;;
  "$SCRIPT_DIR"/?*) ;;
  *) echo "Modellordner muss unter $SCRIPT_DIR liegen: $TARGET" >&2; exit 1 ;;
esac

HOME_REAL="$(cd "$HOME" && pwd -P)"
CMD="${OC_SANDBOX_CMD:-opencode}"

# Hintergrund-Dienst umgehen: --standalone erzwingen, --server ablehnen.
ARGS=("$@")
if [ "$CMD" = "opencode" ]; then
  for a in ${ARGS[@]+"${ARGS[@]}"}; do
    case "$a" in
      --server|--server=*)
        echo "--server ist in der Sandbox verboten (Tools liefen sonst ausserhalb)." >&2; exit 1 ;;
    esac
  done
  case "${ARGS[0]:-}" in
    run|mini) ARGS=("${ARGS[0]}" --standalone ${ARGS[@]+"${ARGS[@]:1}"}) ;;
    ""|-*) ARGS=(--standalone ${ARGS[@]+"${ARGS[@]}"}) ;;
    *) ;; # andere Subcommands (models, session, ...) unveraendert durchreichen
  esac
fi

esc() { printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'; }

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
  IFS=':' read -r -a EXTRA <<< "$OC_SANDBOX_EXTRA_RW"
  for p in "${EXTRA[@]}"; do RW="$RW (subpath \"$(esc "$p")\")"; done
fi

DENY_READ="(subpath \"$(esc "$HOME_REAL/.ssh")\")"
DENY_READ="$DENY_READ (literal \"$(esc "$HOME_REAL/.local/state/opencode/service.json")\")"
DENY_READ="$DENY_READ (literal \"$(esc "$HOME_REAL/.config/opencode/service.json")\")"
if [ "${OC_SANDBOX_ALLOW_SECRETS:-0}" != "1" ]; then
  DENY_READ="$DENY_READ (subpath \"$(esc "$HOME_REAL/.config/.secrets")\")"
fi

# Key-Dateien, die die globale OpenCode-Config per {file:...} einbindet, bleiben lesbar
# (OpenCode braucht sie selbst); der Rest von ~/.config/.secrets bleibt gesperrt.
CONFIG_DIR="$HOME_REAL/.config/opencode"
ALLOW_READ=""
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

PROFILE="(version 1)
(allow default)
(deny file-write* (subpath \"$(esc "$HOME_REAL")\"))
(allow file-write*$RW)
(deny file-read* $DENY_READ)"
[ -n "$ALLOW_READ" ] && PROFILE="$PROFILE
(allow file-read*$ALLOW_READ)"

echo "Sandbox: schreibbar nur in $TARGET (+ OpenCode-Daten/State, ~/.opencode, ~/.npm, ~/.bun, ~/.cache)" >&2
cd "$TARGET"
exec sandbox-exec -p "$PROFILE" "$CMD" ${ARGS[@]+"${ARGS[@]}"}
