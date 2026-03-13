"""
utils.py – Small utility helpers for ModelVerse node-service.
"""

from __future__ import annotations

import os
from pathlib import Path
from typing import Any

import yaml
from dotenv import load_dotenv

from logger import get_logger

_log = get_logger(__name__)

# ── Public helpers ────────────────────────────────────────────────────────────


def load_env(dotenv_path: str | Path | None = None) -> None:
    """
    Load environment variables from a ``.env`` file into ``os.environ``.

    Args:
        dotenv_path: Explicit path to the ``.env`` file.  When *None*
            python-dotenv searches up the directory tree from the current
            working directory (standard behaviour).
    """
    loaded: bool = load_dotenv(dotenv_path=dotenv_path, override=False)
    if loaded:
        _log.debug("Environment variables loaded from .env")
    else:
        _log.debug(".env file not found – relying on pre-set environment variables")


def load_config(config_path: str | Path = "node_config.yaml") -> dict[str, Any]:
    """
    Parse ``node_config.yaml`` and return its contents as a nested dict.

    Args:
        config_path: Path to the YAML config file.

    Returns:
        A :class:`dict` containing the parsed configuration.

    Raises:
        FileNotFoundError: If *config_path* does not exist.
        yaml.YAMLError: If the file cannot be parsed.
    """
    path = Path(config_path)
    if not path.exists():
        raise FileNotFoundError(f"Config file not found: {path.resolve()}")

    with path.open("r", encoding="utf-8") as fh:
        config: dict[str, Any] = yaml.safe_load(fh) or {}

    _log.debug("Config loaded from %s", path)
    return config


def ensure_dir(path: Path | str) -> Path:
    """
    Create *path* (and any intermediate parents) if it does not already exist.

    Args:
        path: Directory path to guarantee.

    Returns:
        The resolved :class:`pathlib.Path` of the directory.
    """
    target = Path(path)
    target.mkdir(parents=True, exist_ok=True)
    _log.debug("Directory ensured: %s", target.resolve())
    return target
