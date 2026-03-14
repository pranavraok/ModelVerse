import { getApiBaseUrl } from "@/lib/runtime-env"

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

export interface CreatorSummary {
  totalEarningsMatic: number
  pendingEarningsMatic: number
  withdrawableBalanceMatic: number
  activeModels: number
  totalInferences: number
  uniqueUsers: number
  totalJobs: number
  completedJobs: number
  pendingJobs: number
  avgLatencyMs: number
  modelHealthPct: number
}

export interface CreatorTopModel {
  id: string
  name: string
  inferences: number
  users: number
  earningsMatic: number
  status: string
}

export interface CreatorUsagePoint {
  name: string
  usagePercent: number
  inferences: number
}

export interface CreatorTransaction {
  id: string
  type: "earning" | "withdrawal"
  model: string
  amountMatic: number
  buyer: string
  txHash: string
  date: string
  status: string
}

export interface CreatorEarningsPoint {
  date: string
  earningsMatic: number
  inferences: number
}

export interface CreatorDashboardData {
  wallet: string
  summary: CreatorSummary
  topModels: CreatorTopModel[]
  usageDistribution: CreatorUsagePoint[]
  recentTransactions: CreatorTransaction[]
  earningsHistory: CreatorEarningsPoint[]
}

export const EMPTY_CREATOR_DASHBOARD: CreatorDashboardData = {
  wallet: "",
  summary: {
    totalEarningsMatic: 0,
    pendingEarningsMatic: 0,
    withdrawableBalanceMatic: 0,
    activeModels: 0,
    totalInferences: 0,
    uniqueUsers: 0,
    totalJobs: 0,
    completedJobs: 0,
    pendingJobs: 0,
    avgLatencyMs: 0,
    modelHealthPct: 0,
  },
  topModels: [],
  usageDistribution: [],
  recentTransactions: [],
  earningsHistory: [],
}

function normalizeDashboardPayload(body: Record<string, unknown>): CreatorDashboardData {
  const summary = (body.summary ?? {}) as Record<string, unknown>
  const topModelsRaw = Array.isArray(body.top_models) ? body.top_models : []
  const usageRaw = Array.isArray(body.usage_distribution) ? body.usage_distribution : []
  const txRaw = Array.isArray(body.recent_transactions) ? body.recent_transactions : []
  const historyRaw = Array.isArray(body.earnings_history) ? body.earnings_history : []

  return {
    wallet: asText(body.wallet, "").toLowerCase(),
    summary: {
      totalEarningsMatic: asNumber(summary.total_earnings_matic),
      pendingEarningsMatic: asNumber(summary.pending_earnings_matic),
      withdrawableBalanceMatic: asNumber(summary.withdrawable_balance_matic),
      activeModels: asNumber(summary.active_models),
      totalInferences: asNumber(summary.total_inferences),
      uniqueUsers: asNumber(summary.unique_users),
      totalJobs: asNumber(summary.total_jobs),
      completedJobs: asNumber(summary.completed_jobs),
      pendingJobs: asNumber(summary.pending_jobs),
      avgLatencyMs: asNumber(summary.avg_latency_ms),
      modelHealthPct: asNumber(summary.model_health_pct),
    },
    topModels: topModelsRaw
      .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
      .map((item) => ({
        id: asText(item.id),
        name: asText(item.name, "Untitled Model"),
        inferences: asNumber(item.inferences),
        users: asNumber(item.users),
        earningsMatic: asNumber(item.earnings_matic),
        status: asText(item.status, "active"),
      })),
    usageDistribution: usageRaw
      .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
      .map((item) => ({
        name: asText(item.name, "Unknown"),
        usagePercent: asNumber(item.usage_percent),
        inferences: asNumber(item.inferences),
      })),
    recentTransactions: txRaw
      .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
      .map((item) => ({
        id: asText(item.id),
        type: asText(item.type) === "withdrawal" ? "withdrawal" : "earning",
        model: asText(item.model, "Unknown Model"),
        amountMatic: asNumber(item.amount_matic),
        buyer: asText(item.buyer, ""),
        txHash: asText(item.tx_hash, ""),
        date: asText(item.date, ""),
        status: asText(item.status, "pending"),
      })),
    earningsHistory: historyRaw
      .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
      .map((item) => ({
        date: asText(item.date),
        earningsMatic: asNumber(item.earnings_matic),
        inferences: asNumber(item.inferences),
      })),
  }
}

export async function fetchCreatorDashboard(wallet?: string): Promise<CreatorDashboardData> {
  const resolvedWallet = (wallet || FALLBACK_WALLET).toLowerCase()
  const response = await fetch(`${API_BASE_URL}/api/creator/dashboard`, {
    headers: {
      "x-wallet-address": resolvedWallet,
    },
    cache: "no-store",
  })

  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    const detail = (body as Record<string, unknown>)?.detail
    const message =
      typeof detail === "string"
        ? detail
        : typeof (body as Record<string, unknown>)?.message === "string"
        ? ((body as Record<string, unknown>).message as string)
        : detail != null
        ? JSON.stringify(detail)
        : "Failed to load creator dashboard"
    throw new Error(message)
  }

  if (!body || typeof body !== "object") return EMPTY_CREATOR_DASHBOARD
  return normalizeDashboardPayload(body as Record<string, unknown>)
}
