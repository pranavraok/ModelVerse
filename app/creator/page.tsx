"use client"

import { useEffect, useMemo, useState } from "react"
import { useAccount } from "wagmi"
import { DashboardHeader } from "@/components/dashboard/header"
import { BarChart, DollarSign, Upload, Users, ArrowUpRight, Activity, Cpu, Shield, Zap } from "lucide-react"

import { cn } from "@/lib/utils"
import { EMPTY_CREATOR_DASHBOARD, fetchCreatorDashboard } from "@/lib/creator-api"

function formatCompactNumber(value: number): string {
  if (!Number.isFinite(value)) return "0"
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value)
}

function formatMatic(value: number): string {
  if (!Number.isFinite(value)) return "0 MATIC"
  return `${new Intl.NumberFormat("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 3 }).format(value)} MATIC`
}

export default function CreatorDashboard() {
  const { address } = useAccount()
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [dashboardData, setDashboardData] = useState(EMPTY_CREATOR_DASHBOARD)

  useEffect(() => {
    let ignore = false

    const loadDashboard = async () => {
      if (!address) {
        setDashboardData(EMPTY_CREATOR_DASHBOARD)
        setLoadError("")
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setLoadError("")
        const data = await fetchCreatorDashboard(address)
        if (!ignore) {
          setDashboardData(data)
        }
      } catch (error) {
        if (!ignore) {
          setLoadError(error instanceof Error ? error.message : "Failed to load creator dashboard")
          setDashboardData(EMPTY_CREATOR_DASHBOARD)
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    void loadDashboard()
    return () => {
      ignore = true
    }
  }, [address])

  const stats = useMemo(
    () => [
      {
        title: "Total Earnings",
        value: formatMatic(dashboardData.summary.totalEarningsMatic),
        change: `${dashboardData.summary.completedJobs} completed`,
        icon: DollarSign,
        trend: "up",
      },
      {
        title: "Active Models",
        value: String(dashboardData.summary.activeModels),
        change: `${dashboardData.topModels.length} ranked`,
        icon: Upload,
        trend: dashboardData.summary.activeModels > 0 ? "up" : "down",
      },
      {
        title: "Total Inferences",
        value: formatCompactNumber(dashboardData.summary.totalInferences),
        change: `${dashboardData.summary.totalJobs} total jobs`,
        icon: Activity,
        trend: dashboardData.summary.totalInferences > 0 ? "up" : "down",
      },
      {
        title: "Unique Users",
        value: formatCompactNumber(dashboardData.summary.uniqueUsers),
        change: `${dashboardData.summary.pendingJobs} pending`,
        icon: Users,
        trend: dashboardData.summary.uniqueUsers > 0 ? "up" : "down",
      },
    ],
    [dashboardData]
  )

  const recentModels = dashboardData.topModels

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-[#050505] to-emerald-950 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-primary/20 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
      </div>
      
      <DashboardHeader title="Creator Hub" subtitle="Manage your models and earnings" />
      
      <div className="relative z-10 p-8 space-y-10">
        
        {/* Welcome Section */}
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.05] w-fit mb-2">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
            <span className="text-xs font-semibold text-slate-300 tracking-normal">Network Operational</span>
          </div>
          <h2 className="text-2xl font-semibold tracking-normal text-white/95 flex items-center gap-3">
            System Overview
            <Zap className="h-6 w-6 text-primary fill-primary/20" />
          </h2>
          <p className="text-xs font-semibold text-slate-300 mt-1 tracking-normal">Monitor your model performance and engagement metrics.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <div key={i} className="glass-card rounded-2xl p-6 border-white/[0.15] bg-white/[0.08] backdrop-blur-3xl shadow-[0_0_30px_rgba(255,255,255,0.05)] hover:bg-white/[0.12] transition-colors group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                    <stat.icon className="h-4.5 w-4.5 text-neutral-400 group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="text-xs font-semibold text-slate-300 capitalize tracking-normal">{stat.title}</h3>
                </div>
                <div className={cn(
                  "flex items-center gap-1 text-xs font-semibold capitalize tracking-[0.15em] px-2 py-1 rounded-md bg-white/[0.03] border border-white/[0.05]",
                  stat.trend === "up" ? "text-emerald-400" : "text-red-400"
                )}>
                  {stat.trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : null}
                  {stat.change}
                </div>
              </div>
              <div className="relative z-10">
                <div className="text-4xl font-semibold tracking-normal text-white shadow-none">{stat.value}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          {/* Main Chart Area placeholder */}
          <div className="glass-card rounded-2xl p-8 border-white/[0.15] bg-white/[0.08] backdrop-blur-3xl shadow-[0_0_40px_rgba(255,255,255,0.05)] lg:col-span-4 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent" />
            <div className="relative z-10 flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-semibold tracking-normal text-white/95">Earnings History</h3>
                <p className="text-xs font-semibold text-slate-300 mt-1 tracking-normal">Revenue over the last 30 days</p>
              </div>
            </div>
            <div className="h-[280px] w-full flex items-center justify-center rounded-2xl border border-white/[0.05] bg-white/[0.01] border-dashed">
              <div className="text-center">
                <BarChart className="h-8 w-8 text-neutral-600 mx-auto mb-3" />
                <p className="text-xs font-semibold text-slate-300 tracking-normal">Analytics visualization ready</p>
              </div>
            </div>
          </div>

          {/* Recent Models List */}
          <div className="glass-card rounded-2xl p-8 border-white/[0.15] bg-white/[0.08] backdrop-blur-3xl shadow-[0_0_40px_rgba(255,255,255,0.05)] lg:col-span-3 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-bl from-white/[0.05] to-transparent" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-semibold tracking-normal text-white/95">Top Performing Models</h3>
                  <p className="text-xs font-semibold text-slate-300 mt-1 tracking-normal">Ranked by computing yield</p>
                </div>
              </div>
              <div className="space-y-4">
                {recentModels.map((model, i) => (
                  <div key={model.id || i} className="flex className items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.03] hover:bg-white/[0.04] transition-all cursor-pointer group/item">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center group-hover/item:border-primary/30 transition-colors">
                        <Cpu className="h-4.5 w-4.5 text-neutral-400 group-hover/item:text-primary transition-colors" />
                      </div>
                      <div>
                        <p className="text-[15px] font-semibold tracking-normal text-white/90">{model.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Users className="h-3 w-3 text-neutral-500" />
                          <p className="text-xs font-semibold text-slate-400 tracking-normal">{model.users} users</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[15px] font-semibold tracking-normal text-white/90">{formatMatic(model.earningsMatic)}</p>
                      <div className="flex items-center justify-end gap-1.5 mt-1.5">
                        <div className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          model.status === "active" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-neutral-600"
                        )} />
                        <p className="text-xs font-semibold tracking-normal text-neutral-500 capitalize">{model.status}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {!isLoading && !loadError && recentModels.length === 0 && (
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.03] text-xs font-semibold text-slate-300 tracking-normal">
                    No model activity yet. Upload a model to start receiving live performance metrics.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {!address && !isLoading && (
          <div className="glass-card rounded-2xl p-4 border-white/[0.15] bg-white/[0.08] text-xs font-semibold text-slate-300 tracking-normal">
            Connect your wallet to view your real-time creator metrics.
          </div>
        )}

        {isLoading && (
          <div className="glass-card rounded-2xl p-4 border-white/[0.15] bg-white/[0.08] text-xs font-semibold text-slate-300 tracking-normal">
            Loading dashboard metrics from Supabase...
          </div>
        )}

        {loadError && !isLoading && (
          <div className="glass-card rounded-2xl p-4 border-white/[0.15] bg-white/[0.08] text-xs font-semibold text-red-300 tracking-normal">
            {loadError}
          </div>
        )}
      </div>
    </div>
  )
}
