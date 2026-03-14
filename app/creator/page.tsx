"use client"

import { DashboardHeader } from "@/components/dashboard/header"
import { BarChart, DollarSign, Upload, Users, ArrowUpRight, Activity, Cpu, Shield, Zap } from "lucide-react"

import { cn } from "@/lib/utils"

export default function CreatorDashboard() {
  const stats = [
    {
      title: "Total Earnings",
      value: "$12,345",
      change: "+15%",
      icon: DollarSign,
      trend: "up"
    },
    {
      title: "Active Models",
      value: "8",
      change: "+2",
      icon: Upload,
      trend: "up"
    },
    {
      title: "Total Inferences",
      value: "45.2K",
      change: "+24%",
      icon: Activity,
      trend: "up"
    },
    {
      title: "Unique Users",
      value: "1,204",
      change: "+8%",
      icon: Users,
      trend: "up"
    }
  ]

  const recentModels = [
    { name: "GPT-Vision-Pro", users: 843, earnings: "$4,200", status: "active" },
    { name: "Code-Assist-v2", users: 512, earnings: "$2,800", status: "active" },
    { name: "Image-Gen-Ultra", users: 320, earnings: "$1,500", status: "active" },
    { name: "Sentiment-Analyzer", users: 154, earnings: "$800", status: "inactive" },
  ]

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
            <span className="text-[11px] font-medium text-neutral-400">Network Operational</span>
          </div>
          <h2 className="text-3xl font-semibold tracking-tight text-white flex items-center gap-3">
            System Overview
            <Zap className="h-6 w-6 text-primary fill-primary/20" />
          </h2>
          <p className="text-sm text-neutral-400">Monitor your model performance and engagement metrics.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <div key={i} className="glass-card p-6 border-white/[0.15] bg-white/[0.08] backdrop-blur-3xl shadow-[0_0_30px_rgba(255,255,255,0.05)] hover:bg-white/[0.12] transition-colors group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                    <stat.icon className="h-4.5 w-4.5 text-neutral-400 group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="text-sm font-medium text-neutral-400 tracking-tight">{stat.title}</h3>
                </div>
                <div className={cn(
                  "flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md bg-white/[0.03] border border-white/[0.05]",
                  stat.trend === "up" ? "text-emerald-400" : "text-red-400"
                )}>
                  {stat.trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : null}
                  {stat.change}
                </div>
              </div>
              <div className="relative z-10">
                <div className="text-[28px] font-semibold text-white tracking-tight">{stat.value}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          {/* Main Chart Area placeholder */}
          <div className="glass-card p-8 border-white/[0.15] bg-white/[0.08] backdrop-blur-3xl shadow-[0_0_40px_rgba(255,255,255,0.05)] lg:col-span-4 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent" />
            <div className="relative z-10 flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-semibold text-white">Earnings History</h3>
                <p className="text-[13px] text-neutral-500 mt-1">Revenue over the last 30 days</p>
              </div>
            </div>
            <div className="h-[280px] w-full flex items-center justify-center rounded-2xl border border-white/[0.05] bg-white/[0.01] border-dashed">
              <div className="text-center">
                <BarChart className="h-8 w-8 text-neutral-600 mx-auto mb-3" />
                <p className="text-[13px] font-medium text-neutral-500">Analytics visualization ready</p>
              </div>
            </div>
          </div>

          {/* Recent Models List */}
          <div className="glass-card p-8 border-white/[0.15] bg-white/[0.08] backdrop-blur-3xl shadow-[0_0_40px_rgba(255,255,255,0.05)] lg:col-span-3 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-bl from-white/[0.05] to-transparent" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-semibold text-white tracking-tight">Top Performing Models</h3>
                  <p className="text-[13px] text-neutral-500 mt-1">Ranked by computing yield</p>
                </div>
              </div>
              <div className="space-y-4">
                {recentModels.map((model, i) => (
                  <div key={i} className="flex className items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.03] hover:bg-white/[0.04] transition-all cursor-pointer group/item">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center group-hover/item:border-primary/30 transition-colors">
                        <Cpu className="h-4.5 w-4.5 text-neutral-400 group-hover/item:text-primary transition-colors" />
                      </div>
                      <div>
                        <p className="text-[14px] font-medium text-neutral-200">{model.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Users className="h-3 w-3 text-neutral-500" />
                          <p className="text-[12px] text-neutral-500">{model.users} users</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[14px] font-semibold text-white">{model.earnings}</p>
                      <div className="flex items-center justify-end gap-1.5 mt-1.5">
                        <div className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          model.status === "active" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-neutral-600"
                        )} />
                        <p className="text-[11px] text-neutral-500 capitalize">{model.status}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
