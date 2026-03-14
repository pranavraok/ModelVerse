"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useAccount } from "wagmi"
import { DashboardHeader } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { fetchBuyerJobs, type BuyerJobStatus } from "@/lib/buyer-api"
import { 
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Eye,
  Zap
} from "lucide-react"

const statusConfig = {
  assigned: { label: "Assigned", color: "bg-indigo-500/20 text-indigo-300", icon: Zap },
  pending: { label: "Pending", color: "bg-chart-4/20 text-chart-4", icon: Clock },
  running: { label: "Running", color: "bg-primary/20 text-primary", icon: RefreshCw },
  completed: { label: "Completed", color: "bg-accent/20 text-accent", icon: CheckCircle },
  failed: { label: "Failed", color: "bg-destructive/20 text-destructive", icon: AlertCircle }
}

type JobsFilter = "all" | BuyerJobStatus

interface JobsPageItem {
  id: string
  model: string
  status: BuyerJobStatus
  progress: number
  cost: string
  createdAt: string
}

export default function JobsPage() {
  const { address } = useAccount()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<JobsFilter>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [jobs, setJobs] = useState<JobsPageItem[]>([])

  useEffect(() => {
    let ignore = false

    const loadJobs = async () => {
      if (!address) {
        setJobs([])
        setLoadError("")
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setLoadError("")

        const rows = await fetchBuyerJobs(address)
        if (!ignore) {
          setJobs(
            rows.map((row) => ({
              id: row.id,
              model: row.modelName,
              status: row.status,
              progress: row.progress,
              cost: row.costLabel,
              createdAt: row.createdAtLabel,
            }))
          )
        }
      } catch (error) {
        if (!ignore) {
          setLoadError(error instanceof Error ? error.message : "Failed to load jobs")
          setJobs([])
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    void loadJobs()
    const timer = window.setInterval(() => {
      void loadJobs()
    }, 8000)

    return () => {
      ignore = true
      window.clearInterval(timer)
    }
  }, [address])

  const filteredJobs = useMemo(() => {
    const needle = searchQuery.trim().toLowerCase()
    return jobs.filter((job) => {
      const statusMatch = statusFilter === "all" ? true : job.status === statusFilter
      const textMatch =
        needle.length === 0 ||
        job.id.toLowerCase().includes(needle) ||
        job.model.toLowerCase().includes(needle)
      return statusMatch && textMatch
    })
  }, [jobs, searchQuery, statusFilter])

  return (
    <div className="min-h-screen bg-transparent bg-mesh relative">
      <DashboardHeader 
        title="Neural Jobs" 
        subtitle="Monitor and manage your real-time inference cycles"
      />
      
      <div className="relative z-10 px-8 py-8">
        {/* Filters */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between mb-10">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search by mission ID or model..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="h-12 bg-white/[0.02] border-white/[0.03] pl-11 rounded-2xl focus:ring-primary/20 focus:border-primary/40 text-white/80 placeholder:text-muted-foreground/20 font-medium"
            />
          </div>
          <div className="flex items-center gap-4">
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as JobsFilter)}>
              <SelectTrigger className="h-12 w-48 bg-white/[0.02] border-white/[0.03] rounded-2xl text-[11px] font-semibold text-muted-foreground/60 transition-all hover:bg-white/[0.04]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-[#0c0c0c] border-white/[0.05] rounded-2xl overflow-hidden">
                <SelectItem value="all" className="text-[10px] capitalize font-semibold tracking-normal text-muted-foreground focus:bg-primary/10 focus:text-primary">All Activity</SelectItem>
                <SelectItem value="assigned" className="text-[10px] capitalize font-semibold tracking-normal text-muted-foreground focus:bg-primary/10 focus:text-primary">Assigned</SelectItem>
                <SelectItem value="pending" className="text-[10px] capitalize font-semibold tracking-normal text-muted-foreground focus:bg-primary/10 focus:text-primary">Pending</SelectItem>
                <SelectItem value="running" className="text-[10px] capitalize font-semibold tracking-normal text-muted-foreground focus:bg-primary/10 focus:text-primary">Running</SelectItem>
                <SelectItem value="completed" className="text-[10px] capitalize font-semibold tracking-normal text-muted-foreground focus:bg-primary/10 focus:text-primary">Success</SelectItem>
                <SelectItem value="failed" className="text-[10px] capitalize font-semibold tracking-normal text-muted-foreground focus:bg-primary/10 focus:text-primary">Fault</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Jobs List */}
        <div className="grid gap-6">
          {!address && !isLoading && (
            <div className="glass-card p-6 text-xs font-semibold text-slate-300 tracking-normal">
              Connect your wallet to view your submitted jobs.
            </div>
          )}

          {isLoading && (
            <div className="glass-card p-6 text-xs font-semibold text-slate-300 tracking-normal">
              Loading jobs from backend...
            </div>
          )}

          {loadError && !isLoading && (
            <div className="glass-card p-6 text-xs font-semibold text-red-300 tracking-normal">
              {loadError}
            </div>
          )}

          {!isLoading && !loadError && address && filteredJobs.length === 0 && (
            <div className="glass-card p-6 text-xs font-semibold text-slate-300 tracking-normal">
              No jobs found for this wallet yet.
            </div>
          )}

          {filteredJobs.map((job) => {
            const status = statusConfig[job.status as keyof typeof statusConfig]
            const StatusIcon = status.icon
            
            return (
              <div key={job.id} className="glass-card hover:bg-white/[0.03] transition-all duration-500 overflow-hidden group">
                <div className="p-8">
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-6">
                      <div className={cn(
                        "flex h-16 w-16 items-center justify-center rounded-[1.5rem] border transition-all duration-500",
                        job.status === 'running' ? "bg-primary/10 border-primary/20 shadow-[0_0_20px_rgba(139,92,246,0.1)]" :
                        job.status === 'failed' ? "bg-red-500/10 border-red-500/20" :
                        job.status === 'completed' ? "bg-emerald-500/10 border-emerald-500/20" :
                        "bg-white/[0.02] border-white/5"
                      )}>
                        <StatusIcon className={cn(
                          "h-8 w-8",
                          job.status === 'running' ? "text-primary animate-spin" :
                          job.status === 'failed' ? "text-red-400" :
                          job.status === 'completed' ? "text-emerald-400" :
                          "text-muted-foreground/30"
                        )} />
                      </div>
                      <div>
                        <div className="flex items-center gap-4">
                          <h3 className="text-xl font-semibold tracking-normal text-white">{job.model}</h3>
                          <span className={cn(
                            "rounded-xl px-3 py-1 text-[9px] font-semibold text-neutral-500 border",
                            job.status === 'running' ? "bg-primary/10 border-primary/20 text-primary" :
                            job.status === 'failed' ? "bg-red-500/10 border-red-500/20 text-red-400" :
                            job.status === 'completed' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                            "bg-white/[0.02] border-white/[0.03] text-muted-foreground/40"
                          )}>
                            {status.label}
                          </span>
                        </div>
                        <p className="mt-1 text-[10px] font-semibold text-muted-foreground/20 capitalize tracking-normal">{job.id}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-10">
                      <div className="text-right">
                        <p className="text-lg font-semibold text-white tracking-normal">{job.cost}</p>
                        <p className="text-[10px] font-semibold text-muted-foreground/20 mt-1 italic">{job.createdAt}</p>
                      </div>
                      <div className="flex gap-3">
                        <Link href={`/buyer/jobs/${job.id}`}>
                          <Button variant="ghost" className="h-12 w-12 rounded-2xl bg-white/[0.02] border border-white/[0.03] hover:bg-white/[0.04] text-muted-foreground/40 hover:text-white p-0">
                            <Eye className="h-5 w-5" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Progress bar for active jobs */}
                  {(job.status === 'running' || job.status === 'assigned' || job.status === 'pending') && (
                    <div className="mt-8 pt-8 border-t border-white/5">
                      <div className="flex justify-between text-[10px] font-semibold capitalize tracking-normalr mb-4">
                        <span className="text-primary/60">Optimizing Neural Path</span>
                        <span className="text-primary">{job.progress}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.02] border border-white/5">
                        <div 
                          className="h-full bg-gradient-to-r from-primary/40 to-primary transition-all duration-1000 relative shadow-[0_0_20px_rgba(139,92,246,0.6)]"
                          style={{ width: `${job.progress}%` }}
                        >
                          <div className="absolute top-0 right-0 h-full w-20 bg-gradient-to-r from-transparent to-white/20 animate-pulse" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
