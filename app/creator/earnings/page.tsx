"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Wallet, 
  TrendingUp, 
  Clock,
  ArrowUpRight,
  Download,
  ExternalLink
} from "lucide-react"

const transactions = [
  {
    id: 1,
    type: "earning",
    model: "GPT-Vision-Pro",
    amount: "0.05 MATIC",
    buyer: "0x8912...3456",
    txHash: "0xabc123...",
    date: "2026-03-12 14:32"
  },
  {
    id: 2,
    type: "earning",
    model: "NLP-Sentiment",
    amount: "0.03 MATIC",
    buyer: "0x2345...6789",
    txHash: "0xdef456...",
    date: "2026-03-12 13:15"
  },
  {
    id: 3,
    type: "withdrawal",
    model: "-",
    amount: "5.0 MATIC",
    buyer: "-",
    txHash: "0xghi789...",
    date: "2026-03-11 16:45"
  },
  {
    id: 4,
    type: "earning",
    model: "Image-Classifier",
    amount: "0.08 MATIC",
    buyer: "0x5678...9012",
    txHash: "0xjkl012...",
    date: "2026-03-11 12:20"
  },
  {
    id: 5,
    type: "earning",
    model: "Credit-Score-AI",
    amount: "0.12 MATIC",
    buyer: "0x9012...3456",
    txHash: "0xmno345...",
    date: "2026-03-10 18:55"
  },
  {
    id: 6,
    type: "earning",
    model: "Voice-Analysis",
    amount: "0.06 MATIC",
    buyer: "0x3456...7890",
    txHash: "0xpqr678...",
    date: "2026-03-10 10:30"
  }
]

export default function EarningsPage() {
  const [isWithdrawing, setIsWithdrawing] = useState(false)

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
                <p className="mt-2 text-3xl font-bold">24.5 MATIC</p>
                <p className="mt-1 text-sm text-muted-foreground">~$28.40 USD</p>
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
                <p className="mt-2 text-3xl font-bold">2.3 MATIC</p>
                <p className="mt-1 text-sm text-muted-foreground">From 8 active jobs</p>
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
                <p className="mt-2 text-3xl font-bold text-accent">8.7 MATIC</p>
                <p className="mt-1 text-sm text-muted-foreground">~$10.09 USD</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
                <Wallet className="h-5 w-5 text-accent" />
              </div>
            </div>
            <Button 
              className="mt-4 w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={handleWithdraw}
              disabled={isWithdrawing}
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
                d="M0,180 C100,170 150,150 200,140 C250,130 300,160 350,150 C400,140 450,100 500,110 C550,120 600,80 650,70 C700,60 750,50 800,40 L800,200 L0,200 Z"
                fill="url(#earningsChartGradient)"
              />
              <path
                d="M0,180 C100,170 150,150 200,140 C250,130 300,160 350,150 C400,140 450,100 500,110 C550,120 600,80 650,70 C700,60 750,50 800,40"
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
                {transactions.map((tx) => (
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
                        {tx.type === 'earning' ? '+' : '-'}{tx.amount}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{tx.buyer}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{tx.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="text-primary hover:text-primary/90">
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
