import { getApiBaseUrl } from "@/lib/runtime-env"

export interface MarketplaceModel {
  id: string
  name: string
  description: string
  category: string
  creatorWallet: string
  price: number
  rating: number
  jobs: number
  trustScore?: number
  chainModelId?: number
  sampleInput?: string
  expectedOutput?: string
  createdAt?: string
  updatedAt?: string
  ipfsCid?: string
  status?: string
}

const API_BASE_URL = getApiBaseUrl()
const FALLBACK_WALLET = "0x0000000000000000000000000000000000000000"

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return fallback
}

function asText(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value
  if (value == null) return fallback
  return String(value)
}

function resolvePrice(row: Record<string, unknown>): number {
  const candidates = [
    asNumber(row.price, Number.NaN),
    asNumber(row.price_per_inference, Number.NaN),
    asNumber(row.inference_price, Number.NaN),
    asNumber(row.price_matic, Number.NaN),
  ].filter((value) => Number.isFinite(value))

  const positive = candidates.find((value) => value > 0)
  if (positive != null) return positive
  if (candidates.length > 0) return candidates[0]
  return 0
}

function normalizeModel(row: Record<string, unknown>): MarketplaceModel {
  const creatorWallet = asText(
    row.creator_wallet ??
      row.creator_address ??
      row.owner_wallet ??
      row.wallet_address ??
      row.wallet,
    ""
  ).toLowerCase()

  return {
    id: asText(row.id ?? row.model_id),
    name: asText(row.name ?? row.model_name ?? row.title, "Untitled Model"),
    description: asText(row.description, "No description provided."),
    category: asText(row.category, "other"),
    creatorWallet,
    price: resolvePrice(row),
    rating: asNumber(row.rating, 0),
    jobs: asNumber(row.jobs ?? row.job_count ?? row.total_jobs ?? row.usage_count, 0),
    trustScore: asNumber(row.trust_score, 0),
    chainModelId: row.chain_model_id == null ? undefined : asNumber(row.chain_model_id, 0),
    sampleInput: asText(row.sample_input, ""),
    expectedOutput: asText(row.expected_output, ""),
    createdAt: asText(row.created_at ?? row.createdAt, ""),
    updatedAt: asText(row.updated_at, ""),
    ipfsCid: asText(row.ipfs_cid ?? row.model_cid ?? row.cid, ""),
    status: asText(row.status, "active"),
  }
}

export function walletMatches(a?: string, b?: string): boolean {
  if (!a || !b) return false
  return a.toLowerCase() === b.toLowerCase()
}

export function shortWallet(wallet?: string): string {
  if (!wallet) return "Unknown"
  if (wallet.length < 12) return wallet
  return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`
}

export async function fetchModels(params?: {
  wallet?: string
  category?: string
  limit?: number
  offset?: number
  mine?: boolean
}): Promise<MarketplaceModel[]> {
  const wallet = (params?.wallet || FALLBACK_WALLET).toLowerCase()
  const safeLimit = Math.min(Math.max(params?.limit ?? 100, 1), 100)
  const safeOffset = Math.max(params?.offset ?? 0, 0)
  const query = new URLSearchParams()
  if (params?.category && params.category !== "all") query.set("category", params.category)
  if (params?.mine) query.set("mine", "true")
  query.set("limit", String(safeLimit))
  query.set("offset", String(safeOffset))

  const response = await fetch(`${API_BASE_URL}/api/models?${query.toString()}`, {
    headers: {
      "x-wallet-address": wallet,
    },
    cache: "no-store",
  })

  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    const detail = body?.detail
    const message =
      typeof detail === "string"
        ? detail
        : typeof body?.message === "string"
        ? body.message
        : detail != null
        ? JSON.stringify(detail)
        : "Failed to fetch models"
    throw new Error(message)
  }

  const rows = Array.isArray(body?.items) ? body.items : []
  return rows
    .filter((row: unknown) => row && typeof row === "object")
    .map((row: unknown) => normalizeModel(row as Record<string, unknown>))
    .filter((model) => Boolean(model.id))
}

export async function fetchModelById(id: string, wallet?: string): Promise<MarketplaceModel | null> {
  const resolvedWallet = (wallet || FALLBACK_WALLET).toLowerCase()
  const response = await fetch(`${API_BASE_URL}/api/models/${encodeURIComponent(id)}`, {
    headers: {
      "x-wallet-address": resolvedWallet,
    },
    cache: "no-store",
  })

  const body = await response.json().catch(() => ({}))
  if (response.status === 404) return null
  if (!response.ok) {
    const detail = body?.detail
    const message =
      typeof detail === "string"
        ? detail
        : typeof body?.message === "string"
        ? body.message
        : detail != null
        ? JSON.stringify(detail)
        : "Failed to fetch model"
    throw new Error(message)
  }

  const item = body?.item
  if (!item || typeof item !== "object") return null
  return normalizeModel(item as Record<string, unknown>)
}