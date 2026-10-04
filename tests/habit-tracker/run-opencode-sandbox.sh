#!/usr/bin/env bash
set -Eeuo pipefail

# ============================================================
# OpenCode V2 Benchmark Sandbox
#
# Verwendung:
#   ./run-opencode-sandbox.sh <modell-ordner> [OpenCode-Argumente...]
#
# Beispiele:
#   ./run-opencode-sandbox.sh gpt-oss-20b-mlx-oQ8-fp16
#   ./run-opencode-sandbox.sh Cyber-Tiel-Coder-35B-A3B-MLX-oQ4e-MTP
#
# Image neu bauen:
#   REBUILD=1 ./run-opencode-sandbox.sh gpt-oss-20b-mlx-oQ8-fp16
# ============================================================

IMAGE="${OPENCODE_IMAGE:-opencode-v2-bench:latest}"

# Der Ordner, in dem dieses Script liegt, ist automatisch unser Benchmark-Root.
ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"

usage() {
    cat <<EOF
Verwendung:
  $(basename "$0") <modell-ordner> [OpenCode-Argumente...]

Beispiel:
  $(basename "$0") gpt-oss-20b-mlx-oQ8-fp16

Optional:
  REBUILD=1 $(basename "$0") gpt-oss-20b-mlx-oQ8-fp16

Benchmark-Root:
  $ROOT
EOF
}

# ------------------------------------------------------------
# Argument prüfen
# ------------------------------------------------------------

if [[ $# -lt 1 ]]; then
    usage
    exit 1
fi

MODEL_DIR="$1"
shift

# Alle weiteren Argumente werden an OpenCode weitergegeben.
OPENCODE_ARGS=("$@")

# Offensichtlich gefährliche Ziele direkt ablehnen.
if [[ "$MODEL_DIR" == "." || "$MODEL_DIR" == ".." || "$MODEL_DIR" == "/" ]]; then
    echo "❌ Ungültiger Zielordner: $MODEL_DIR"
    exit 1
fi

TARGET_CANDIDATE="$ROOT/$MODEL_DIR"

if [[ ! -d "$TARGET_CANDIDATE" ]]; then
    echo "❌ Modellordner existiert nicht:"
    echo "   $TARGET_CANDIDATE"
    echo
    echo "Verfügbare Ordner:"
    find "$ROOT" -mindepth 1 -maxdepth 1 -type d -print | sed "s|$ROOT/|  - |"
    exit 1
fi

# Physikalischen Pfad auflösen, damit Symlinks nicht aus der Sandbox führen.
TARGET="$(cd "$TARGET_CANDIDATE" && pwd -P)"
ROOT_REAL="$(cd "$ROOT" && pwd -P)"

case "$TARGET" in
    "$ROOT_REAL"/*)
        ;;
    *)
        echo "❌ Sicherheitscheck fehlgeschlagen."
        echo "   Ziel liegt außerhalb von:"
        echo "   $ROOT_REAL"
        exit 1
        ;;
esac

# tools soll niemals versehentlich als RW-Ziel gestartet werden.
if [[ "$TARGET" == "$ROOT_REAL/tools" ]]; then
    echo "❌ Der tools-Ordner darf nicht als Schreibziel verwendet werden."
    exit 1
fi

# ------------------------------------------------------------
# Docker prüfen
# ------------------------------------------------------------

if ! command -v docker >/dev/null 2>&1; then
    echo "❌ Docker wurde nicht gefunden."
    exit 1
fi

if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker läuft nicht."
    exit 1
fi

# ------------------------------------------------------------
# OpenCode-V2-Image bauen
# ------------------------------------------------------------

build_image() {
    echo "🔨 Baue OpenCode-V2-Sandbox-Image..."

    docker build \
        -t "$IMAGE" \
        -f - \
        "$ROOT" <<'DOCKERFILE'
FROM node:22-bookworm-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        bash \
        git \
        curl \
        ripgrep \
        jq \
        python3 \
        ca-certificates \
        procps \
        findutils && \
    rm -rf /var/lib/apt/lists/*

# Offizielles OpenCode-V2-NPM-Paket
RUN npm install -g @opencode/cli

RUN mkdir -p \
    /home/opencode \
    /host/opencode-config \
    /run/secrets

ENV HOME=/home/opencode

WORKDIR /workspace

CMD ["/bin/bash"]
DOCKERFILE

    echo "✅ Image gebaut: $IMAGE"
}

if [[ "${REBUILD:-0}" == "1" ]]; then
    build_image
elif ! docker image inspect "$IMAGE" >/dev/null 2>&1; then
    echo "ℹ️ OpenCode-V2-Image wurde noch nicht gefunden."
    build_image
fi

# ------------------------------------------------------------
# Container-Argumente
# ------------------------------------------------------------

DOCKER_ARGS=(
    run
    --rm
    -it

    # Container selbst read-only.
    --read-only

    # Keine zusätzlichen Linux-Capabilities.
    --cap-drop
    ALL

    # Keine Privilege Escalation.
    --security-opt
    no-new-privileges

    # Prozess-Limit als zusätzliche Absicherung.
    --pids-limit
    512

    # Temporärer beschreibbarer Speicher.
    --tmpfs
    /tmp:rw,nosuid,nodev,size=2g

    --tmpfs
    /home/opencode:rw,nosuid,nodev,size=2g

    # HOME für OpenCode.
    -e
    HOME=/home/opencode

    # Terminal/TUI.
    -e
    "TERM=${TERM:-xterm-256color}"

    -e
    "COLORTERM=${COLORTERM:-truecolor}"

    # --------------------------------------------------------
    # WICHTIG:
    # gesamter habit-tracker nur lesbar
    # --------------------------------------------------------
    --mount
    "type=bind,src=$ROOT_REAL,dst=/workspace,readonly"

    # --------------------------------------------------------
    # nur der ausgewählte Modellordner beschreibbar
    # --------------------------------------------------------
    --mount
    "type=bind,src=$TARGET,dst=/workspace/$MODEL_DIR"

    # OpenCode startet direkt im Modellordner.
    --workdir
    "/workspace/$MODEL_DIR"
)

# ------------------------------------------------------------
# Normale OpenCode-Konfiguration einbinden
# ------------------------------------------------------------

HOST_CONFIG="$HOME/.config/opencode"

if [[ -d "$HOST_CONFIG" ]]; then
    DOCKER_ARGS+=(
        --mount
        "type=bind,src=$HOST_CONFIG,dst=/host/opencode-config,readonly"
    )
fi

# Nur auth.json übernehmen, nicht die komplette Session-Datenbank.
HOST_AUTH="$HOME/.local/share/opencode/auth.json"

if [[ -f "$HOST_AUTH" ]]; then
    DOCKER_ARGS+=(
        --mount
        "type=bind,src=$HOST_AUTH,dst=/run/secrets/opencode-auth.json,readonly"
    )
fi

# ------------------------------------------------------------
# Info
# ------------------------------------------------------------

echo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " OpenCode V2 Sandbox"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo
echo "Benchmark Root:"
echo "  🔵 RO  $ROOT_REAL"
echo
echo "Schreibbarer Modellordner:"
echo "  🟢 RW  $TARGET"
echo
echo "Tools:"
echo "  🔵 RO  $ROOT_REAL/tools"
echo
echo "Im Container:"
echo "  Root:   /workspace"
echo "  Target: /workspace/$MODEL_DIR"
echo "  Tools:  /workspace/tools"
echo
echo "OpenCode:"
echo "  ✅ V2"
echo "  ✅ Auto Mode"
echo "  ✅ Standalone"
echo "  ✅ normale globale Config"
echo "  ✅ normale CLI Settings"
echo "  ✅ globale Skills/Agents"
echo "  ✅ Provider-Auth, falls vorhanden"
echo
echo "Host Home, SSH, Desktop usw.:"
echo "  ⛔ nicht gemountet"
echo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo

# ------------------------------------------------------------
# Container starten
# ------------------------------------------------------------

docker "${DOCKER_ARGS[@]}" \
    "$IMAGE" \
    bash -lc '
        set -e

        mkdir -p \
            "$HOME/.config/opencode" \
            "$HOME/.local/share/opencode" \
            "$HOME/.cache" \
            "$HOME/.npm"

        # Normale OpenCode-Konfiguration in den temporären HOME kopieren.
        # Änderungen daran verschwinden beim Beenden des Containers.
        if [ -d /host/opencode-config ]; then
            cp -a /host/opencode-config/. "$HOME/.config/opencode/" 2>/dev/null || true
        fi

        # Provider-Authentifizierung übernehmen.
        if [ -f /run/secrets/opencode-auth.json ]; then
            cp /run/secrets/opencode-auth.json \
               "$HOME/.local/share/opencode/auth.json"

            chmod 600 "$HOME/.local/share/opencode/auth.json"
        fi

        echo "OpenCode-Version:"
        opencode --version
        echo

        exec opencode --standalone --auto "$@"
    ' bash "${OPENCODE_ARGS[@]}"
