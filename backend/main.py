import os
import uuid
import json
import asyncio
import logging
import base64
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Literal
from contextlib import suppress
from urllib.parse import quote

from fastapi import Depends, FastAPI, HTTPException, Header, Query, WebSocket, WebSocketDisconnect, status
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from supabase import Client, create_client

app = FastAPI()
logger = logging.getLogger("modelverse.web3")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load .env from the backend folder (works reliably in Windows PowerShell).
env_path = Path(__file__).resolve().parent / ".env"
loaded = load_dotenv(dotenv_path=env_path)

print("[DEBUG] dotenv path:", str(env_path))
print("[DEBUG] dotenv exists:", env_path.exists())
print("[DEBUG] dotenv loaded:", loaded)

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_KEY")

print("[DEBUG] SUPABASE_URL:", url if url else "MISSING")
print("[DEBUG] SUPABASE_SERVICE_KEY:", (key[:20] + "...") if key else "MISSING")

missing = []
if not url:
    missing.append("SUPABASE_URL")
if not key:
    missing.append("SUPABASE_SERVICE_KEY")

if missing:
    raise RuntimeError(
        "Missing required environment variables: "
        + ", ".join(missing)
        + ". Ensure backend/.env exists and contains these keys."
    )

supabase: Client = create_client(url, key)

# Web3 config (Polygon Amoy). Signature verification can be added later.
ALCHEMY_WS_URL = os.getenv(
    "ALCHEMY_WS_URL",
    "wss://polygon-amoy.g.alchemy.com/v2/OijSDtF_raXNkm2F94m1s",
)
MODEL_REGISTRY_ADDRESS = os.getenv(
    "MODEL_REGISTRY_ADDRESS", "0x818e9Df23c8A2B61b7796b0A081C0bA1014d1d91"
)
JOB_MANAGER_ADDRESS = os.getenv(
    "JOB_MANAGER_ADDRESS", "0xB6271a63c01d651CEbF6F22FE411aB4cf1465195"
)
_web3_listener_task: asyncio.Task | None = None
active_nodes: Dict[str, WebSocket] = {}

# 1x1 red PNG, used only as a fallback when jobs table does not yet store input_base64.
_DUMMY_INPUT_BASE64 = (
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADUlEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC"
)


# ─────────────────────────── Pydantic models ────────────────────────────────

class SignupRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: str
    password: str = Field(min_length=8)
    role: Literal["creator", "buyer", "node-operator"]


class LoginRequest(BaseModel):
    email: str
    password: str = Field(min_length=8)


class SelectRoleRequest(BaseModel):
    role: Literal["creator", "buyer", "node-operator"]


# ─────────────────────────── Supabase helpers ───────────────────────────────

def _response_to_dict(response: Any) -> dict[str, Any]:
    if isinstance(response, dict):
        return response
    data = getattr(response, "model_dump", None)
    if callable(data):
        return data()
    as_dict = getattr(response, "dict", None)
    if callable(as_dict):
        return as_dict()
    return {}


def _extract_auth_payload(response: Any) -> tuple[dict[str, Any], dict[str, Any], str | None]:
    payload = _response_to_dict(response)
    if not payload:
        return {}, {}, None
    user = payload.get("user") or {}
    session = payload.get("session") or {}
    access_token = session.get("access_token")
    return payload, user, access_token


def _parse_bearer_token(authorization: str | None) -> str:
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header",
        )
    parts = authorization.strip().split(" ", 1)
    if len(parts) != 2 or parts[0].lower() != "bearer" or not parts[1].strip():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Authorization header format",
        )
    return parts[1].strip()


def _get_user_from_token(token: str) -> dict[str, Any]:
    try:
        user_response = supabase.auth.get_user(token)
        payload = _response_to_dict(user_response)
        user = payload.get("user") or {}
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
            )
        return user
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Failed to validate token: {exc}",
        ) from exc


def _get_wallet_from_header(
    x_wallet_address: str | None = Header(default=None, alias="x-wallet-address"),
) -> str:
    wallet = (x_wallet_address or "").strip().lower()
    if not wallet:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing x-wallet-address header",
        )
    return wallet


def _find_profile(wallet: str) -> dict[str, Any] | None:
    # Support either wallet or wallet_address column naming.
    try:
        response = (
            supabase.table("profiles")
            .select("wallet,role")
            .eq("wallet", wallet)
            .limit(1)
            .execute()
        )
        if response.data:
            return response.data[0]
    except Exception:
        pass

    try:
        response = (
            supabase.table("profiles")
            .select("wallet_address,role")
            .eq("wallet_address", wallet)
            .limit(1)
            .execute()
        )
        if response.data:
            row = response.data[0]
            return {"wallet": row.get("wallet_address"), "role": row.get("role")}
    except Exception:
        pass

    return None


def _create_default_profile(wallet: str) -> dict[str, Any]:
    payload = {"wallet": wallet, "role": "buyer"}
    try:
        response = supabase.table("profiles").insert(payload).execute()
        if response.data:
            row = response.data[0]
            return {"wallet": row.get("wallet", wallet), "role": row.get("role", "buyer")}
    except Exception:
        # Fallback if schema still uses wallet_address.
        fallback_payload = {"wallet_address": wallet, "role": "buyer"}
        response = supabase.table("profiles").insert(fallback_payload).execute()
        if response.data:
            row = response.data[0]
            return {
                "wallet": row.get("wallet_address", wallet),
                "role": row.get("role", "buyer"),
            }
    return {"wallet": wallet, "role": "buyer"}


def _get_node_by_wallet_and_api_key(wallet: str, api_key: str) -> dict[str, Any] | None:
    """
    Fetch active node row by wallet + api_key.
    Tries common wallet column variants: wallet, wallet_address, operator_wallet.
    Returns the first matching row, or None if not found / on error.
    """
    candidates = ("wallet", "wallet_address", "operator_wallet")
    for wallet_col in candidates:
        try:
            response = (
                supabase.table("nodes")
                .select("*")
                .eq(wallet_col, wallet)
                .eq("api_key", api_key)
                .eq("status", "active")
                .limit(1)
                .execute()
            )
            if response.data:
                return response.data[0]
        except Exception:
            continue
    return None


def _extract_creator_wallet(job_row: dict[str, Any]) -> str:
    return (
        str(job_row.get("creator_wallet") or "").strip()
        or str(job_row.get("creator_address") or "").strip()
        or "0x0000000000000000000000000000000000000000"
    )


def _build_job_payload(job_row: dict[str, Any]) -> dict[str, Any]:
    return {
        "type": "job_assigned",
        "job": {
            "job_id": str(job_row.get("id") or ""),
            "model_cid": str(job_row.get("model_cid") or "QmPlaceholderModelCid"),
            "model_input_type": str(job_row.get("model_input_type") or "image"),
            "input_base64": str(job_row.get("input_base64") or _DUMMY_INPUT_BASE64),
            "creator_address": _extract_creator_wallet(job_row),
        },
    }


# ─────────────────────────── WebSocket helpers ──────────────────────────────

async def _reject_websocket(websocket: WebSocket, detail: str) -> None:
    """
    Cleanly reject a WebSocket before accept() is called.
    Uses close(code=1008) — Policy Violation — which avoids the ASGI
    RuntimeError that occurs when HTTPException is raised inside a WS scope.
    """
    with suppress(Exception):
        await websocket.close(code=1008)
    logger.info("WS rejected: %s", detail)


# ─────────────────────────── Auth dependency ────────────────────────────────

def get_current_user(wallet: str = Depends(_get_wallet_from_header)) -> dict[str, Any]:
    profile = _find_profile(wallet)
    if profile:
        return {"wallet": profile.get("wallet", wallet), "role": profile.get("role", "buyer")}
    return _create_default_profile(wallet)


# ─────────────────────────── Web3 listener ──────────────────────────────────

async def _web3_event_listener() -> None:
    """Background listener for Polygon Amoy events (hackathon-safe, reconnecting)."""
    try:
        import websockets
    except ImportError:
        logger.warning("websockets package not installed; skipping Web3 listener startup")
        return

    while True:
        try:
            async with websockets.connect(ALCHEMY_WS_URL, ping_interval=20, ping_timeout=20) as ws:
                logger.info("Connected to Polygon Amoy websocket")

                await ws.send(json.dumps({
                    "jsonrpc": "2.0", "id": 1,
                    "method": "eth_subscribe", "params": ["newHeads"],
                }))
                _ = await ws.recv()

                await ws.send(json.dumps({
                    "jsonrpc": "2.0", "id": 2,
                    "method": "eth_subscribe",
                    "params": ["logs", {"address": MODEL_REGISTRY_ADDRESS}],
                }))
                _ = await ws.recv()

                await ws.send(json.dumps({
                    "jsonrpc": "2.0", "id": 3,
                    "method": "eth_subscribe",
                    "params": ["logs", {"address": JOB_MANAGER_ADDRESS}],
                }))
                _ = await ws.recv()

                while True:
                    raw = await ws.recv()
                    message = json.loads(raw)
                    if message.get("method") != "eth_subscription":
                        continue
                    params = message.get("params", {})
                    result = params.get("result", {})
                    if "number" in result:
                        logger.info("New block: %s", result.get("number"))
                    elif "transactionHash" in result:
                        logger.info(
                            "Contract log from %s tx=%s",
                            result.get("address"),
                            result.get("transactionHash"),
                        )

        except asyncio.CancelledError:
            raise
        except Exception as exc:
            logger.warning("Web3 listener disconnected (%s); reconnecting in 3s", exc)
            await asyncio.sleep(3)


@app.on_event("startup")
async def _start_web3_listener() -> None:
    global _web3_listener_task
    if _web3_listener_task is None or _web3_listener_task.done():
        _web3_listener_task = asyncio.create_task(_web3_event_listener())


@app.on_event("shutdown")
async def _stop_web3_listener() -> None:
    global _web3_listener_task
    if _web3_listener_task is not None:
        _web3_listener_task.cancel()
        with suppress(asyncio.CancelledError):
            await _web3_listener_task
        _web3_listener_task = None


# ─────────────────────────── Auth routes ────────────────────────────────────

@app.post("/auth/signup")
def auth_signup(payload: SignupRequest):
    try:
        response = supabase.auth.sign_up({
            "email": payload.email,
            "password": payload.password,
            "options": {"data": {"name": payload.name, "role": payload.role}},
        })
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Signup failed: {exc}") from exc

    _, user, access_token = _extract_auth_payload(response)
    if not user:
        raise HTTPException(status_code=400, detail="Signup failed: no user returned")

    metadata = user.get("user_metadata") or {}
    return {
        "message": "Signup successful",
        "user": {
            "id": user.get("id"),
            "email": user.get("email"),
            "name": metadata.get("name"),
            "role": metadata.get("role"),
        },
        "access_token": access_token,
        "needs_role_selection": not bool(metadata.get("role")),
    }


@app.post("/auth/login")
def auth_login(payload: LoginRequest):
    try:
        response = supabase.auth.sign_in_with_password(
            {"email": payload.email, "password": payload.password}
        )
    except Exception as exc:
        raise HTTPException(status_code=401, detail=f"Login failed: {exc}") from exc

    _, user, access_token = _extract_auth_payload(response)
    if not user or not access_token:
        raise HTTPException(status_code=401, detail="Login failed: invalid credentials")

    metadata = user.get("user_metadata") or {}
    return {
        "message": "Login successful",
        "user": {
            "id": user.get("id"),
            "email": user.get("email"),
            "name": metadata.get("name"),
            "role": metadata.get("role"),
        },
        "access_token": access_token,
        "role": metadata.get("role"),
        "needs_role_selection": not bool(metadata.get("role")),
    }


@app.get("/auth/me")
def auth_me(authorization: str | None = Header(default=None, alias="Authorization")):
    token = _parse_bearer_token(authorization)
    user = _get_user_from_token(token)
    metadata = user.get("user_metadata") or {}
    return {
        "user": {
            "id": user.get("id"),
            "email": user.get("email"),
            "name": metadata.get("name"),
            "role": metadata.get("role"),
        }
    }


@app.post("/auth/select-role")
def auth_select_role(
    payload: SelectRoleRequest,
    authorization: str | None = Header(default=None, alias="Authorization"),
):
    token = _parse_bearer_token(authorization)
    user = _get_user_from_token(token)
    user_id = user.get("id")
    if not user_id:
        raise HTTPException(status_code=401, detail="User id missing in token payload")

    current_metadata = user.get("user_metadata") or {}
    new_metadata = {**current_metadata, "role": payload.role}

    try:
        supabase.auth.admin.update_user_by_id(user_id, {"user_metadata": new_metadata})
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Role update failed: {exc}") from exc

    return {
        "message": "Role updated",
        "role": payload.role,
        "user": {
            "id": user_id,
            "email": user.get("email"),
            "name": new_metadata.get("name"),
            "role": payload.role,
        },
    }


# ─────────────────────────── General routes ─────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/me")
def me(current_user: dict[str, Any] = Depends(get_current_user)):
    return {"wallet": current_user["wallet"], "role": current_user["role"]}


@app.get("/models")
def list_models(current_user: dict[str, Any] = Depends(get_current_user)):
    response = supabase.table("models").select("*").execute()
    return {"wallet": current_user["wallet"], "items": response.data or []}


@app.get("/api/models")
def list_models_api(
    category: str | None = Query(default=None),
    limit: int = Query(default=10, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    current_user: dict[str, Any] = Depends(get_current_user),
):
    query = supabase.table("models").select("*")
    if category:
        query = query.eq("category", category)

    response = query.range(offset, offset + limit - 1).execute()
    return {
        "wallet": current_user["wallet"],
        "items": response.data or [],
        "pagination": {
            "category": category,
            "limit": limit,
            "offset": offset,
            "count": len(response.data or []),
        },
    }


# ─────────────────────────── Node routes ────────────────────────────────────

@app.post("/api/nodes/register")
def register_node(current_user: dict[str, Any] = Depends(get_current_user)):
    wallet = current_user["wallet"]
    api_key = str(uuid.uuid4())
    generated_node_id = str(uuid.uuid4())

    row = None
    payload = {
        "id": generated_node_id,
        "wallet": wallet,
        "api_key": api_key,
        "status": "active",
    }

    try:
        response = supabase.table("nodes").insert(payload).execute()
        if response.data:
            row = response.data[0]
    except Exception:
        # Fallback for alternative wallet column naming.
        fallback_payload = {
            "id": generated_node_id,
            "operator_wallet": wallet,
            "api_key": api_key,
            "status": "active",
        }
        response = supabase.table("nodes").insert(fallback_payload).execute()
        if response.data:
            row = response.data[0]

    if not row:
        return {"node_id": generated_node_id, "api_key": api_key}

    return {
        "node_id": row.get("id", generated_node_id),
        "api_key": row.get("api_key", api_key),
    }


@app.post("/api/nodes/heartbeat")
async def node_heartbeat(current_user: dict[str, Any] = Depends(get_current_user)):
    """
    HTTP heartbeat endpoint for node-service.
    Node sends POST /api/nodes/heartbeat with x-wallet-address header.
    This avoids the pattern of opening a new WS connection per heartbeat.
    """
    wallet = str(current_user["wallet"]).strip().lower()
    now_iso = datetime.now(timezone.utc).isoformat()

    # Best-effort update of last_seen_at — column may not exist on all schemas.
    updated = False
    for wallet_col in ("wallet", "wallet_address", "operator_wallet"):
        try:
            supabase.table("nodes").update({"last_seen_at": now_iso}).eq(
                wallet_col, wallet
            ).execute()
            updated = True
            break
        except Exception:
            continue

    logger.debug("Heartbeat: wallet=%s updated_last_seen=%s", wallet, updated)
    return {
        "status": "alive",
        "wallet": wallet,
        "updated_last_seen": updated,
    }


# ─────────────────────────── Jobs route ─────────────────────────────────────

@app.get("/api/jobs")
def list_jobs(current_user: dict[str, Any] = Depends(get_current_user)):
    wallet = current_user["wallet"]

    buyer_jobs = (
        supabase.table("jobs")
        .select("*")
        .eq("buyer_wallet", wallet)
        .execute()
        .data
        or []
    )

    node_jobs: list[dict[str, Any]] = []
    try:
        node_jobs = (
            supabase.table("jobs")
            .select("*,nodes:assigned_node_id(wallet)")
            .eq("nodes.wallet", wallet)
            .execute()
            .data
            or []
        )
    except Exception:
        # Fallback: resolve wallet → node ids → jobs.
        node_rows: list[dict[str, Any]] = []
        try:
            node_rows = (
                supabase.table("nodes")
                .select("id")
                .eq("wallet", wallet)
                .execute()
                .data
                or []
            )
        except Exception:
            node_rows = (
                supabase.table("nodes")
                .select("id")
                .eq("operator_wallet", wallet)
                .execute()
                .data
                or []
            )

        node_ids = [row.get("id") for row in node_rows if row.get("id")]
        if node_ids:
            node_jobs = (
                supabase.table("jobs")
                .select("*")
                .in_("assigned_node_id", node_ids)
                .execute()
                .data
                or []
            )

    merged: dict[str, dict[str, Any]] = {}
    for job in buyer_jobs + node_jobs:
        job_id = str(job.get("id") or uuid.uuid4())
        merged[job_id] = job

    return {"wallet": wallet, "items": list(merged.values()), "count": len(merged)}


# ─────────────────────────── WebSocket /ws/jobs ─────────────────────────────

@app.websocket("/ws/jobs")
async def ws_jobs(
    websocket: WebSocket,
    x_wallet_address: str | None = Header(default=None, alias="x-wallet-address"),
    x_node_api_key: str | None = Header(default=None, alias="x-node-api-key"),
    api_key_query: str | None = Query(default=None, alias="api_key"),
):
    """
    Persistent WebSocket connection for node job assignment.

    Auth flow (NO HTTPException — uses websocket.close(1008) instead):
      1. Extract wallet from x-wallet-address header.
      2. Extract api_key from x-node-api-key header OR ?api_key= query param.
      3. Look up active node in Supabase nodes table.
      4. Accept connection only if node found.

    After accept:
      - Polls Supabase for pending jobs every second.
      - Assigns job to node, sends job_assigned payload.
      - Waits for job_result response, marks job completed.
    """
    # ── 1. Extract credentials from headers / query params ───────────────
    wallet = (
        x_wallet_address
        or websocket.headers.get("x-wallet-address")
        or ""
    ).strip().lower()

    if not wallet:
        await _reject_websocket(websocket, "Missing x-wallet-address header")
        return

    api_key = (
        x_node_api_key
        or api_key_query
        or websocket.headers.get("x-node-api-key")
        or websocket.query_params.get("api_key")
        or ""
    ).strip()

    if not api_key:
        await _reject_websocket(websocket, "Missing api_key")
        return

    # ── 2. Validate node against Supabase ─────────────────────────────────
    node = _get_node_by_wallet_and_api_key(wallet, api_key)
    if not node:
        await _reject_websocket(websocket, f"No active node for wallet={wallet}")
        return

    node_id = str(node.get("id") or node.get("node_id") or "")
    if not node_id:
        await _reject_websocket(websocket, "Node record missing id field")
        return

    # ── 3. Accept and register ─────────────────────────────────────────────
    await websocket.accept()
    active_nodes[node_id] = websocket
    logger.info("Node connected: wallet=%s node_id=%s", wallet, node_id)

    try:
        # ── 4. Job assignment loop ─────────────────────────────────────────
        while True:
            # Poll for the oldest unassigned pending job.
            pending_jobs: list[dict[str, Any]] = []
            try:
                jobs_res = (
                    supabase.table("jobs")
                    .select("*")
                    .eq("status", "pending")
                    .is_("assigned_node_id", "null")
                    .order("created_at", desc=False)
                    .limit(1)
                    .execute()
                )
                pending_jobs = jobs_res.data or []
            except Exception:
                # Fallback without assigned_node_id filter (older schema).
                try:
                    jobs_res = (
                        supabase.table("jobs")
                        .select("*")
                        .eq("status", "pending")
                        .order("created_at", desc=False)
                        .limit(1)
                        .execute()
                    )
                    pending_jobs = jobs_res.data or []
                except Exception as exc:
                    logger.warning("Job poll failed: %s", exc)

            if not pending_jobs:
                # No pending jobs — sleep then re-poll.
                await asyncio.sleep(1)
                continue

            job = pending_jobs[0]
            job_id = str(job.get("id") or "")
            if not job_id:
                await asyncio.sleep(1)
                continue

            # Atomically claim the job (optimistic: if another node wins the race,
            # this update will still execute but the node will re-poll next cycle).
            try:
                supabase.table("jobs").update({
                    "assigned_node_id": node_id,
                    "status": "assigned",
                }).eq("id", job_id).eq("status", "pending").execute()
            except Exception as exc:
                logger.warning(
                    "Failed to assign job_id=%s to node_id=%s: %s", job_id, node_id, exc
                )
                await asyncio.sleep(1)
                continue

            # Send job to node.
            try:
                await websocket.send_json(_build_job_payload(job))
                logger.info("Job assigned: job_id=%s node_id=%s", job_id, node_id)
            except Exception as exc:
                logger.warning("Failed to send job_id=%s to node: %s", job_id, exc)
                # Revert assignment so another node can pick it up.
                with suppress(Exception):
                    supabase.table("jobs").update({
                        "assigned_node_id": None,
                        "status": "pending",
                    }).eq("id", job_id).execute()
                break

            # Wait for job_result from the node (60 s timeout).
            try:
                incoming = await asyncio.wait_for(
                    websocket.receive_json(), timeout=60.0
                )
            except asyncio.TimeoutError:
                logger.warning(
                    "Timeout waiting for result: job_id=%s node_id=%s", job_id, node_id
                )
                # Revert so job can be retried.
                with suppress(Exception):
                    supabase.table("jobs").update({
                        "assigned_node_id": None,
                        "status": "pending",
                    }).eq("id", job_id).execute()
                continue
            except WebSocketDisconnect:
                raise
            except Exception as exc:
                logger.warning(
                    "Error receiving result for job_id=%s: %s", job_id, exc
                )
                continue

            # Validate message type.
            if str(incoming.get("type", "")).lower() != "job_result":
                logger.info(
                    "Ignoring non-job_result message (type=%s) from node_id=%s",
                    incoming.get("type"), node_id,
                )
                continue

            completed_job_id = str(incoming.get("job_id") or job_id)
            output = incoming.get("output")

            update_payload: dict[str, Any] = {"status": "completed"}
            if output is not None:
                with suppress(Exception):
                    update_payload["result"] = json.dumps(output)

            try:
                supabase.table("jobs").update(update_payload).eq(
                    "id", completed_job_id
                ).execute()
                logger.info(
                    "Job completed: job_id=%s node_id=%s", completed_job_id, node_id
                )
            except Exception as exc:
                logger.warning(
                    "Failed to mark job_id=%s completed: %s", completed_job_id, exc
                )

    except WebSocketDisconnect:
        logger.info("Node disconnected: wallet=%s node_id=%s", wallet, node_id)
    except Exception as exc:
        logger.exception("Unexpected error in ws_jobs for node_id=%s: %s", node_id, exc)
    finally:
        active_nodes.pop(node_id, None)
        logger.info("Node removed from active pool: node_id=%s", node_id)