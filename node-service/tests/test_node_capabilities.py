from __future__ import annotations

from node_capabilities import load_capabilities_from_config


def test_load_capabilities_from_config_maps_fields() -> None:
    config = {
        "capabilities": {
            "gpu": True,
            "gpu_memory_gb": 12,
            "supported_tasks": ["image-classification", "tabular-regression"],
            "max_concurrent_jobs": 3,
            "region": "IN-BLR",
        }
    }

    caps = load_capabilities_from_config(config)

    assert caps.gpu is True
    assert caps.gpu_memory_gb == 12
    assert caps.supported_tasks == ["image-classification", "tabular-regression"]
    assert caps.max_concurrent_jobs == 3
    assert caps.region == "IN-BLR"
