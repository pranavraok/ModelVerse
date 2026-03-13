#!/bin/bash
set -e

echo "=== ModelVerse Node Daemon Starting ==="
echo "Wallet: ${WALLET_ADDRESS}"
echo "Backend: ${BACKEND_HTTP_URL}"

# Wait for backend to be reachable
echo "Waiting for backend..."
for i in $(seq 1 20); do
  if curl -sf "${BACKEND_HTTP_URL}/docs" > /dev/null 2>&1; then
    echo "Backend is up."
    break
  fi
  echo "  attempt $i/20..."
  sleep 3
done

# Try to fetch existing node row from Supabase
echo "Looking up node for wallet ${WALLET_ADDRESS}..."
RESPONSE=$(python3 - <<'EOF'
import os, urllib.request, urllib.parse, json, sys
supabase_url = os.environ["SUPABASE_URL"]
service_key  = os.environ["SUPABASE_SERVICE_KEY"]
wallet       = os.environ["WALLET_ADDRESS"]
url = f"{supabase_url}/rest/v1/nodes?wallet_address=eq.{urllib.parse.quote(wallet)}&is_active=eq.true&limit=1"
req = urllib.request.Request(url, headers={
    "apikey": service_key,
    "Authorization": f"Bearer {service_key}",
    "Content-Type": "application/json",
})
try:
    with urllib.request.urlopen(req, timeout=10) as r:
        rows = json.loads(r.read())
        if rows:
            print(json.dumps({"node_id": rows[0]["node_id"], "api_key": rows[0]["api_key"]}))
        else:
            print(json.dumps({}))
except Exception as e:
    print(json.dumps({"error": str(e)}), file=sys.stderr)
    print(json.dumps({}))
EOF
)

NODE_ID=$(echo "$RESPONSE" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('node_id',''))" 2>/dev/null || echo "")
API_KEY=$(echo "$RESPONSE"  | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('api_key',''))"  2>/dev/null || echo "")

# If not found, register via backend
if [ -z "$NODE_ID" ] || [ -z "$API_KEY" ]; then
  echo "No existing registration. Registering with backend..."
  REG=$(python3 - <<'EOF'
import os, urllib.request, json, sys
backend = os.environ["BACKEND_HTTP_URL"]
wallet  = os.environ["WALLET_ADDRESS"]
payload = json.dumps({"node_name": f"node-{wallet[:8]}"}).encode()
req = urllib.request.Request(
    f"{backend}/api/nodes/register",
    data=payload,
    headers={"Content-Type": "application/json", "x-wallet-address": wallet},
    method="POST",
)
try:
    with urllib.request.urlopen(req, timeout=15) as r:
        print(r.read().decode())
except Exception as e:
    print(json.dumps({"error": str(e)}), file=sys.stderr)
    sys.exit(1)
EOF
)
  NODE_ID=$(echo "$REG" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('node_id',''))" 2>/dev/null || echo "")
  API_KEY=$(echo "$REG"  | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('api_key',''))"  2>/dev/null || echo "")
fi

if [ -z "$NODE_ID" ] || [ -z "$API_KEY" ]; then
  echo "ERROR: Could not obtain NODE_ID or API_KEY. Exiting."
  exit 1
fi

echo "NODE_ID = $NODE_ID"
echo "API_KEY = ${API_KEY:0:8}..."

cat > /app/.env <<ENVEOF
SUPABASE_URL=${SUPABASE_URL}
SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY}
NODE_ID=${NODE_ID}
NODE_API_KEY=${API_KEY}
WALLET_ADDRESS=${WALLET_ADDRESS}
BACKEND_HTTP_URL=${BACKEND_HTTP_URL}
NODE_PRIVATE_KEY=${NODE_PRIVATE_KEY:-}
RPC_URL=${RPC_URL:-https://rpc-amoy.polygon.technology}
POLL_INTERVAL_SECONDS=${POLL_INTERVAL_SECONDS:-5}
HEARTBEAT_INTERVAL_SECONDS=${HEARTBEAT_INTERVAL_SECONDS:-30}
LOG_LEVEL=${LOG_LEVEL:-INFO}
ENVEOF

echo "=== Starting node_daemon.py ==="
exec python3 /app/node_daemon.py