"use client"

import { useEffect, useMemo, useState } from "react"
import { useAccount } from "wagmi"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card } from "@/components/ui/card"
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Zap,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Maximize2
} from "lucide-react"
import { EMPTY_CREATOR_DASHBOARD, fetchCreatorDashboard } from "@/lib/creator-api"

function formatCompact(value: number): string {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value)
}

function buildLinePath(points: number[], width: number, height: number): string {
  if (points.length === 0) {
    return `M0,${height * 0.75} L${width},${height * 0.75}`
  }

  const max = Math.max(...points, 1)
  const step = points.length > 1 ? width / (points.length - 1) : width
  return points
    .map((value, idx) => {
      const x = idx * step
      const y = height - (value / max) * (height * 0.8) - (height * 0.1)
      return `${idx === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`
    })
    .join(" ")
}

function buildAreaPath(points: number[], width: number, height: number): string {
  const line = buildLinePath(points, width, height)
  return `${line} L${width},${height} L0,${height} Z`
}

export default function CreatorAnalyticsPage() {
  const { address } = useAccount()
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [dashboardData, setDashboardData] = useState(EMPTY_CREATOR_DASHBOARD)

  useEffect(() => {
    let ignore = false

    const loadData = async () => {
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
          setLoadError(error instanceof Error ? error.message : "Failed to load analytics")
          setDashboardData(EMPTY_CREATOR_DASHBOARD)
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    void loadData()
    return () => {
      ignore = true
    }
  }, [address])

  const kpis = useMemo(
    () => [
      {
        title: "Inference Volume",
        value: formatCompact(dashboardData.summary.totalInferences),
        change: `${dashboardData.summary.completedJobs} completed`,
        trend: dashboardData.summary.totalInferences > 0 ? "up" : "neutral",
        icon: Zap,
        description: "Total requests across all models",
      },
      {
        title: "Active Users",
        value: formatCompact(dashboardData.summary.uniqueUsers),
        change: `${dashboardData.summary.pendingJobs} pending`,
        trend: dashboardData.summary.uniqueUsers > 0 ? "up" : "neutral",
        icon: Users,
        description: "Unique wallets interacting",
      },
      {
        title: "Model Health",
        value: `${dashboardData.summary.modelHealthPct.toFixed(1)}%`,
        change: `${dashboardData.summary.totalJobs} jobs tracked`,
        trend: dashboardData.summary.modelHealthPct >= 95 ? "up" : dashboardData.summary.modelHealthPct > 0 ? "down" : "neutral",
        icon: Activity,
        description: "Completed jobs over total jobs",
      },
      {
        title: "Avg Latency",
        value: `${Math.round(dashboardData.summary.avgLatencyMs)}ms`,
        change: `${dashboardData.summary.activeModels} active models`,
        trend: dashboardData.summary.avgLatencyMs > 0 ? "up" : "neutral",
        icon: BarChart3,
        description: "Average job execution time",
      },
    ],
    [dashboardData]
  )

  const modelUsage = useMemo(() => {
    const palette = ["bg-primary", "bg-accent", "bg-chart-3", "bg-chart-4"]
    return dashboardData.usageDistribution.map((entry, idx) => ({
      name: entry.name,
      usage: Math.max(0, Math.min(100, entry.usagePercent)),
      color: palette[idx % palette.length],
    }))
  }, [dashboardData.usageDistribution])

  const chartPoints = useMemo(
    () => dashboardData.earningsHistory.map((point) => point.inferences),
    [dashboardData.earningsHistory]
  )

  const usageLinePath = useMemo(() => buildLinePath(chartPoints, 800, 240), [chartPoints])
  const usageAreaPath = useMemo(() => buildAreaPath(chartPoints, 800, 240), [chartPoints])
  const topPerformer = dashboardData.topModels[0]?.name || "No activity yet"

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-[#050505] to-emerald-950 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-primary/20 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
      </div>
      <DashboardHeader 
        title="Analytics" 
        subtitle="Deep dive into your AI model performance and audience"
      />
      
      <div className="p-6 space-y-6">
        {/* KPI Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <Card key={kpi.title} className="glass-card border-white/[0.15] bg-white/[0.08] backdrop-blur-3xl shadow-[0_0_30px_rgba(255,255,255,0.05)] p-6">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <kpi.icon className="h-5 w-5 text-primary" />
                </div>
                <div className={`flex items-center text-xs font-medium ${
                  kpi.trend === 'up' ? 'text-accent' : kpi.trend === 'down' ? 'text-destructive' : 'text-muted-foreground'
                }`}>
                  {kpi.change}
                  {kpi.trend === 'up' ? <ArrowUpRight className="ml-0.5 h-3 w-3" /> : kpi.trend === 'down' ? <ArrowDownRight className="ml-0.5 h-3 w-3" /> : null}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">{kpi.title}</p>
                <p className="text-2xl font-bold">{kpi.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{kpi.description}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Chart */}
          <Card className="lg:col-span-2 glass-card border-white/[0.15] bg-white/[0.08] backdrop-blur-3xl shadow-[0_0_30px_rgba(255,255,255,0.05)] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold">Usage Trends</h3>
                <p className="text-sm text-muted-foreground">Inference requests over the last 30 days</p>
              </div>
              <button className="rounded-lg p-2 hover:bg-muted/50 transition-colors">
                <Maximize2 className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            
            <div className="relative h-72 w-full">
              <svg className="h-full w-full" viewBox="0 0 800 240" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="usageGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgb(139 92 246)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="rgb(139 92 246)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Grid Lines */}
                {[0, 60, 120, 180, 240].map((y) => (
                  <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                ))}
                {/* Area Path */}
                <path
                  d={usageAreaPath}
                  fill="url(#usageGradient)"
                />
                {/* Line Path */}
                <path
                  d={usageLinePath}
                  fill="none"
                  stroke="rgb(139 92 246)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              <div className="mt-4 flex justify-between text-xs text-muted-foreground">
                <span>30d ago</span>
                <span>24d</span>
                <span>18d</span>
                <span>12d</span>
                <span>Today</span>
              </div>
            </div>
          </Card>

          {/* Model Distribution */}
          <Card className="glass-card border-white/[0.15] bg-white/[0.08] backdrop-blur-3xl shadow-[0_0_30px_rgba(255,255,255,0.05)] p-6">
            <h3 className="text-lg font-semibold mb-6">Usage Distribution</h3>
            <div className="space-y-6">
              {modelUsage.map((model, idx) => (
                <div key={`${model.name}-${idx}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{model.name}</span>
                    <span className="text-sm text-muted-foreground">{model.usage}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div 
                      className={`h-full ${model.color} transition-all duration-1000`}
                      style={{ width: `${model.usage}%` }}
                    />
                  </div>
                </div>
              ))}

              {!isLoading && !loadError && modelUsage.length === 0 && (
                <div className="text-sm text-muted-foreground">No usage data yet for your models.</div>
              )}
            </div>
            
            <div className="mt-8 pt-6 border-t border-border/40">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Top Performer</span>
                  <span className="text-sm font-semibold text-accent">{topPerformer}</span>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                  <TrendingUp className="h-5 w-5 text-accent" />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Geographic Insights Placeholder */}
        <Card className="glass-card border-white/[0.15] bg-white/[0.08] backdrop-blur-3xl shadow-[0_0_30px_rgba(255,255,255,0.05)] p-8 flex flex-col items-center justify-center text-center">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold">Audience Insights</h3>
          <p className="max-w-md mt-2 text-muted-foreground">
            Audience insights are computed from buyer wallets using your completed jobs in Supabase.
          </p>
          <div className="mt-6 h-2 w-full max-w-sm rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-primary" style={{ width: `${Math.min((dashboardData.summary.totalInferences / 5000) * 100, 100)}%` }} />
          </div>
          <span className="mt-2 text-xs text-muted-foreground">{dashboardData.summary.totalInferences} / 5,000 Inferences</span>
        </Card>

        {!address && !isLoading && (
          <Card className="glass-card border-white/[0.15] bg-white/[0.08] backdrop-blur-3xl p-4 text-sm text-muted-foreground">
            Connect your wallet to view creator analytics.
          </Card>
        )}

        {isLoading && (
          <Card className="glass-card border-white/[0.15] bg-white/[0.08] backdrop-blur-3xl p-4 text-sm text-muted-foreground">
            Loading analytics from Supabase...
          </Card>
        )}

        {loadError && !isLoading && (
          <Card className="glass-card border-white/[0.15] bg-white/[0.08] backdrop-blur-3xl p-4 text-sm text-red-300">
            {loadError}
          </Card>
        )}
      </div>
    </div>
  )
}
