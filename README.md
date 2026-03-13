# ModelVerse

A decentralized AI model marketplace built on **Polygon Amoy** (testnet) where creators upload ML models, buyers run inference jobs, and node operators earn rewards by executing those jobs — all secured on-chain and stored on IPFS via Pinata.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [1. Frontend (Next.js)](#1-frontend-nextjs)
- [2. Backend (FastAPI)](#2-backend-fastapi)
- [3. Node Service (Docker)](#3-node-service-docker)
- [4. EVM Smart Contracts](#4-evm-smart-contracts)
- [Supabase Schema](#supabase-schema)
- [API Reference](#api-reference)
- [WebSocket Protocol](#websocket-protocol)
- [Roles](#roles)
- [Deployment Guide](#deployment-guide)
- [Troubleshooting](#troubleshooting)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   Next.js Frontend                  │
│    (RainbowKit + wagmi wallet connect, shadcn/ui)   │
└───────────────────┬─────────────────────────────────┘
                    │ REST + WebSocket
┌───────────────────▼─────────────────────────────────┐
│            FastAPI Backend (Python)                 │
│  Auth (Supabase) │ Jobs │ Models │ Nodes │ Docker   │
└──────┬──────────────────────────────────┬───────────┘
       │ Supabase (Postgres)              │ Polygon Amoy
       │                                  │ (Alchemy WS)
┌──────▼────────┐                ┌────────▼───────────┐
│   Supabase    │                │   Smart Contracts  │
│  (Auth + DB)  │                │  ModelRegistry     │
└───────────────┘                │  JobManager        │
                                 └────────────────────┘
                    ┌───────────────────────────┐
                    │   Node Service (Docker)   │
                    │  node_daemon.py           │
                    │  inference_engine.py      │
                    │  ONNX / TFLite runtime    │
                    └───────────────────────────┘
                                 │
                    ┌────────────▼──────────────┐
                    │   IPFS (Pinata)           │
                    │   Model file storage      │
                    └───────────────────────────┘
```

---

## Tech Stack

| Layer           | Technology                                                                            |
| --------------- | ------------------------------------------------------------------------------------- |
| Frontend        | Next.js 16, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, RainbowKit, wagmi, viem |
| Backend         | Python, FastAPI, Supabase Python SDK, httpx, Pydantic v2                              |
| Database / Auth | Supabase (Postgres + GoTrue auth)                                                     |
| Blockchain      | Polygon Amoy testnet, Solidity smart contracts                                        |
| IPFS            | Pinata (file pinning)                                                                 |
| Node Service    | Python, Docker, ONNX Runtime / TFLite, WebSocket daemon                               |
| Package Manager | pnpm (frontend), pip (backend/node-service)                                           |

---

## Project Structure

```
ModelVerse/
├── app/                   # Next.js App Router pages
├── components/            # React UI components (shadcn/ui based)
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
├── styles/                # Global CSS
├── public/                # Static assets
├── backend/
│   ├── main.py            # FastAPI app (all routes)
│   ├── listener.py        # Standalone Web3 event listener
│   ├── abis/              # Contract ABI JSON files
│   ├── uploads/           # Temporary model file storage (auto-created)
│   └── .env               # Backend environment variables (create this)
├── node-service/
│   ├── node_daemon.py     # Main node worker daemon
│   ├── inference_engine.py # ONNX/TFLite inference runner
│   ├── ipfs_client.py     # Pinata IPFS download
│   ├── job_client.py      # WebSocket job consumer
│   ├── model_cache.py     # Local model file cache
│   ├── Dockerfile         # Node service container
│   ├── docker-compose.yml
│   ├── requirements.txt
│   └── .env.example       # Copy to .env for local setup
├── evm-staking/           # Hardhat project for smart contracts
├── next.config.mjs
├── package.json
└── tsconfig.json
```

---

## Prerequisites

Ensure the following are installed before proceeding:

- **Node.js** ≥ 20 and **pnpm** (`npm install -g pnpm`)
- **Python** ≥ 3.11
- **Docker** + **Docker Compose** (for node service)
- A **Supabase** project (free tier works)
- A **Pinata** account with a JWT API key
- An **Alchemy** account with a Polygon Amoy WebSocket URL
- A **MetaMask** or any EVM-compatible wallet funded with Amoy MATIC (testnet)

---

## Environment Variables

### Backend — `backend/.env`

Create this file manually. It is **not** committed to the repo.

```env
# Supabase
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your-supabase-service-role-key

# Pinata IPFS
PINATA_JWT=your-pinata-jwt-token
PINATA_PIN_FILE_URL=https://api.pinata.cloud/pinning/pinFileToIPFS

# Polygon Amoy (Alchemy WebSocket)
ALCHEMY_WS_URL=wss://polygon-amoy.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY

# Smart Contract Addresses (deploy from evm-staking/ and paste here)
MODEL_REGISTRY_ADDRESS=0xYourModelRegistryAddress
JOB_MANAGER_ADDRESS=0xYourJobManagerAddress
```

> ⚠️ Use the **service role key** (not the anon key) for `SUPABASE_SERVICE_KEY`. It bypasses Row Level Security and is required for admin operations.

### Frontend — `.env.local` (project root)

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_MODEL_REGISTRY_ADDRESS=0xYourModelRegistryAddress
NEXT_PUBLIC_JOB_MANAGER_ADDRESS=0xYourJobManagerAddress
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

### Node Service — `node-service/.env`

Copy from the example:

```bash
cp node-service/.env.example node-service/.env
```

Then fill in:

```env
BACKEND_WS_URL=ws://localhost:8000/ws/jobs
BACKEND_URL=http://localhost:8000
WALLET_ADDRESS=0xYourNodeOperatorWalletAddress
NODE_API_KEY=your-node-api-key-from-registration
PINATA_JWT=your-pinata-jwt-token
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your-supabase-service-role-key
```

> The `NODE_API_KEY` is generated when you register a node via `POST /api/nodes/register`. Save the `api_key` from the response.

---

## 1. Frontend (Next.js)

```bash
# Install dependencies
pnpm install

# Development server
pnpm dev
# → http://localhost:3000

# Production build
pnpm build
pnpm start
```

> The frontend requires the backend to be running for all API and WebSocket calls. Set `NEXT_PUBLIC_BACKEND_URL` accordingly.

---

## 2. Backend (FastAPI)

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate       # Linux/macOS
# or
venv\Scripts\activate          # Windows PowerShell

# Install dependencies
pip install fastapi uvicorn python-dotenv supabase httpx pydantic websockets

# Start development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Verify the backend is running:

```bash
curl http://localhost:8000/health
# → {"status": "ok"}
```

On startup, the backend automatically:

- Validates that `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are set
- Starts a background WebSocket listener connected to Polygon Amoy via Alchemy
- Creates the `uploads/` directory for temporary model file storage

---

## 3. Node Service (Docker)

The node service runs as a Docker container. It connects to the backend via WebSocket, receives inference jobs, downloads model files from IPFS, runs inference (ONNX or TFLite), and returns results.

### First: Register your node

Before starting the container, register your wallet as a node operator via the frontend dashboard or directly:

```bash
curl -X POST http://localhost:8000/api/nodes/register \
  -H "x-wallet-address: 0xYourWalletAddress" \
  -H "Content-Type: application/json" \
  -d '{"node_name": "My Node"}'
```

Save the `api_key` from the response into `node-service/.env`.

### Start the container

```bash
cd node-service
docker compose up --build -d
```

The `entrypoint.sh` reads `WALLET_ADDRESS` from the environment, fetches the node credentials from the backend, and starts `node_daemon.py`.

### View logs

```bash
docker compose logs -f
```

### Stop the container

```bash
docker compose down
```

> The backend's `POST /api/docker/start` and `POST /api/docker/stop` endpoints can also trigger Docker operations programmatically when the frontend logs in/out.

---

## 4. EVM Smart Contracts

Smart contracts are located in `evm-staking/` and deployed to **Polygon Amoy testnet**.

```bash
cd evm-staking
npm install

# Compile contracts
npx hardhat compile

# Deploy to Amoy testnet
npx hardhat run scripts/deploy.js --network amoy
```

After deployment, update both `backend/.env` and `.env.local` with the new contract addresses:

- `MODEL_REGISTRY_ADDRESS`
- `JOB_MANAGER_ADDRESS`

Deployed contracts (default dev addresses):

| Contract      | Address                                      |
| ------------- | -------------------------------------------- |
| ModelRegistry | `0x818e9Df23c8A2B61b7796b0A081C0bA1014d1d91` |
| JobManager    | `0xB6271a63c01d651CEbF6F22FE411aB4cf1465195` |

> These are testnet addresses. Replace with your own deployments for production.

---

## Supabase Schema

Create the following tables in your Supabase project (via the SQL Editor):

### `profiles`

| Column   | Type   | Notes                                  |
| -------- | ------ | -------------------------------------- |
| `wallet` | `text` | Primary key (lowercased EVM address)   |
| `role`   | `text` | `creator`, `buyer`, or `node-operator` |

### `models`

| Column           | Type          | Notes                                |
| ---------------- | ------------- | ------------------------------------ |
| `id`             | `uuid`        | Primary key                          |
| `name`           | `text`        |                                      |
| `description`    | `text`        |                                      |
| `category`       | `text`        |                                      |
| `price`          | `float8`      | Price per inference in MATIC         |
| `ipfs_cid`       | `text`        | Pinata IPFS CID                      |
| `creator_wallet` | `text`        | Owner wallet address                 |
| `status`         | `text`        | `active` / `inactive`                |
| `chain_model_id` | `int8`        | On-chain model ID after registration |
| `created_at`     | `timestamptz` |                                      |

### `nodes`

| Column                 | Type          | Notes                         |
| ---------------------- | ------------- | ----------------------------- |
| `id`                   | `uuid`        | Primary key                   |
| `wallet`               | `text`        | Operator wallet address       |
| `api_key`              | `text`        | Secret key for WebSocket auth |
| `node_name`            | `text`        |                               |
| `status`               | `text`        | `active` / `inactive`         |
| `reputation_score`     | `float8`      | Default `0.5`                 |
| `total_jobs_completed` | `int8`        | Default `0`                   |
| `last_seen_at`         | `timestamptz` | Updated on heartbeat          |

### `jobs`

| Column              | Type          | Notes                              |
| ------------------- | ------------- | ---------------------------------- |
| `id`                | `uuid`        | Primary key                        |
| `blockchain_job_id` | `int8`        | On-chain job ID                    |
| `model_id`          | `uuid`        | FK → models                        |
| `model_cid`         | `text`        | IPFS CID of the model              |
| `buyer_wallet`      | `text`        |                                    |
| `creator_wallet`    | `text`        |                                    |
| `input_base64`      | `text`        | Base64-encoded input data          |
| `status`            | `text`        | `pending`, `assigned`, `completed` |
| `assigned_node_id`  | `uuid`        | FK → nodes                         |
| `result`            | `jsonb`       | Inference output                   |
| `payment_amount`    | `float8`      |                                    |
| `updated_at`        | `timestamptz` |                                    |

---

## API Reference

All endpoints require the `x-wallet-address` header (lowercased EVM address) unless noted.

### Auth

| Method | Endpoint            | Description                                                 |
| ------ | ------------------- | ----------------------------------------------------------- |
| `POST` | `/auth/signup`      | Register with email/password + role                         |
| `POST` | `/auth/login`       | Login, returns JWT access token                             |
| `GET`  | `/auth/me`          | Get current user (requires `Authorization: Bearer <token>`) |
| `POST` | `/auth/select-role` | Set role after signup                                       |

### Models

| Method | Endpoint                               | Description                                        |
| ------ | -------------------------------------- | -------------------------------------------------- |
| `GET`  | `/api/models`                          | List all models (paginated, filterable)            |
| `GET`  | `/api/models/{model_id}`               | Get model details                                  |
| `POST` | `/api/models/upload`                   | Upload `.onnx` or `.tflite` model (multipart form) |
| `POST` | `/api/models/{model_id}/link-chain-id` | Link Supabase model to on-chain ID                 |

### Nodes

| Method | Endpoint                   | Description                               |
| ------ | -------------------------- | ----------------------------------------- |
| `POST` | `/api/nodes/register`      | Register a node, returns `api_key`        |
| `POST` | `/api/nodes/auto-register` | Idempotent registration (called on login) |
| `GET`  | `/api/nodes`               | List nodes for current wallet             |
| `POST` | `/api/nodes/heartbeat`     | Update node `last_seen_at`                |
| `POST` | `/api/nodes/deactivate`    | Mark node inactive (called on logout)     |

### Jobs

| Method | Endpoint                      | Description                         |
| ------ | ----------------------------- | ----------------------------------- |
| `POST` | `/api/jobs/create-from-chain` | Create a job after on-chain payment |
| `GET`  | `/api/jobs`                   | List jobs for current wallet        |

### Docker (Server-side)

| Method | Endpoint            | Description                                          |
| ------ | ------------------- | ---------------------------------------------------- |
| `POST` | `/api/docker/start` | Start node-service container via `docker compose up` |
| `POST` | `/api/docker/stop`  | Stop node-service container                          |

### Health

| Method | Endpoint  | Description          |
| ------ | --------- | -------------------- |
| `GET`  | `/health` | Backend health check |

---

## WebSocket Protocol

**Endpoint:** `ws://localhost:8000/ws/jobs`

**Auth headers required:**

```
x-wallet-address: 0xYourNodeWalletAddress
x-node-api-key: your-api-key
```

Or via query param: `?api_key=your-api-key`

### Server → Node: Job Assignment

```json
{
  "type": "job_assigned",
  "job": {
    "job_id": "uuid-string",
    "model_cid": "QmIpfsCid...",
    "model_input_type": "image",
    "input_base64": "base64encodeddata...",
    "creator_address": "0x..."
  }
}
```

### Node → Server: Job Result

```json
{
  "type": "job_result",
  "job_id": "uuid-string",
  "output": { "prediction": "cat", "confidence": 0.97 }
}
```

---

## Roles

| Role            | Capabilities                                                                  |
| --------------- | ----------------------------------------------------------------------------- |
| `creator`       | Upload ML models (`.onnx` / `.tflite`), register on-chain, earn per inference |
| `buyer`         | Browse models, submit inference jobs, pay in MATIC                            |
| `node-operator` | Run node daemon, receive jobs via WebSocket, execute inference, earn rewards  |

---

## Deployment Guide

### Frontend → Vercel

```bash
pnpm build
# Deploy via Vercel CLI or GitHub integration
vercel --prod
```

Set all `NEXT_PUBLIC_*` environment variables in the Vercel dashboard.

### Backend → Railway / Render / VPS

```bash
# Example: using uvicorn directly
uvicorn main:app --host 0.0.0.0 --port 8000
```

Or use a `Procfile`:

```
web: uvicorn backend.main:app --host 0.0.0.0 --port $PORT
```

Set all backend environment variables via the platform's dashboard or secrets manager.

**CORS:** Update `allow_origins` in `backend/main.py` to include your production frontend URL.

### Node Service → Any Docker Host

```bash
cd node-service
# Set .env with production backend URL and wallet credentials
docker compose up --build -d
```

Ensure the node service can reach the backend's WebSocket endpoint over the network.

---

## Troubleshooting

**`Missing required environment variables: SUPABASE_URL`**
→ Ensure `backend/.env` exists and contains the correct keys. The backend checks for this file relative to `main.py`.

**`Pinata upload failed`**
→ Check that `PINATA_JWT` is valid and has `pinFileToIPFS` permission in your Pinata account.

**Node WebSocket rejected with `1008`**
→ Verify your `WALLET_ADDRESS` and `NODE_API_KEY` in `node-service/.env` match the registered node in Supabase.

**`docker compose up` times out**
→ Increase the timeout in `POST /api/docker/start` or run `docker compose up --build` manually in the `node-service/` directory.

**Frontend wallet not connecting**
→ Ensure MetaMask is on the **Polygon Amoy** network (Chain ID: `80002`). Add the network via [ChainList](https://chainlist.org/?search=amoy).

**`chain_model_id` missing column error**
→ Run the Supabase migration to add the `chain_model_id` column to the `models` table.
