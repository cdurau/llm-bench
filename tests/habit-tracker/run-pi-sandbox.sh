#!/usr/bin/env bash
# Startet Pi (oder einen anderen Befehl) in einem Modellordner mit macOS-Schreibsperre.
# Schreiben ist im gesamten Home verboten, ausser im Modellordner, ~/.pi, ~/.npm und ~/.cache.
# Lesen, Netz, npm und Tools bleiben frei. /tmp und /var/folders liegen ausserhalb des Homes.
#
# Nutzung:  ./run-pi-sandbox.sh <modellordner> [pi-argumente...]
# Optional: PI_SANDBOX_EXTRA_RW="/pfad/a:/pfad/b"  zusaetzliche beschreibbare Pfade
#           PI_SANDBOX_ALLOW_SECRETS=1             ~/.config/.secrets nicht sperren
#           PI_SANDBOX_CMD=zsh                     statt pi einen anderen Befehl starten
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Nutzung: $0 <modellordner> [pi-argumente...]" >&2
  exit 2
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET="$1"
shift

# Relativer Name wird im Habit-Tracker-Ordner aufgeloest.
[ -d "$TARGET" ] || TARGET="$SCRIPT_DIR/$TARGET"
if [ ! -d "$TARGET" ]; then
  echo "Modellordner nicht gefunden: $1 (Ordner vorher anlegen und Skills installieren)" >&2
  exit 1
fi
TARGET="$(cd "$TARGET" && pwd -P)"

# Nur Ordner unterhalb von tests/habit-tracker zulassen, nie den Ordner selbst.
case "$TARGET" in
  "$SCRIPT_DIR"/?*) ;;
  *) echo "Modellordner muss unter $SCRIPT_DIR liegen: $TARGET" >&2; exit 1 ;;
esac

HOME_REAL="$(cd "$HOME" && pwd -P)"
CMD="${PI_SANDBOX_CMD:-pi}"

esc() { printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'; }

RW=""
for p in "$TARGET" "$HOME_REAL/.pi" "$HOME_REAL/.npm" "$HOME_REAL/.cache"; do
  RW="$RW (subpath \"$(esc "$p")\")"
done
if [ -n "${PI_SANDBOX_EXTRA_RW:-}" ]; then
  IFS=':' read -r -a EXTRA <<< "$PI_SANDBOX_EXTRA_RW"
  for p in "${EXTRA[@]}"; do RW="$RW (subpath \"$(esc "$p")\")"; done
fi

DENY_READ="(subpath \"$(esc "$HOME_REAL/.ssh")\")"
if [ "${PI_SANDBOX_ALLOW_SECRETS:-0}" != "1" ]; then
  DENY_READ="$DENY_READ (subpath \"$(esc "$HOME_REAL/.config/.secrets")\")"
fi

PROFILE="(version 1)
(allow default)
(deny file-write* (subpath \"$(esc "$HOME_REAL")\"))
(allow file-write*$RW)
(deny file-read* $DENY_READ)"

echo "Sandbox: schreibbar nur in $TARGET (+ ~/.pi, ~/.npm, ~/.cache)" >&2
cd "$TARGET"
exec sandbox-exec -p "$PROFILE" "$CMD" "$@"
