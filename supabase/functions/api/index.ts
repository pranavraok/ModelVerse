import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { getNodeByApiKeyOrThrow, getServiceClient } from "../_shared/supabase.ts";
import { isNodeActiveOnchain } from "../_shared/staking.ts";

type JobBid = {
  node_id: string;
  estimated_time_ms: number;
  reputation_score?: number;
};

type JobResult = {
  result_hash?: string;
  result_url?: string;
  execution_time_ms?: number;
  results?: unknown;
};

function getApiKey(req: Request): string {
  const key = req.headers.get("x-node-api-key") || req.headers.get("apikey") || "";
  return key.trim();
}

function parsePath(url: URL): string[] {
  // Works for local serve and deployed function routes.
  const path = url.pathname.replace(/\/+$/, "");
  const idx = path.indexOf("/api/");
  const apiPath = idx >= 0 ? path.slice(idx + 5) : path;
  return apiPath.split("/").filter(Boolean);
}

async function handleRegister(req: Request): Promise<Response> {
  const body = await req.json().catch(() => ({}));
  const walletAddress = String(body.walletAddress || "").trim().toLowerCase();
  if (!walletAddress) {
    return jsonResponse({ error: "walletAddress is required" }, 400);
  }

  try {
    const activeOnchain = await isNodeActiveOnchain(walletAddress);
    if (!activeOnchain) {
      return jsonResponse({ error: "Wallet is not actively staked on NodeStaking" }, 400);
    }
  } catch (error) {
    return jsonResponse({ error: `On-chain staking check failed: ${String(error)}` }, 500);
  }

  const supabase = getServiceClient();
  const minStake = Number(Deno.env.get("MIN_NODE_STAKE_MATIC") || "10");

  const { data: existing, error: lookupError } = await supabase
    .from("nodes")
    .select("*")
    .eq("wallet_address", walletAddress)
    .limit(1)
    .maybeSingle();

  if (lookupError) {
    return jsonResponse({ error: lookupError.message }, 500);
  }

  if (existing) {
    const staked = Number(existing.stake_amount ?? 0);
    if (staked < minStake) {
      return jsonResponse({ error: `Node stake is below ${minStake} MATIC` }, 400);
    }

    // Ensure node remains active and has api key.
    const updates: Record<string, unknown> = {
      is_active: true,
      last_seen: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (!existing.api_key) {
      updates.api_key = crypto.randomUUID();
    }

    const { data: updated, error: updateError } = await supabase
      .from("nodes")
      .update(updates)
      .eq("node_id", existing.node_id)
      .select("node_id, api_key, reputation_score")
      .single();

    if (updateError) {
      return jsonResponse({ error: updateError.message }, 500);
    }

    return jsonResponse(updated, 200);
  }

  const insertPayload = {
    node_id: crypto.randomUUID(),
    wallet_address: walletAddress,
    stake_amount: minStake,
    is_active: true,
    reputation_score: 0.5,
    total_jobs_completed: 0,
    last_seen: new Date().toISOString(),
  };

  const { data: inserted, error: insertError } = await supabase
    .from("nodes")
    .insert(insertPayload)
    .select("node_id, api_key, reputation_score")
    .single();

  if (insertError) {
    return jsonResponse({ error: insertError.message }, 500);
  }

  return jsonResponse(inserted, 201);
}

async function handleHeartbeat(req: Request, nodeId: string): Promise<Response> {
  const apiKey = getApiKey(req);
  if (!apiKey) {
    return jsonResponse({ error: "Missing x-node-api-key/apikey header" }, 401);
  }

  const supabase = getServiceClient();
  let node: Record<string, unknown>;
  try {
    node = await getNodeByApiKeyOrThrow(supabase, apiKey);
  } catch (error) {
    return jsonResponse({ error: String(error) }, 401);
  }

  try {
    const wallet = String(node.wallet_address || "");
    const activeOnchain = await isNodeActiveOnchain(wallet);
    if (!activeOnchain) {
      return jsonResponse({ error: "Node stake is not active on-chain" }, 403);
    }
  } catch (error) {
    return jsonResponse({ error: `On-chain staking check failed: ${String(error)}` }, 500);
  }

  const { data, error } = await supabase
    .from("nodes")
    .update({
      last_seen: new Date().toISOString(),
      is_active: true,
    })
    .eq("node_id", nodeId)
    .select("node_id, is_active, last_seen")
    .single();

  if (error) {
    return jsonResponse({ error: error.message }, 500);
  }

  return jsonResponse({ status: "ok", node: data }, 200);
}

async function handlePendingJobs(req: Request): Promise<Response> {
  const apiKey = getApiKey(req);
  if (!apiKey) {
    return jsonResponse({ error: "Missing x-node-api-key/apikey header" }, 401);
  }

  const supabase = getServiceClient();
  try {
    await getNodeByApiKeyOrThrow(supabase, apiKey);
  } catch (error) {
    return jsonResponse({ error: String(error) }, 401);
  }

  const url = new URL(req.url);
  const limitRaw = Number(url.searchParams.get("limit") || "10");
  const limit = Math.max(1, Math.min(100, limitRaw));

  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return jsonResponse({ error: error.message }, 500);
  }

  return jsonResponse({ items: data ?? [] }, 200);
}

async function scoreAndAssignWinner(supabase: ReturnType<typeof getServiceClient>, jobId: string): Promise<string | null> {
  const { data: bids, error: bidsError } = await supabase
    .from("job_bids")
    .select("node_id, estimated_time_ms, reputation_score, bid_timestamp")
    .eq("job_id", jobId);

  if (bidsError) {
    throw new Error(bidsError.message);
  }

  const rows = (bids ?? []) as Array<Record<string, unknown>>;
  if (rows.length === 0) {
    return null;
  }

  // Hackathon simplification: first bidder can win via env toggle, else weighted formula.
  const firstBidderWins = (Deno.env.get("FIRST_BIDDER_WINS") || "true").toLowerCase() === "true";
  let winnerNodeId: string;

  if (firstBidderWins) {
    const sorted = [...rows].sort((a, b) => {
      const ta = String(a.bid_timestamp || "");
      const tb = String(b.bid_timestamp || "");
      return ta.localeCompare(tb);
    });
    winnerNodeId = String(sorted[0].node_id);
  } else {
    const scored = rows.map((bid) => {
      const reputation = Number(bid.reputation_score ?? 0.5);
      const timeMs = Math.max(1, Number(bid.estimated_time_ms ?? 1000));
      const score = (reputation * 0.7) + ((1000 / timeMs) * 0.3);
      return { nodeId: String(bid.node_id), score };
    });
    scored.sort((a, b) => b.score - a.score);
    winnerNodeId = scored[0].nodeId;
  }

  const { error: updateError } = await supabase
    .from("jobs")
    .update({
      assigned_node_id: winnerNodeId,
      status: "assigned",
    })
    .eq("job_id", jobId)
    .eq("status", "pending");

  if (updateError) {
    throw new Error(updateError.message);
  }

  return winnerNodeId;
}

async function handleBid(req: Request, jobId: string): Promise<Response> {
  const apiKey = getApiKey(req);
  if (!apiKey) {
    return jsonResponse({ error: "Missing x-node-api-key/apikey header" }, 401);
  }

  const supabase = getServiceClient();
  let node: Record<string, unknown>;
  try {
    node = await getNodeByApiKeyOrThrow(supabase, apiKey);
  } catch (error) {
    return jsonResponse({ error: String(error) }, 401);
  }

  try {
    const wallet = String(node.wallet_address || "");
    const activeOnchain = await isNodeActiveOnchain(wallet);
    if (!activeOnchain) {
      return jsonResponse({ error: "Node stake is not active on-chain" }, 403);
    }
  } catch (error) {
    return jsonResponse({ error: `On-chain staking check failed: ${String(error)}` }, 500);
  }

  const body = (await req.json().catch(() => ({}))) as JobBid;
  if (!body.node_id || !body.estimated_time_ms) {
    return jsonResponse({ error: "node_id and estimated_time_ms are required" }, 400);
  }

  const { error: insertError } = await supabase
    .from("job_bids")
    .insert({
      job_id: jobId,
      node_id: body.node_id,
      estimated_time_ms: body.estimated_time_ms,
      reputation_score: body.reputation_score ?? 0.5,
    });

  if (insertError) {
    return jsonResponse({ error: insertError.message }, 500);
  }

  try {
    const winnerNodeId = await scoreAndAssignWinner(supabase, jobId);
    return jsonResponse({
      status: "bid_accepted",
      winner_node_id: winnerNodeId,
      won: winnerNodeId === body.node_id,
    });
  } catch (error) {
    return jsonResponse({ error: String(error) }, 500);
  }
}

async function handleResult(req: Request, jobId: string): Promise<Response> {
  const apiKey = getApiKey(req);
  if (!apiKey) {
    return jsonResponse({ error: "Missing x-node-api-key/apikey header" }, 401);
  }

  const supabase = getServiceClient();
  let node: Record<string, unknown>;
  try {
    node = await getNodeByApiKeyOrThrow(supabase, apiKey);
  } catch (error) {
    return jsonResponse({ error: String(error) }, 401);
  }

  const body = (await req.json().catch(() => ({}))) as JobResult;
  const { error } = await supabase
    .from("jobs")
    .update({
      status: "completed",
      result_hash: body.result_hash ?? null,
      result_url: body.result_url ?? null,
      execution_time_ms: body.execution_time_ms ?? null,
      completed_at: new Date().toISOString(),
      result: body.results ? JSON.stringify(body.results) : null,
    })
    .eq("job_id", jobId)
    .eq("assigned_node_id", String(node.node_id || ""));

  if (error) {
    return jsonResponse({ error: error.message }, 500);
  }

  // Best effort reputation/job counter update.
  await supabase.rpc("increment_node_job_count", { p_node_id: String(node.node_id || "") }).then(() => null).catch(() => null);

  return jsonResponse({ status: "received", job_id: jobId });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const segments = parsePath(url);

  try {
    // POST /api/nodes/register
    if (req.method === "POST" && segments.length === 2 && segments[0] === "nodes" && segments[1] === "register") {
      return await handleRegister(req);
    }

    // POST /api/nodes/{node_id}/heartbeat
    if (req.method === "POST" && segments.length === 3 && segments[0] === "nodes" && segments[2] === "heartbeat") {
      return await handleHeartbeat(req, segments[1]);
    }

    // GET /api/jobs/pending
    if (req.method === "GET" && segments.length === 2 && segments[0] === "jobs" && segments[1] === "pending") {
      return await handlePendingJobs(req);
    }

    // POST /api/jobs/{job_id}/bid
    if (req.method === "POST" && segments.length === 3 && segments[0] === "jobs" && segments[2] === "bid") {
      return await handleBid(req, segments[1]);
    }

    // POST /api/jobs/{job_id}/result
    if (req.method === "POST" && segments.length === 3 && segments[0] === "jobs" && segments[2] === "result") {
      return await handleResult(req, segments[1]);
    }

    return jsonResponse({ error: "Route not found" }, 404);
  } catch (error) {
    console.error("Edge API error", error);
    return jsonResponse({ error: String(error) }, 500);
  }
});
