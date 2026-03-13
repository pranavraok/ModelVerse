#!/usr/bin/env bash
# scripts/clear_cache.sh
# ─────────────────────────────────────────────────────────────────────────────
# Wipes all locally cached model files from MODEL_CACHE_DIR.
#
# Usage (from the node-service root):
#   bash scripts/clear_cache.sh
#
# Safety:
#   Prints a summary of what it will delete and asks for confirmation
#   unless --yes is passed.
#
#   bash scripts/clear_cache.sh --yes   # non-interactive mode
# ─────────────────────────────────────────────────────────────────────────────
set -e
set -u
set -o pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "${SCRIPT_DIR}")"

cd "${PROJECT_ROOT}"

# ── Resolve cache directory ───────────────────────────────────────────────────
# Prefer the value from .env, fall back to the default.
if [[ -f ".env" ]]; then
    # Extract MODEL_CACHE_DIR from .env without sourcing the whole file
    CACHE_DIR=$(grep -E '^MODEL_CACHE_DIR=' .env | cut -d'=' -f2- | tr -d '"'"'" | xargs || true)
fi
CACHE_DIR="${CACHE_DIR:-./models_cache}"

# ── Guard: directory must exist ───────────────────────────────────────────────
if [[ ! -d "${CACHE_DIR}" ]]; then
    echo "[clear_cache] Cache directory '${CACHE_DIR}' does not exist – nothing to clear."
    exit 0
fi

# ── Summary ───────────────────────────────────────────────────────────────────
FILE_COUNT=$(find "${CACHE_DIR}" -maxdepth 1 -type f | wc -l)
echo "[clear_cache] Cache directory : ${CACHE_DIR}"
echo "[clear_cache] Files to remove : ${FILE_COUNT}"

if [[ "${FILE_COUNT}" -eq 0 ]]; then
    echo "[clear_cache] Cache is already empty."
    exit 0
fi

# ── Confirmation ──────────────────────────────────────────────────────────────
NON_INTERACTIVE="${1:-}"
if [[ "${NON_INTERACTIVE}" != "--yes" ]]; then
    read -r -p "[clear_cache] Delete all ${FILE_COUNT} cached model file(s)? [y/N] " CONFIRM
    case "${CONFIRM}" in
        [yY][eE][sS]|[yY]) ;;
        *) echo "[clear_cache] Aborted."; exit 0 ;;
    esac
fi

# ── Delete ────────────────────────────────────────────────────────────────────
find "${CACHE_DIR}" -maxdepth 1 -type f -delete
echo "[clear_cache] Done – cache cleared."
