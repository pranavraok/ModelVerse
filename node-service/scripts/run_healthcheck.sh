#!/usr/bin/env bash
# scripts/run_healthcheck.sh
# ─────────────────────────────────────────────────────────────────────────────
# Standalone script to run the ModelVerse node pre-flight healthcheck.
#
# Usage (from the node-service root):
#   bash scripts/run_healthcheck.sh
#
# Exit codes:
#   0 – All checks passed.
#   1 – One or more checks failed (see log output for details).
# ─────────────────────────────────────────────────────────────────────────────
set -e
set -u
set -o pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "${SCRIPT_DIR}")"

cd "${PROJECT_ROOT}"

# ── Activate virtual environment (same logic as run_node_local.sh) ────────────
VENV_ACTIVATE="./.venv/bin/activate"
if [[ ! -f "${VENV_ACTIVATE}" ]]; then
    VENV_ACTIVATE="./.venv/Scripts/activate"
fi

if [[ -f "${VENV_ACTIVATE}" ]]; then
    # shellcheck disable=SC1090
    source "${VENV_ACTIVATE}"
    echo "[run_healthcheck] Virtual-env activated."
else
    echo "[run_healthcheck] WARNING: .venv not found – using system Python."
fi

# ── Run healthcheck module directly ──────────────────────────────────────────
echo "[run_healthcheck] Running ModelVerse node healthcheck …"
python - <<'EOF'
from utils import load_env
load_env()
from healthcheck import run_healthcheck
import sys
ok = run_healthcheck()
sys.exit(0 if ok else 1)
EOF
