const LOCAL_API_FALLBACK = "http://127.0.0.1:8000"

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "")
}

function normalizeWsUrl(value: string): string {
  let ws = trimTrailingSlash(value.trim())
  if (ws.startsWith("https://")) ws = `wss://${ws.slice("https://".length)}`
  else if (ws.startsWith("http://")) ws = `ws://${ws.slice("http://".length)}`
  if (!ws.endsWith("/ws/jobs")) ws = `${ws}/ws/jobs`
  return ws
}

export function getApiBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    LOCAL_API_FALLBACK
  return trimTrailingSlash(raw)
}

export function getBackendUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    LOCAL_API_FALLBACK
  return trimTrailingSlash(raw)
}

export function getWsJobsUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_WS_URL
  if (explicit && explicit.trim()) return normalizeWsUrl(explicit)
  return normalizeWsUrl(getBackendUrl())
}
