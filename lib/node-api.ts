export type NodeRegistration = {
  node_id: string;
  api_key: string;
  reputation_score: number;
};

export type PendingJob = {
  job_id: string;
  model_id?: string;
  model_cid?: string;
  payment_amount?: number;
  input_data_url?: string;
  created_at?: string;
};

const baseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/api`;

function nodeHeaders(apiKey?: string): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (apiKey) {
    headers["apikey"] = apiKey;
    headers["x-node-api-key"] = apiKey;
  }
  return headers;
}

export async function registerNode(walletAddress: string): Promise<NodeRegistration> {
  const res = await fetch(`${baseUrl}/nodes/register`, {
    method: "POST",
    headers: nodeHeaders(),
    body: JSON.stringify({ walletAddress }),
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return await res.json();
}

export async function sendHeartbeat(nodeId: string, apiKey: string): Promise<void> {
  const res = await fetch(`${baseUrl}/nodes/${nodeId}/heartbeat`, {
    method: "POST",
    headers: nodeHeaders(apiKey),
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
}

export async function getPendingJobs(apiKey: string, limit = 10): Promise<PendingJob[]> {
  const res = await fetch(`${baseUrl}/jobs/pending?limit=${limit}`, {
    method: "GET",
    headers: nodeHeaders(apiKey),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  const body = await res.json();
  return body.items ?? [];
}

export async function submitBid(
  jobId: string,
  payload: { node_id: string; estimated_time_ms: number; reputation_score: number },
  apiKey: string,
): Promise<{ won: boolean; winner_node_id: string | null }> {
  const res = await fetch(`${baseUrl}/jobs/${jobId}/bid`, {
    method: "POST",
    headers: nodeHeaders(apiKey),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  const body = await res.json();
  return {
    won: Boolean(body.won),
    winner_node_id: body.winner_node_id ?? null,
  };
}
