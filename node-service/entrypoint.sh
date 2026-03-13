#!/bin/sh
set -e

: "${SUPABASE_URL:?SUPABASE_URL is required}"
: "${SUPABASE_SERVICE_KEY:?SUPABASE_SERVICE_KEY is required}"
: "${WALLET_ADDRESS:?WALLET_ADDRESS is required}"

BACKEND_HTTP_URL="${BACKEND_HTTP_URL:-http://host.docker.internal:8000}"

echo "=== ModelVerse Node entrypoint ==="
echo "SUPABASE_URL     = ${SUPABASE_URL}"
echo "WALLET_ADDRESS   = ${WALLET_ADDRESS}"
echo "BACKEND_HTTP_URL = ${BACKEND_HTTP_URL}"

# Wait for backend — 5 attempts, 2s apart
MAX_ATTEMPTS=5
ATTEMPT=0
until wget -q --spider "${BACKEND_HTTP_URL}/health" 2>/dev/null; do
    ATTEMPT=$((ATTEMPT + 1))
    if [ "${ATTEMPT}" -ge "${MAX_ATTEMPTS}" ]; then
        echo "Backend not reachable — continuing anyway"
        break
    fi
    echo "  attempt ${ATTEMPT}/${MAX_ATTEMPTS}..."
    sleep 2
done

echo "Looking up node for wallet ${WALLET_ADDRESS}..."

python3 /app/fetch_node.py \
    "${SUPABASE_URL}" \
    "${SUPABASE_SERVICE_KEY}" \
    "${WALLET_ADDRESS}" \
    "${BACKEND_HTTP_URL}" \
    "${POLL_INTERVAL_SECONDS:-5}" \
    "${HEARTBEAT_INTERVAL_SECONDS:-30}" \
    "${LOG_LEVEL:-INFO}"

echo "=== Starting node_daemon.py ==="
exec python3 /app/node_daemon.py