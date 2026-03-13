"use client"

import { DashboardHeader } from "@/components/dashboard/header"
import { Card } from "@/components/ui/card"
import { 
  Cpu, 
  Activity, 
  Wallet, 
  Zap,
  ArrowUpRight,
  TrendingUp,
  Server,
  ShieldCheck
} from "lucide-react"

const stats = [
  {
    title: "Active Nodes",
    value: "8",
    change: "+2",
    trend: "up",
    icon: Server,
    color: "from-primary/20 to-primary/5"
  },
  {
    title: "Network Health",
    value: "99.8%",
    change: "Stable",
    trend: "neutral",
    icon: ShieldCheck,
    color: "from-accent/20 to-accent/5"
  },
  {
    title: "Total Earnings",
    value: "142.5 MATIC",
    change: "+15.2%",
    trend: "up",
    icon: Wallet,
    color: "from-chart-3/20 to-chart-3/5"
  },
  {
    title: "Avg Uptime",
    value: "720h",
    change: "100%",
    trend: "up",
    icon: Activity,
    color: "from-chart-4/20 to-chart-4/5"
  }
]

export default function NodeOperatorDashboard() {
  return (
    <div className="min-h-screen">
      <DashboardHeader 
        title="Operator Dashboard" 
        subtitle="Monitor your node infrastructure and compute rewards"
      />
      
      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="relative overflow-hidden border-border/40 bg-card/30 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="mt-2 text-2xl font-bold">{stat.value}</p>
                  <div className={`mt-1 flex items-center text-xs ${
                    stat.trend === 'up' ? 'text-accent' : 'text-muted-foreground'
                  }`}>
                    {stat.change}
                    {stat.trend === 'up' && <ArrowUpRight className="ml-0.5 h-3 w-3" />}
                  </div>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${stat.color}`}>
                  <stat.icon className="h-5 w-5 text-foreground" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Node Status Card */}
          <Card className="border-border/40 bg-card/30 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Active Nodes Status</h2>
              <button className="text-sm text-primary hover:text-primary/90">View all</button>
            </div>
            <div className="space-y-4">
              {[
                { name: "Node #1042", model: "GPT-Vision-Pro", status: "online", load: "42%" },
                { name: "Node #1043", model: "NLP-Sentiment", status: "online", load: "18%" },
                { name: "Node #1044", model: "Image-Classifier", status: "online", load: "65%" },
                { name: "Node #1045", model: "Credit-Score-AI", status: "busy", load: "98%" }
              ].map((node) => (
                <div key={node.name} className="flex items-center gap-4 rounded-xl border border-border/20 p-4">
                  <div className={`h-3 w-3 rounded-full ${node.status === 'online' ? 'bg-accent shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-primary animate-pulse'}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{node.name}</p>
                    <p className="text-xs text-muted-foreground">{node.model}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{node.load}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Load</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Earning Trends */}
          <Card className="border-border/40 bg-card/30 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Reward Distribution</h2>
              <div className="flex items-center gap-2 rounded-lg bg-accent/10 px-3 py-1.5">
                <TrendingUp className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium text-accent">+24.5%</span>
              </div>
            </div>
            
            <div className="relative h-64 flex items-end gap-2 px-2">
              {[40, 65, 35, 90, 55, 75, 85].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div 
                    className="w-full rounded-t-lg bg-primary/20 transition-all duration-500 group-hover:bg-primary/40"
                    style={{ height: `${h}%` }}
                  />
                  <span className="text-[10px] text-muted-foreground">0{i+6} Mar</span>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-between pt-4 border-t border-border/40">
              <p className="text-sm text-muted-foreground italic">Last update: 2 mins ago</p>
              <Zap className="h-5 w-5 text-primary animate-pulse" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
