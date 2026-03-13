# `models/` — Local Model Cache

This directory is the **runtime cache** for AI model files downloaded by the node daemon.

> **Do not commit model files to Git.**  
> `*.onnx` and `*.tflite` files are excluded via `.gitignore` because they can be hundreds of MB each and are re-downloaded on demand from IPFS.

---

## Contents at runtime

| File pattern | Description |
|---|---|
| `<model_id>.onnx` | ONNX model downloaded from the ModelVerse registry |
| `<model_id>.tflite` | TensorFlow Lite variant (future support) |

The cache budget is controlled by `performance.max_model_cache_mb` in `node_config.yaml`.  
`model_cache.py` handles automatic LRU eviction when the budget is exceeded.

---

## Clearing the cache

```bash
bash scripts/clear_cache.sh
```

Or set `MODEL_CACHE_DIR` in your `.env` to any other directory.

---

## Phase 2 note

In Phase 2, `inference_engine.py` will call `model_cache.py` to check for a local hit before fetching from IPFS via `ipfs_client.py`.  The flow will be:

```
node_daemon → job_client (job assigned)
           → model_cache.get(model_id)   # cache hit?
               └─ No → ipfs_client.fetch_cid(model_cid) → model_cache.put(...)
           → inference_engine.run(inputs)
           → job_client.post_result(result)
```
