"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Wallet, 
  ArrowUpRight, 
  History, 
  ShieldCheck,
  TrendingUp,
  Download,
  ExternalLink
} from "lucide-react"

const payouts = [
  { id: 1, type: "reward", node: "NODE-401", amount: "5.4 MATIC", date: "2026-03-12 21:00", status: "completed" },
  { id: 2, type: "reward", node: "NODE-403", amount: "12.2 MATIC", date: "2026-03-12 18:30", status: "completed" },
  { id: 3, type: "withdrawal", node: "-", amount: "50.0 MATIC", date: "2026-03-12 12:45", status: "completed" },
  { id: 4, type: "reward", node: "NODE-402", amount: "2.1 MATIC", date: "2026-03-11 23:15", status: "completed" },
  { id: 5, type: "reward", node: "NODE-401", amount: "4.8 MATIC", date: "2026-03-11 19:40", status: "completed" }
]

export default function OperatorEarningsPage() {
  const [isWithdrawing, setIsWithdrawing] = useState(false)

  const handleWithdraw = async () => {
    setIsWithdrawing(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsWithdrawing(false)
  }

  return (
    <div className="min-h-screen">
      <DashboardHeader 
        title="Earnings & Rewards" 
        subtitle="Manage your compute rewards and withdrawal history"
      />
      
      <div className="p-6 space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-border/40 bg-card/30 p-6">
            <p className="text-sm text-muted-foreground">Total Paid Out</p>
            <p className="text-3xl font-bold mt-2">842.5 MATIC</p>
            <div className="flex items-center gap-1 mt-1 text-[10px] text-accent font-medium">
              <TrendingUp className="h-3 w-3" />
              <span>+84.2 MATIC this month</span>
            </div>
          </Card>

          <Card className="border-border/40 bg-card/30 p-6">
            <p className="text-sm text-muted-foreground">Network Stake</p>
            <p className="text-3xl font-bold mt-2">500.0 MATIC</p>
            <div className="flex items-center gap-1 mt-1 text-[10px] text-accent font-medium">
              <ShieldCheck className="h-3 w-3" />
              <span>Active Collateral</span>
            </div>
          </Card>

          <Card className="border-border/40 bg-gradient-to-br from-primary/20 to-primary/5 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Withdrawable</p>
                <p className="text-3xl font-bold mt-2 text-primary">62.8 MATIC</p>
              </div>
              <Wallet className="h-8 w-8 text-primary opacity-50" />
            </div>
            <Button 
              className="mt-4 w-full bg-primary hover:bg-primary/90"
              onClick={handleWithdraw}
              disabled={isWithdrawing}
            >
              {isWithdrawing ? "Processing..." : "Withdraw Rewards"}
            </Button>
          </Card>
        </div>

        <Card className="border-border/40 bg-card/30">
          <div className="flex items-center justify-between p-6 border-b border-border/40">
            <h3 className="font-semibold">Recent Transactions</h3>
            <Button variant="outline" size="sm" className="border-border/60">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/40 text-left">
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase">Type</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase">Source</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase">Amount</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase">Date</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase text-right">Explorer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {payouts.map((tx) => (
                  <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] ${
                        tx.type === 'reward' ? 'bg-accent/20 text-accent' : 'bg-primary/20 text-primary'
                      }`}>
                        {tx.type === 'reward' ? <ArrowUpRight className="h-3 w-3" /> : <History className="h-3 w-3" />}
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{tx.node}</td>
                    <td className="px-6 py-4 text-sm font-semibold">{tx.amount}</td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">{tx.date}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-muted-foreground hover:text-foreground">
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
