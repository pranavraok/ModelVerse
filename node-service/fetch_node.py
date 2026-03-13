"""
fetch_node.py — Looks up node_id/api_key from Supabase and writes /app/.env
Called by entrypoint.sh before starting node_daemon.py
"""
import sys
import json
import urllib.request
import urllib.error
import os

def fetch(url: str, key: str) -> list:
    req = urllib.request.Request(url)
    req.add_header("apikey", key)
    req.add_header("Authorization", f"Bearer {key}")
    req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            data = r.read().decode()
            return json.loads(data)
    except Exception as e:
        print(f"  fetch error: {e}")
        return []

def main():
    if len(sys.argv) < 4:
        print("Usage: fetch_node.py <supabase_url> <service_key> <wallet> [backend_url] [poll] [heartbeat] [log_level]")
        sys.exit(1)

    supabase_url  = sys.argv[1].rstrip("/")
    service_key   = sys.argv[2]
    wallet        = sys.argv[3]
    backend_url   = sys.argv[4] if len(sys.argv) > 4 else "http://host.docker.internal:8000"
    poll_interval = sys.argv[5] if len(sys.argv) > 5 else "5"
    heartbeat     = sys.argv[6] if len(sys.argv) > 6 else "30"
    log_level     = sys.argv[7] if len(sys.argv) > 7 else "INFO"

    base = f"{supabase_url}/rest/v1/nodes"
    row = None

    # Try every wallet column + case variant
    queries = [
    f"wallet_address=eq.{wallet}&is_active=eq.true&limit=1",
    f"wallet_address=eq.{wallet.lower()}&is_active=eq.true&limit=1",
    f"wallet=eq.{wallet}&is_active=eq.true&limit=1",
    f"wallet=eq.{wallet.lower()}&is_active=eq.true&limit=1",
    # Last resort: any active node
    "is_active=eq.true&limit=1",
]

    for q in queries:
        url = f"{base}?{q}"
        print(f"  trying: {q}")
        rows = fetch(url, service_key)
        if rows:
            row = rows[0]
            print(f"  SUCCESS: found node id={row.get('id')}")
            break

    if not row:
        print("ERROR: No active node found in Supabase.")
        print("Make sure you completed signup (stake + register) first.")
        sys.exit(1)

    node_id  = str(row.get("id") or row.get("node_id") or "")
    api_key  = str(row.get("api_key") or "")
    resolved = str(row.get("wallet") or row.get("wallet_address") or wallet)

    if not node_id or not api_key:
        print(f"ERROR: Node row missing id or api_key. Row: {row}")
        sys.exit(1)

    print(f"NODE_ID         = {node_id}")
    print(f"RESOLVED_WALLET = {resolved}")
    print(f"API_KEY         = {api_key[:8]}...")

    env_path = "/app/.env"
    env_content = "\n".join([
        f"SUPABASE_URL={supabase_url}",
        f"SUPABASE_SERVICE_KEY={service_key}",
        f"NODE_ID={node_id}",
        f"NODE_API_KEY={api_key}",
        f"WALLET_ADDRESS={resolved}",
        f"BACKEND_HTTP_URL={backend_url}",
        f"POLL_INTERVAL_SECONDS={poll_interval}",
        f"HEARTBEAT_INTERVAL_SECONDS={heartbeat}",
        "MODEL_CACHE_DIR=/app/models_cache",
        "IPFS_GATEWAYS=https://ipfs.io/ipfs,https://cloudflare-ipfs.com/ipfs,https://gateway.pinata.cloud/ipfs",
        f"LOG_LEVEL={log_level}",
        "",
    ])

    try:
        with open(env_path, "w") as f:
            f.write(env_content)
        print(f".env written to {env_path}")
    except Exception as e:
        print(f"ERROR writing .env: {e}")
        # Try alternate path
        with open(".env", "w") as f:
            f.write(env_content)
        print(".env written to current directory")

if __name__ == "__main__":
    main()