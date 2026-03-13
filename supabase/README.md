# ModelVerse Supabase Hackathon API

This folder contains a Supabase Edge Function API router and SQL setup for the node workflow.

## 1) Apply SQL

Run `supabase/sql/hackathon_setup.sql` in Supabase SQL Editor.

## 2) Set Edge Function secrets

```bash
supabase secrets set SUPABASE_URL=https://<project-ref>.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
supabase secrets set MIN_NODE_STAKE_MATIC=10
supabase secrets set FIRST_BIDDER_WINS=true
```

## 3) Deploy Edge Function

```bash
supabase functions deploy api
```

## 4) Endpoint base URL

```text
https://<project-ref>.supabase.co/functions/v1/api
```

## 5) Curl smoke tests

Register node:

```bash
curl -X POST "https://<project-ref>.supabase.co/functions/v1/api/nodes/register" \
  -H "Content-Type: application/json" \
  -d '{"walletAddress":"0xabc..."}'
```

Heartbeat:

```bash
curl -X POST "https://<project-ref>.supabase.co/functions/v1/api/nodes/<node_id>/heartbeat" \
  -H "x-node-api-key: <api_key>"
```

Pending jobs:

```bash
curl "https://<project-ref>.supabase.co/functions/v1/api/jobs/pending?limit=10" \
  -H "x-node-api-key: <api_key>"
```

Submit bid:

```bash
curl -X POST "https://<project-ref>.supabase.co/functions/v1/api/jobs/<job_id>/bid" \
  -H "Content-Type: application/json" \
  -H "x-node-api-key: <api_key>" \
  -d '{"node_id":"<node_id>","estimated_time_ms":450,"reputation_score":0.5}'
```

Submit result:

```bash
curl -X POST "https://<project-ref>.supabase.co/functions/v1/api/jobs/<job_id>/result" \
  -H "Content-Type: application/json" \
  -H "x-node-api-key: <api_key>" \
  -d '{"result_hash":"abc123","result_url":"ipfs://Qm...","execution_time_ms":450}'
```

## 6) Frontend env vars

Set in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_MODEL_MARKETPLACE_ADDRESS=0xYourContractAddress
```

## 7) Node daemon env vars

Set in `node-service/.env`:

```bash
NODE_ID=<node_id>
API_KEY=<api_key>
SUPABASE_URL=https://<project-ref>.supabase.co
```

Current daemon still uses coordinator WS for live assignment; this API supports pending/bid/result polling flow.
