import { getApiBaseUrl } from "@/lib/runtime-env"
import { fetchModels, type MarketplaceModel } from "@/lib/model-api"

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

function toDate(value: unknown): Date | null {
  if (typeof value !== "string" || !value.trim()) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function toIso(value: unknown): string {
  const parsed = toDate(value)
  return parsed ? parsed.toISOString() : ""
}

function formatRelativeTime(isoDate: string): string {
  if (!isoDate) return "Unknown"

  const ts = new Date(isoDate).getTime()
  if (Number.isNaN(ts)) return "Unknown"

  const diffMs = Date.now() - ts
  const diffSec = Math.floor(diffMs / 1000)

  if (diffSec < 60) return "Just now"
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} min ago`
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hr ago`
  return `${Math.floor(diffSec / 86400)} day ago`
}

function normalizeStatus(value: unknown): BuyerJobStatus {
  const raw = asText(value, "pending").trim().toLowerCase()

  if (raw === "running" || raw === "in_progress") return "running"
  if (raw === "assigned" || raw === "queued") return "assigned"
  if (raw === "completed" || raw === "success" || raw === "succeeded" || raw === "done") return "completed"
  if (raw === "failed" || raw === "error") return "failed"
  return "pending"
}

function inferProgress(status: BuyerJobStatus, value: unknown): number {
  const explicit = asNumber(value, Number.NaN)
  if (Number.isFinite(explicit)) {
    return Math.min(100, Math.max(0, explicit))
  }

  if (status === "pending") return 0
  if (status === "assigned") return 15
  if (status === "running") return 65
  if (status === "completed") return 100
  return 45
}

function normalizeJob(row: Record<string, unknown>, modelNameById: Map<string, string>): BuyerListJob {
  const modelId = asText(row.model_id)
  const status = normalizeStatus(row.status)
  const createdAtIso = toIso(row.created_at ?? row.updated_at)

  return {
    id: asText(row.id ?? row.blockchain_job_id),
    modelId,
    modelName:
      asText(row.model_name) ||
      (modelId ? modelNameById.get(modelId) || "Unknown Model" : "Unknown Model"),
    status,
    paymentMatic: Math.max(
      0,
      asNumber(row.payment_amount, Number.NaN),
      asNumber(row.payment, Number.NaN),
      asNumber(row.price, 0)
    ),
    progress: inferProgress(status, row.progress),
    createdAtIso,
    startedAtLabel: formatRelativeTime(createdAtIso),
  }
}

function normalizeError(body: unknown, fallback: string): string {
  if (!body || typeof body !== "object") return fallback

  const typed = body as Record<string, unknown>
  const detail = typed.detail
  if (typeof detail === "string") return detail
  if (detail != null) return JSON.stringify(detail)

  const message = typed.message
  if (typeof message === "string") return message
  return fallback
}

function isLiveStatus(status: BuyerJobStatus): boolean {
  return status === "pending" || status === "assigned" || status === "running"
}

function formatMatic(value: number): string {
  if (!Number.isFinite(value)) return "0 MATIC"
  return `${new Intl.NumberFormat("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 3 }).format(value)} MATIC`
}

function formatDateTime(isoDate: string): string {
  if (!isoDate) return "-"
  const value = new Date(isoDate)
  if (Number.isNaN(value.getTime())) return "-"
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value)
}

export type BuyerJobStatus = "pending" | "assigned" | "running" | "completed" | "failed"

export interface BuyerDashboardStat {
  title: string
  value: string
  change: string
  trend: "up" | "down" | "neutral"
}

export interface BuyerDashboardJob {
  id: string
  model: string
  status: BuyerJobStatus
  progress: number
  startedAt: string
}

export interface BuyerRecommendedModel {
  id: string
  name: string
  category: string
  description: string
  runs: number
}

export interface BuyerListJob {
  id: string
  modelId: string
  modelName: string
  status: BuyerJobStatus
  paymentMatic: number
  progress: number
  createdAtIso: string
  startedAtLabel: string
}

export interface BuyerDashboardData {
  wallet: string
  stats: BuyerDashboardStat[]
  activeJobs: BuyerDashboardJob[]
  recommendedModels: BuyerRecommendedModel[]
}

export const EMPTY_BUYER_DASHBOARD: BuyerDashboardData = {
  wallet: "",
  stats: [
    { title: "Total Jobs Submitted", value: "0", change: "No data", trend: "neutral" },
    { title: "Active Jobs", value: "0", change: "No active jobs", trend: "neutral" },
    { title: "Total Spent", value: "0 MATIC", change: "No transactions", trend: "neutral" },
    { title: "Average Job Cost", value: "0 MATIC", change: "Awaiting jobs", trend: "neutral" },
  ],
  activeJobs: [],
  recommendedModels: [],
}

async function loadNormalizedJobs(wallet: string): Promise<{ jobs: BuyerListJob[]; models: MarketplaceModel[] }> {
  const [jobsResponse, models] = await Promise.all([
    fetch(`${API_BASE_URL}/api/jobs`, {
      headers: {
        "x-wallet-address": wallet,
      },
      cache: "no-store",
    }),
    fetchModels({ wallet, limit: 200 }),
  ])

  const jobsBody = await jobsResponse.json().catch(() => ({}))
  if (!jobsResponse.ok) {
    throw new Error(normalizeError(jobsBody, "Failed to load buyer jobs"))
  }

  const itemsRaw = Array.isArray((jobsBody as Record<string, unknown>)?.items)
    ? ((jobsBody as Record<string, unknown>).items as unknown[])
    : []

  const modelNameById = new Map<string, string>()
  for (const model of models) {
    if (!model.id) continue
    modelNameById.set(model.id, model.name || "Untitled Model")
  }

  const jobs = itemsRaw
    .filter((row): row is Record<string, unknown> => Boolean(row && typeof row === "object"))
    .map((row) => normalizeJob(row, modelNameById))
    .filter((job) => Boolean(job.id))
    .sort((a, b) => {
      const left = a.createdAtIso ? new Date(a.createdAtIso).getTime() : 0
      const right = b.createdAtIso ? new Date(b.createdAtIso).getTime() : 0
      return right - left
    })

  return { jobs, models }
}

export async function fetchBuyerJobs(wallet?: string): Promise<Array<BuyerListJob & { costLabel: string; createdAtLabel: string }>> {
  const resolvedWallet = (wallet || FALLBACK_WALLET).toLowerCase()
  const { jobs } = await loadNormalizedJobs(resolvedWallet)

  return jobs.map((job) => ({
    ...job,
    costLabel: formatMatic(job.paymentMatic),
    createdAtLabel: formatDateTime(job.createdAtIso),
  }))
}

export async function fetchBuyerDashboard(wallet?: string): Promise<BuyerDashboardData> {
  const resolvedWallet = (wallet || FALLBACK_WALLET).toLowerCase()
  const { jobs, models } = await loadNormalizedJobs(resolvedWallet)

  const totalJobs = jobs.length
  const activeJobs = jobs.filter((job) => isLiveStatus(job.status))
  const completedJobs = jobs.filter((job) => job.status === "completed")
  const failedJobs = jobs.filter((job) => job.status === "failed")
  const totalSpent = jobs.reduce((sum, job) => sum + job.paymentMatic, 0)
  const avgCost = totalJobs > 0 ? totalSpent / totalJobs : 0

  const stats: BuyerDashboardStat[] = [
    {
      title: "Total Jobs Submitted",
      value: new Intl.NumberFormat("en-US").format(totalJobs),
      change: `${completedJobs.length} completed`,
      trend: totalJobs > 0 ? "up" : "neutral",
    },
    {
      title: "Active Jobs",
      value: new Intl.NumberFormat("en-US").format(activeJobs.length),
      change: activeJobs.length > 0 ? "Running" : "No active jobs",
      trend: activeJobs.length > 0 ? "up" : "neutral",
    },
    {
      title: "Total Spent",
      value: formatMatic(totalSpent),
      change: failedJobs.length > 0 ? `${failedJobs.length} failed` : "No failures",
      trend: failedJobs.length > 0 ? "down" : "up",
    },
    {
      title: "Average Job Cost",
      value: formatMatic(avgCost),
      change: totalJobs > 0 ? "Based on live jobs" : "Awaiting jobs",
      trend: totalJobs > 0 ? "up" : "neutral",
    },
  ]

  const topModels = [...models]
    .sort((a, b) => {
      if (b.jobs !== a.jobs) return b.jobs - a.jobs
      return b.rating - a.rating
    })
    .slice(0, 4)
    .map((model: MarketplaceModel) => ({
      id: model.id,
      name: model.name,
      category: model.category || "other",
      description: model.description || "No description provided.",
      runs: Math.max(0, model.jobs),
    }))

  return {
    wallet: resolvedWallet,
    stats,
    activeJobs: jobs.slice(0, 5).map((job) => ({
      id: job.id,
      model: job.modelName,
      status: job.status,
      progress: job.progress,
      startedAt: job.startedAtLabel,
    })),
    recommendedModels: topModels,
  }
}
