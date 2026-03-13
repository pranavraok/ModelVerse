"""
logger.py – Shared logging helper for ModelVerse node-service.

Usage:
    from logger import get_logger
    log = get_logger(__name__)
    log.info("Hello, ModelVerse!")
"""

import logging
import os
from pathlib import Path

from rich.logging import RichHandler

# ── Constants ────────────────────────────────────────────────────────────────
_LOG_DIR = Path("logs")
_LOG_FILE = _LOG_DIR / "node.log"
_DEFAULT_LEVEL = "INFO"

# Track whether the root logger has already been configured so that repeated
# calls to get_logger() don't add duplicate handlers.
_configured: bool = False


def _configure_root_logger() -> None:
    """Set up handlers on the root logger exactly once."""
    global _configured
    if _configured:
        return

    # Resolve log level from environment (default: INFO)
    raw_level: str = os.getenv("LOG_LEVEL", _DEFAULT_LEVEL).upper()
    numeric_level: int = getattr(logging, raw_level, logging.INFO)

    # Ensure the log directory exists
    _LOG_DIR.mkdir(parents=True, exist_ok=True)

    # ── Handlers ─────────────────────────────────────────────────────────────
    # 1. Rich console handler (colourised, pretty)
    console_handler = RichHandler(
        level=numeric_level,
        show_time=True,
        show_path=False,
        markup=True,
        rich_tracebacks=True,
    )

    # 2. Plain file handler (machine-readable)
    file_formatter = logging.Formatter(
        fmt="%(asctime)s [%(levelname)s] %(name)s – %(message)s",
        datefmt="%Y-%m-%dT%H:%M:%S",
    )
    file_handler = logging.FileHandler(_LOG_FILE, encoding="utf-8")
    file_handler.setLevel(numeric_level)
    file_handler.setFormatter(file_formatter)

    # ── Root logger ──────────────────────────────────────────────────────────
    root = logging.getLogger()
    root.setLevel(numeric_level)
    root.addHandler(console_handler)
    root.addHandler(file_handler)

    _configured = True


def get_logger(name: str) -> logging.Logger:
    """
    Return a named logger.  The root logger is configured with both a
    rich console handler and a rotating file handler on first call.

    Args:
        name: Typically ``__name__`` of the calling module.

    Returns:
        A :class:`logging.Logger` instance ready to use.
    """
    _configure_root_logger()
    return logging.getLogger(name)
