#!/usr/bin/env bash
# scripts/run_node_local.sh
# ─────────────────────────────────────────────────────────────────────────────
# Local development launcher for the ModelVerse node daemon.
#
# Usage (from the node-service root):
#   bash scripts/run_node_local.sh
#
# Prerequisites:
#   1. A Python 3.10+ virtual-env at ./.venv (create with: python -m venv .venv)
#   2. Dependencies installed:  pip install -r requirements.txt
#   3. A filled-in .env file:   cp .env.example .env && nano .env
# ─────────────────────────────────────────────────────────────────────────────
set -e   # Exit immediately on any error
set -u   # Treat unset variables as errors
set -o pipefail

# ── Resolve the script's own directory so this works from any CWD ────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "${SCRIPT_DIR}")"

cd "${PROJECT_ROOT}"

# ── Activate virtual environment ──────────────────────────────────────────────
VENV_ACTIVATE="./.venv/bin/activate"

# On Windows with Git Bash / Cygwin the activate script lives at:
# .venv/Scripts/activate  (no .bat / .ps1 extension)
if [[ ! -f "${VENV_ACTIVATE}" ]]; then
    VENV_ACTIVATE="./.venv/Scripts/activate"
fi

if [[ -f "${VENV_ACTIVATE}" ]]; then
    # shellcheck disable=SC1090
    source "${VENV_ACTIVATE}"
    echo "[run_node_local] Virtual-env activated."
else
    echo "[run_node_local] WARNING: .venv not found at ${PROJECT_ROOT}/.venv"
    echo "  To create it run:  python -m venv .venv && pip install -r requirements.txt"
    echo "  Continuing with the system Python – dependencies may be missing."
fi

# ── Start the daemon ──────────────────────────────────────────────────────────
echo "[run_node_local] Starting ModelVerse node daemon …"
python node_daemon.py
