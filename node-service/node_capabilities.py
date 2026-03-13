from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class NodeCapabilities(BaseModel):
    gpu: bool = False
    gpu_memory_gb: int | None = None
    supported_tasks: list[str] = Field(default_factory=lambda: ["image-classification"])
    max_concurrent_jobs: int = 1
    region: str | None = None


def load_capabilities_from_config(config: dict[str, Any]) -> NodeCapabilities:
    """Read node_config.yaml and map its fields into NodeCapabilities."""
    raw = config.get("capabilities", {}) if isinstance(config, dict) else {}
    return NodeCapabilities(
        gpu=bool(raw.get("gpu", False)),
        gpu_memory_gb=raw.get("gpu_memory_gb"),
        supported_tasks=list(raw.get("supported_tasks", ["image-classification"])),
        max_concurrent_jobs=int(raw.get("max_concurrent_jobs", 1)),
        region=raw.get("region"),
    )
