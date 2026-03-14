"use client"

import { useEffect, useMemo, useState } from "react"
import { useAccount } from "wagmi"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EMPTY_CREATOR_DASHBOARD, fetchCreatorDashboard } from "@/lib/creator-api"
import { 
  Wallet, 
  TrendingUp, 
  Clock,
  ArrowUpRight,
  Download,
  ExternalLink
} from "lucide-react"

function formatMatic(value: number): string {
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 }).format(value)} MATIC`
}

function shortWallet(wallet: string): string {
  if (!wallet) return "-"
  if (wallet.length < 12) return wallet
  return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`
}

function formatDateTime(value: string): string {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date)
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

export default function EarningsPage() {
  const { address } = useAccount()
  const [isWithdrawing, setIsWithdrawing] = useState(false)
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
          setLoadError(error instanceof Error ? error.message : "Failed to load earnings")
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

  const chartPoints = useMemo(
    () => dashboardData.earningsHistory.map((point) => point.earningsMatic),
    [dashboardData.earningsHistory]
  )

  const earningsLinePath = useMemo(() => buildLinePath(chartPoints, 800, 200), [chartPoints])
  const earningsAreaPath = useMemo(() => buildAreaPath(chartPoints, 800, 200), [chartPoints])

  const handleWithdraw = async () => {
    setIsWithdrawing(true)
    // Simulate transaction
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsWithdrawing(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-[#050505] to-emerald-950 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-primary/20 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
      </div>
      <DashboardHeader 
        title="Earnings" 
        subtitle="Track your income and withdrawals"
      />
      
      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="glass-card border-white/[0.15] bg-white/[0.08] backdrop-blur-3xl shadow-[0_0_30px_rgba(255,255,255,0.05)] p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Lifetime Earnings</p>
                <p className="mt-2 text-3xl font-bold">{formatMatic(dashboardData.summary.totalEarningsMatic)}</p>
                <p className="mt-1 text-sm text-muted-foreground">{dashboardData.summary.completedJobs} completed jobs</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="glass-card border-white/[0.15] bg-white/[0.08] backdrop-blur-3xl shadow-[0_0_30px_rgba(255,255,255,0.05)] p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Earnings</p>
                <p className="mt-2 text-3xl font-bold">{formatMatic(dashboardData.summary.pendingEarningsMatic)}</p>
                <p className="mt-1 text-sm text-muted-foreground">From {dashboardData.summary.pendingJobs} active jobs</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-4/10">
                <Clock className="h-5 w-5 text-chart-4" />
              </div>
            </div>
          </Card>

          <Card className="glass-card border-white/[0.15] bg-white/[0.08] backdrop-blur-3xl shadow-[0_0_30px_rgba(255,255,255,0.05)] p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Withdrawable Balance</p>
                <p className="mt-2 text-3xl font-bold text-accent">{formatMatic(dashboardData.summary.withdrawableBalanceMatic)}</p>
                <p className="mt-1 text-sm text-muted-foreground">Available for settlement</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
                <Wallet className="h-5 w-5 text-accent" />
              </div>
            </div>
            <Button 
              className="mt-4 w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={handleWithdraw}
              disabled={isWithdrawing || dashboardData.summary.withdrawableBalanceMatic <= 0}
            >
              {isWithdrawing ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent-foreground border-t-transparent" />
              ) : (
                <>
                  <ArrowUpRight className="mr-2 h-4 w-4" />
                  Withdraw All
                </>
              )}
            </Button>
          </Card>
        </div>

        {/* Earnings Chart */}
        <Card className="mt-6 glass-card border-white/[0.15] bg-white/[0.08] backdrop-blur-3xl shadow-[0_0_30px_rgba(255,255,255,0.05)] p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold">Earnings History</h2>
              <p className="text-sm text-muted-foreground">Your earnings over time</p>
            </div>
            <Button variant="outline" size="sm" className="border-border/60">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
          
          <div className="relative h-64">
            <svg className="h-full w-full" viewBox="0 0 800 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="earningsChartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(34 197 94)" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="rgb(34 197 94)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d={earningsAreaPath}
                fill="url(#earningsChartGradient)"
              />
              <path
                d={earningsLinePath}
                fill="none"
                stroke="rgb(34 197 94)"
                strokeWidth="2"
              />
            </svg>
          </div>
        </Card>

        {/* Transaction History */}
        <Card className="mt-6 glass-card border-white/[0.15] bg-white/[0.08] backdrop-blur-3xl shadow-[0_0_30px_rgba(255,255,255,0.05)]">
          <div className="flex items-center justify-between p-6 border-b border-border/40">
            <h2 className="text-lg font-semibold">Transaction History</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/40">
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Model</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">From</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Tx</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {dashboardData.recentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-muted/30">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        tx.type === 'earning'
                          ? 'bg-accent/20 text-accent'
                          : 'bg-primary/20 text-primary'
                      }`}>
                        {tx.type === 'earning' ? 'Earning' : 'Withdrawal'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{tx.model}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={tx.type === 'earning' ? 'text-accent' : 'text-primary'}>
                        {tx.type === 'earning' ? '+' : '-'}{formatMatic(tx.amountMatic)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{shortWallet(tx.buyer)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{formatDateTime(tx.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="text-primary hover:text-primary/90 disabled:opacity-50" disabled={!tx.txHash}>
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}

                {!isLoading && !loadError && dashboardData.recentTransactions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-6 text-center text-sm text-muted-foreground">
                      No earnings transactions found yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {!address && !isLoading && (
          <Card className="mt-6 glass-card border-white/[0.15] bg-white/[0.08] backdrop-blur-3xl p-4 text-sm text-muted-foreground">
            Connect your wallet to view earnings.
          </Card>
        )}

        {isLoading && (
          <Card className="mt-6 glass-card border-white/[0.15] bg-white/[0.08] backdrop-blur-3xl p-4 text-sm text-muted-foreground">
            Loading earnings from Supabase...
          </Card>
        )}

        {loadError && !isLoading && (
          <Card className="mt-6 glass-card border-white/[0.15] bg-white/[0.08] backdrop-blur-3xl p-4 text-sm text-red-300">
            {loadError}
          </Card>
        )}
      </div>
    </div>
  )
}
