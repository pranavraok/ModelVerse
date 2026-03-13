import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export type DbClient = ReturnType<typeof createClient>;

export function getServiceClient(): DbClient {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!url || !serviceRoleKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

export async function getNodeByApiKeyOrThrow(
  client: DbClient,
  apiKey: string,
): Promise<Record<string, unknown>> {
  const { data, error } = await client
    .from("nodes")
    .select("*")
    .eq("api_key", apiKey)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Node lookup failed: ${error.message}`);
  }
  if (!data) {
    throw new Error("Invalid API key");
  }

  return data as Record<string, unknown>;
}
