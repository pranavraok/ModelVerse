"use client"

/**
 * FILE: app/node-operator/nodes/page.tsx
 *
 * Replaces the old multi-node list page.
 * - Shows single node from localStorage + live Supabase stats
 * - Polls GET /api/jobs every 5s — pending (queue) + assigned (running) + completed
 * - "Unstake & Logout" → deactivate node + stop Docker + fire unstake tx + clear localStorage
 * - NO "Register New Node" button — registration happens at login/signup
 * - FCFS queue display: pending jobs listed oldest-first with position numbers
 */

import { useEffect, useState, useCallback } from "react"
import { useRouter }                         from "next/navigation"
import { useAccount, useWriteContract }      from "wagmi"
import {
  Activity, Server, Cpu, Database, RefreshCw,
  Power, Loader2, CheckCircle2, Clock,
} from "lucide-react"

import { DashboardHeader } from "@/components/dashboard/header"
import { Card }            from "@/components/ui/card"
import { Button }          from "@/components/ui/button"

// ─── env ──────────────────────────────────────────────────────────────────────
const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000"

const STAKING_CONTRACT =
  (process.env.NEXT_PUBLIC_STAKING_CONTRACT ??
    "0x0000000000000000000000000000000000000000") as `0x${string}`

const UNSTAKE_ABI = [
  {
    name: "unstake",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
] as const

const LS_NODE_KEY = "modelverse_node_registration"

// ─── types ────────────────────────────────────────────────────────────────────
interface NodeRegistration {
  node_id:       string
  api_key:       string
  node_name:     string
  wallet:        string
  tx_hash:       string
  registered_at: string
}

interface NodeStats {
  node_id:              string
  node_name:            string
  is_active:            boolean
  reputation_score:     number
  total_jobs_completed: number
  stake_matic:          number
}

interface Job {
  id:           string
  status:       "pending" | "assigned" | "completed" | "failed"
  model_cid?:   string
  created_at:   string
  completed_at?: string
  result?:      string
}

// ─── helpers ──────────────────────────────────────────────────────────────────
function timeAgo(iso: string | undefined): string {
  if (!iso) return "Never"
  const diff = Date.now() - new Date(iso).getTime()
  const m    = Math.floor(diff / 60_000)
  if (m < 1)  return "Just now"
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function statusColor(status: Job["status"]): string {
  return {
    pending:   "bg-amber-400/20 text-amber-300 border-amber-400/30",
    assigned:  "bg-blue-400/20 text-blue-300 border-blue-400/30",
    completed: "bg-emerald-400/20 text-emerald-300 border-emerald-400/30",
    failed:    "bg-red-400/20 text-red-300 border-red-400/30",
  }[status] ?? "bg-muted/20 text-muted-foreground"
}

function getNodeReg(): NodeRegistration | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(LS_NODE_KEY)
    return raw ? (JSON.parse(raw) as NodeRegistration) : null
  } catch { return null }
}

// ─── page ─────────────────────────────────────────────────────────────────────
export default function NodesPage() {
  const router            = useRouter()
  const { address }       = useAccount()
  const { writeContract } = useWriteContract()

  const [reg,          setReg]          = useState<NodeRegistration | null>(null)
  const [nodeStats,    setNodeStats]    = useState<NodeStats | null>(null)
  const [jobs,         setJobs]         = useState<Job[]>([])
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [lastRefresh,  setLastRefresh]  = useState<Date>(new Date())

  // read localStorage once on mount
  useEffect(() => {
    const r = getNodeReg()
    if (!r) { router.replace("/login"); return }
    setReg(r)
  }, [router])

  // ── fetch live node stats ─────────────────────────────────────────────────
  const fetchNodeStats = useCallback(async () => {
    if (!address) return
    try {
      const res = await fetch(`${BACKEND_URL}/api/nodes/status`, {
        headers: { "x-wallet-address": address.toLowerCase() },
      })
      if (!res.ok) return
      const data = await res.json() as { registered: boolean; node: NodeStats | null }
      if (data.registered && data.node) setNodeStats(data.node)
    } catch {}
  }, [address])

  // ── fetch live jobs ───────────────────────────────────────────────────────
  const fetchJobs = useCallback(async () => {
    if (!address) return
    try {
      const res = await fetch(`${BACKEND_URL}/api/jobs`, {
        headers: { "x-wallet-address": address.toLowerCase() },
      })
      if (!res.ok) return
      const data = await res.json() as { items: Job[] }
      const sorted = [...(data.items ?? [])].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
      setJobs(sorted)
      setLastRefresh(new Date())
    } catch {}
  }, [address])

  // ── polling ───────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchNodeStats()
    fetchJobs()
    const t1 = setInterval(fetchNodeStats, 10_000)
    const t2 = setInterval(fetchJobs,      5_000)
    return () => { clearInterval(t1); clearInterval(t2) }
  }, [fetchNodeStats, fetchJobs])

  // ── logout ────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    if (!address) return
    setIsLoggingOut(true)
    const wallet = address.toLowerCase()

    // deactivate in Supabase
    await fetch(`${BACKEND_URL}/api/nodes/deactivate`, {
      method: "POST", headers: { "x-wallet-address": wallet },
    }).catch(() => {})

    // stop Docker daemon
    await fetch(`${BACKEND_URL}/api/docker/stop`, {
      method: "POST", headers: { "x-wallet-address": wallet },
    }).catch(() => {})

    // fire unstake tx (user confirms in MetaMask)
    try {
      writeContract({ address: STAKING_CONTRACT, abi: UNSTAKE_ABI, functionName: "unstake" })
    } catch {}

    // clear state + redirect
    localStorage.removeItem(LS_NODE_KEY)
    localStorage.removeItem("userRole")
    setTimeout(() => router.push("/login"), 600)
  }

  // ── derived ───────────────────────────────────────────────────────────────
  const pendingJobs   = jobs.filter(j => j.status === "pending")
  const activeJobs    = jobs.filter(j => j.status === "assigned")
  const completedJobs = jobs.filter(j => j.status === "completed").slice(0, 5)

  const displayName  = nodeStats?.node_name ?? reg?.node_name ?? `Node-${reg?.node_id?.slice(0, 8) ?? "…"}`
  const repPct       = Math.round((nodeStats?.reputation_score ?? 0.5) * 100)
  const isActive     = nodeStats?.is_active ?? true

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen">
      <DashboardHeader
        title="Node Dashboard"
        subtitle="Single-node inference operator — jobs are processed first-come first-served"
      />

      <div className="p-6 space-y-6">

        {/* ── top bar ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* live indicator */}
            <div className="flex items-center gap-2 rounded-full bg-card/40 border border-border/40 px-3 py-1.5">
              <span className={`h-2 w-2 rounded-full ${isActive ? "bg-emerald-400 animate-pulse" : "bg-gray-500"}`} />
              <span className="text-xs font-medium">{isActive ? "Online" : "Offline"}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => { fetchNodeStats(); fetchJobs() }}>
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              <span className="text-xs text-muted-foreground">
                {timeAgo(lastRefresh.toISOString())}
              </span>
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="border-destructive/40 text-destructive hover:bg-destructive/10 gap-2"
          >
            {isLoggingOut
              ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Stopping...</>
              : <><Power className="h-3.5 w-3.5" />Unstake &amp; Logout</>
            }
          </Button>
        </div>

        {/* ── node identity card ── */}
        {reg && (
          <Card className="border-border/40 bg-card/30 p-5">
            <div className="flex items-start gap-4">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                isActive ? "bg-emerald-400/10 ring-1 ring-emerald-400/30" : "bg-muted/20"
              }`}>
                <Server className={`h-6 w-6 ${isActive ? "text-emerald-400" : "text-muted-foreground"}`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="font-semibold truncate">{displayName}</h2>
                  <span className={`shrink-0 text-[10px] font-medium uppercase tracking-wider rounded-full px-2 py-0.5 border ${
                    isActive ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/30"
                             : "bg-muted/10 text-muted-foreground border-border/40"
                  }`}>
                    {isActive ? "active" : "offline"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-mono">
                  ID: {reg.node_id}
                </p>
                {reg.tx_hash && reg.tx_hash !== "existing-stake" && (
                  <a
                    href={`https://amoy.polygonscan.com/tx/${reg.tx_hash}`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-xs text-primary/70 hover:text-primary font-mono mt-0.5 inline-block"
                  >
                    Stake tx: {reg.tx_hash.slice(0, 14)}… ↗
                  </a>
                )}
              </div>
            </div>

            {/* stats row */}
            <div className="mt-5 grid grid-cols-3 gap-4 pt-4 border-t border-border/20">
              {[
                { icon: Cpu,      label: "Jobs done",   value: nodeStats?.total_jobs_completed ?? 0 },
                { icon: Database, label: "Stake",        value: `${nodeStats?.stake_matic ?? 1} MATIC` },
                { icon: Activity, label: "Reputation",   value: `${repPct}%` },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="text-center">
                  <Icon className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
                  <p className="text-lg font-bold">{value}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
                </div>
              ))}
            </div>

            {/* reputation bar */}
            <div className="mt-4">
              <div className="h-1.5 w-full rounded-full bg-muted/40 overflow-hidden">
                <div
                  className={`h-full transition-all duration-700 ${
                    repPct > 70 ? "bg-emerald-400" : repPct > 40 ? "bg-primary" : "bg-destructive"
                  }`}
                  style={{ width: `${repPct}%` }}
                />
              </div>
            </div>
          </Card>
        )}

        {/* ── active jobs (running right now) ── */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Running Now</h2>
            {activeJobs.length > 0 && (
              <span className="text-xs bg-blue-500 text-white rounded-full px-2 py-0.5 font-medium">
                {activeJobs.length}
              </span>
            )}
          </div>

          {activeJobs.length === 0 ? (
            <Card className="border-border/30 bg-card/20 p-4 text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin shrink-0" />
              Daemon polling — jobs will appear here automatically every 5s
            </Card>
          ) : (
            <div className="space-y-2">
              {activeJobs.map(job => (
                <Card key={job.id} className="border-blue-400/20 bg-blue-400/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-400 shrink-0" />
                      <span className="font-mono text-xs truncate">{job.id}</span>
                    </div>
                    <span className={`shrink-0 text-[10px] font-medium uppercase px-2 py-0.5 rounded-full border ${statusColor(job.status)}`}>
                      running
                    </span>
                  </div>
                  {job.model_cid && (
                    <p className="text-xs text-muted-foreground mt-1.5 ml-6 font-mono">
                      {job.model_cid.slice(0, 30)}…
                    </p>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* ── pending queue (FCFS) ── */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Pending Queue
            </h2>
            <span className="text-[10px] text-muted-foreground">(first-come first-served)</span>
            {pendingJobs.length > 0 && (
              <span className="text-xs bg-amber-500 text-white rounded-full px-2 py-0.5 font-medium ml-auto">
                {pendingJobs.length} waiting
              </span>
            )}
          </div>

          {pendingJobs.length === 0 ? (
            <Card className="border-border/30 bg-card/20 p-4 text-sm text-muted-foreground">
              Queue empty — new buyer jobs will appear here automatically
            </Card>
          ) : (
            <div className="space-y-1.5">
              {pendingJobs.map((job, idx) => (
                <Card key={job.id} className="border-border/30 bg-card/20 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-muted-foreground w-5 shrink-0 text-center">
                      #{idx + 1}
                    </span>
                    <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    <span className="font-mono text-xs flex-1 truncate">{job.id}</span>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {timeAgo(job.created_at)}
                    </span>
                    <span className={`shrink-0 text-[10px] font-medium uppercase px-2 py-0.5 rounded-full border ${statusColor(job.status)}`}>
                      {job.status}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* ── completed jobs ── */}
        {completedJobs.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Recently Completed
            </h2>
            <div className="space-y-1.5">
              {completedJobs.map(job => {
                let creditScore: number | null = null
                if (job.result) {
                  try {
                    const parsed = JSON.parse(job.result) as { credit_score?: number }
                    if (parsed.credit_score !== undefined) creditScore = parsed.credit_score
                  } catch {}
                }
                return (
                  <Card key={job.id} className="border-border/20 bg-card/10 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span className="font-mono text-xs flex-1 truncate">{job.id}</span>
                      {creditScore !== null && (
                        <span className="text-xs text-emerald-400 font-medium shrink-0">
                          score: {creditScore.toFixed(3)}
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {timeAgo(job.completed_at ?? job.created_at)}
                      </span>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* ── daemon info ── */}
        <Card className="border-border/20 bg-card/10 p-4">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <div>
              <p className="text-sm font-medium">Inference Daemon</p>
              <p className="text-xs text-muted-foreground">
                Docker container polling Supabase every 5s · FCFS · ONNX runtime
              </p>
            </div>
          </div>
        </Card>

      </div>
    </div>
  )
}