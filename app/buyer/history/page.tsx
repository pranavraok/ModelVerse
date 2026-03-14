"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useAccount } from "wagmi"
import { DashboardHeader } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { 
  Search, 
  Download,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Play,
  TrendingUp,
  RefreshCw,
  Clock
} from "lucide-react"
import { cn } from "@/lib/utils"
import { fetchBuyerJobs, type BuyerJobStatus } from "@/lib/buyer-api"

type HistoryFilter = "all" | BuyerJobStatus

interface HistoryRow {
  id: string
  model: string
  status: BuyerJobStatus
  cost: string
  date: string
  paymentMatic: number
}

export default function BuyerHistoryPage() {
  const { address } = useAccount()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<HistoryFilter>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [history, setHistory] = useState<HistoryRow[]>([])

  useEffect(() => {
    let ignore = false

    const loadHistory = async () => {
      if (!address) {
        setHistory([])
        setLoadError("")
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setLoadError("")
        const rows = await fetchBuyerJobs(address)
        if (!ignore) {
          setHistory(
            rows.map((row) => ({
              id: row.id,
              model: row.modelName,
              status: row.status,
              cost: row.costLabel,
              date: row.createdAtLabel,
              paymentMatic: row.paymentMatic,
            }))
          )
        }
      } catch (error) {
        if (!ignore) {
          setLoadError(error instanceof Error ? error.message : "Failed to load history")
          setHistory([])
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    void loadHistory()
    const timer = window.setInterval(() => {
      void loadHistory()
    }, 10000)

    return () => {
      ignore = true
      window.clearInterval(timer)
    }
  }, [address])

  const filteredHistory = useMemo(() => {
    const needle = searchQuery.trim().toLowerCase()
    return history.filter((job) => {
      const statusMatch = statusFilter === "all" ? true : job.status === statusFilter
      const textMatch =
        needle.length === 0 ||
        job.id.toLowerCase().includes(needle) ||
        job.model.toLowerCase().includes(needle)
      return statusMatch && textMatch
    })
  }, [history, searchQuery, statusFilter])

  const totals = useMemo(() => {
    const totalRuns = history.length
    const completed = history.filter((job) => job.status === "completed").length
    const successRate = totalRuns > 0 ? (completed / totalRuns) * 100 : 0
    const totalSpent = history.reduce((sum, job) => sum + job.paymentMatic, 0)
    return {
      totalRuns,
      completed,
      successRate,
      totalSpent,
    }
  }, [history])

  return (
    <div className="min-h-screen bg-transparent bg-mesh relative">
      <DashboardHeader 
        title="Neural History" 
        subtitle="Chronicle of your decentralized AI operations"
      />
      
      <div className="relative z-10 p-8 space-y-10">
        {/* Stats Row */}
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="glass-card p-8 border-white/[0.05] group">
            <p className="text-[10px] font-semibold text-muted-foreground/30 capitalize tracking-normalr">Total Intelligence Run</p>
            <div className="flex items-baseline gap-2 mt-4">
              <p className="text-4xl font-semibold text-white tracking-tight">{new Intl.NumberFormat("en-US").format(totals.totalRuns)}</p>
              <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-500">
                <TrendingUp className="h-3 w-3" />
                <span>{totals.completed}</span>
              </div>
            </div>
            <p className="text-[9px] font-semibold text-muted-foreground/20 mt-2 italic shadow-sm">Verified on-chain submissions</p>
          </div>
          
          <div className="glass-card p-8 border-white/[0.05]">
            <p className="text-[10px] font-semibold text-muted-foreground/30 capitalize tracking-normalr">Execution Fidelity</p>
            <p className="text-4xl font-semibold text-white tracking-tight mt-4">{totals.successRate.toFixed(1)}%</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <span className="text-[9px] font-semibold text-emerald-500/60">Live success rate from your jobs</span>
            </div>
          </div>

          <div className="glass-card p-8 border-white/[0.05]">
            <p className="text-[10px] font-semibold text-muted-foreground/30 capitalize tracking-normalr">Sovereign Savings</p>
            <p className="text-4xl font-semibold text-primary tracking-tight mt-4">{totals.totalSpent.toFixed(3)} <span className="text-sm font-semibold capitalize italic">MATIC</span></p>
            <p className="text-[9px] font-semibold text-muted-foreground/20 mt-2 italic">Total spend across all submitted jobs</p>
          </div>
        </div>

        {/* Filters/Actions */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-4 max-w-md group">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/20 group-focus-within:text-primary" />
              <input 
                placeholder="Search history..." 
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full h-12 rounded-2xl bg-white/[0.01] border border-white/[0.03] pl-12 pr-4 text-[13px] font-medium text-white/80 placeholder:text-muted-foreground/20 focus:outline-none focus:ring-primary/20 focus:border-primary/40 transition-all"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as HistoryFilter)}
              className="h-12 rounded-2xl bg-white/[0.01] border border-white/[0.03] px-4 text-[12px] font-semibold text-muted-foreground/70 focus:outline-none focus:ring-primary/20 focus:border-primary/40"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="running">Running</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold text-slate-300">
            <RefreshCw className="h-4 w-4 text-primary" />
            Auto refresh every 10s
          </div>
        </div>

        {/* History Table */}
        <div className="glass-card border-white/[0.05] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.03] text-left">
                  <th className="px-8 py-5 text-[9px] font-semibold text-muted-foreground/20 capitalize tracking-normalr italic">Intelligence ID</th>
                  <th className="px-8 py-5 text-[9px] font-semibold text-muted-foreground/20 capitalize tracking-normalr italic">Transmission</th>
                  <th className="px-8 py-5 text-[9px] font-semibold text-muted-foreground/20 capitalize tracking-normalr italic">Weight</th>
                  <th className="px-8 py-5 text-[9px] font-semibold text-muted-foreground/20 capitalize tracking-normalr italic">Sequence</th>
                  <th className="px-8 py-5 text-[9px] font-semibold text-muted-foreground/20 capitalize tracking-normalr italic text-right">Ops</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {filteredHistory.map((job) => (
                  <tr key={job.id} className="hover:bg-white/[0.01] transition-all duration-300 group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-5">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500">
                          <Play className="h-5 w-5 text-primary fill-current" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white tracking-tight">{job.model}</p>
                          <p className="text-[10px] text-muted-foreground/20 font-semibold mt-1">{job.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className={cn(
                        "inline-flex items-center gap-2 rounded-xl px-3 py-1 text-[9px] font-semibold text-neutral-500 border",
                        job.status === 'completed'
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : job.status === 'failed'
                          ? 'bg-red-500/10 border-red-500/20 text-red-400'
                          : 'bg-primary/10 border-primary/20 text-primary'
                      )}>
                        {job.status === 'completed' ? <CheckCircle className="h-3 w-3 shadow-emerald-500/50" /> : job.status === 'failed' ? <AlertCircle className="h-3 w-3 shadow-red-500/50" /> : <Clock className="h-3 w-3" />}
                        {job.status}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-semibold text-white/80 tracking-tight">{job.cost}</p>
                    </td>
                    <td className="px-8 py-6 text-[10px] font-semibold text-muted-foreground/40 italic">
                      {job.date}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                        <Link href={`/buyer/jobs/${job.id}`}>
                          <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/[0.03] border border-white/[0.03] text-muted-foreground/40 hover:text-primary transition-all">
                            <ExternalLink className="h-4 w-4" />
                          </button>
                        </Link>
                        <button disabled className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/[0.03] border border-white/[0.03] text-muted-foreground/30 cursor-not-allowed">
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!isLoading && !loadError && address && filteredHistory.length === 0 && (
            <div className="px-8 py-8 border-t border-white/[0.03] text-xs font-semibold text-slate-300">
              No history records found for this wallet and filter.
            </div>
          )}

          {!address && !isLoading && (
            <div className="px-8 py-8 border-t border-white/[0.03] text-xs font-semibold text-slate-300">
              Connect your wallet to view real-time history.
            </div>
          )}

          {isLoading && (
            <div className="px-8 py-8 border-t border-white/[0.03] text-xs font-semibold text-slate-300">
              Loading history from backend...
            </div>
          )}

          {loadError && !isLoading && (
            <div className="px-8 py-8 border-t border-white/[0.03] text-xs font-semibold text-red-300">
              {loadError}
            </div>
          )}

          <div className="px-8 py-6 border-t border-white/[0.03] flex items-center justify-between text-[10px] font-semibold capitalize tracking-normal text-muted-foreground/20">
            <span>Archive Index: Showing {filteredHistory.length} of {history.length} records</span>
            <div className="flex gap-4">
              <Button variant="ghost" size="sm" disabled className="h-10 px-4 rounded-xl border border-white/[0.03] disabled:opacity-30">Previous</Button>
              <Button variant="ghost" size="sm" disabled className="h-10 px-4 rounded-xl border border-white/[0.03] disabled:opacity-30">Next</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
