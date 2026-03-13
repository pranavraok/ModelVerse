"use client"

import Link from "next/link"
import { DashboardHeader } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { 
  Play, 
  CheckCircle, 
  Clock, 
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Store,
  RefreshCw,
  Activity,
  TrendingUp
} from "lucide-react"

const stats = [
  {
    title: "Total Jobs Submitted",
    value: "156",
    change: "+8",
    trend: "up",
    icon: Play,
    color: "from-primary/10 to-transparent"
  },
  {
    title: "Active Jobs",
    value: "3",
    change: "Running",
    trend: "neutral",
    icon: RefreshCw,
    color: "from-chart-4/10 to-transparent"
  },
  {
    title: "Total Spent",
    value: "12.8 MATIC",
    change: "+2.3",
    trend: "up",
    icon: Wallet,
    color: "from-accent/10 to-transparent"
  },
  {
    title: "Average Job Cost",
    value: "0.08 MATIC",
    change: "-5%",
    trend: "down",
    icon: CheckCircle,
    color: "from-chart-3/10 to-transparent"
  }
]

const activeJobs = [
  {
    id: "JOB-1848",
    model: "Stable-Diffusion-XL",
    status: "assigned",
    progress: 10,
    startedAt: "Just now"
  },
  {
    id: "JOB-1847",
    model: "GPT-Vision-Pro",
    status: "running",
    progress: 65,
    startedAt: "2 min ago"
  },
  {
    id: "JOB-1846",
    model: "NLP-Sentiment",
    status: "pending",
    progress: 0,
    startedAt: "5 min ago"
  },
  {
    id: "JOB-1845",
    model: "Image-Classifier",
    status: "completed",
    progress: 100,
    startedAt: "8 min ago"
  },
  {
    id: "JOB-1844",
    model: "Voice-Analysis",
    status: "failed",
    progress: 45,
    startedAt: "10 min ago"
  }
]

const recommendedModels = [
  {
    id: "MOD-1",
    name: "Llama-3-70b-Instruct",
    category: "Large Language Model",
    description: "Highly capable open-weight model for complex reasoning.",
    runs: 1245,
  },
  {
    id: "MOD-2",
    name: "Stable-Video-Diffusion",
    category: "Video Generation",
    description: "State-of-the-art video generation from images.",
    runs: 856,
  },
  {
    id: "MOD-3",
    name: "Whisper-v3-Large",
    category: "Audio Transcription",
    description: "Robust multilingual speech recognition.",
    runs: 3421,
  },
  {
    id: "MOD-4",
    name: "Mixtral-8x7B",
    category: "MoE Language Model",
    description: "Fast, efficient MoE model that matches GPT-3.5.",
    runs: 2109,
  }
]

export default function BuyerDashboard() {
  return (
    <div className="min-h-screen pb-12 bg-transparent bg-mesh relative">
      {/* Background Auroras - Synchronized with Landing Page */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="aurora-1" />
        <div className="aurora-2" />
      </div>

      <div className="relative z-10">
        <DashboardHeader 
          title="Command Center" 
          subtitle="Orchestrate your decentralized AI operations"
        />
        
        <div className="p-8 max-w-[1600px] mx-auto space-y-10">
          {/* Stats Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.title} className="glass-card premium-glow glow-primary p-7 transition-all duration-500 hover:translate-y-[-4px] group bg-white/[0.01] border-border/50">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-300 capitalize tracking-normal">{stat.title}</p>
                    <p className="mt-4 text-4xl font-semibold tracking-normal text-white shadow-none">{stat.value}</p>
                    <div className={`mt-4 flex items-center text-xs font-semibold capitalize tracking-[0.15em] ${
                      stat.trend === 'up' ? 'text-primary' 
                      : stat.trend === 'down' ? 'text-destructive'
                      : 'text-chart-4'
                    }`}>
                      {stat.trend === 'up' ? (
                        <ArrowUpRight className="mr-1.5 h-3.5 w-3.5" />
                      ) : stat.trend === 'down' ? (
                        <ArrowDownRight className="mr-1.5 h-3.5 w-3.5" />
                      ) : (
                        <Clock className="mr-1.5 h-3.5 w-3.5" />
                      )}
                      {stat.change}
                    </div>
                  </div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/[0.03] shrink-0 group-hover:scale-110 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all duration-500">
                    <stat.icon className="h-7 w-7 text-primary transition-colors" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              {/* Active Operations */}
              <div className="glass-card p-10 border-white/[0.03] bg-white/[0.01]">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h2 className="text-2xl font-semibold tracking-normal text-white/95">Active Operations</h2>
                    <p className="text-xs font-semibold text-slate-300 mt-1 capitalize tracking-normal">Neural Network Telemetry</p>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl bg-primary/10 px-5 py-2 border border-primary/20">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
                    <span className="text-[11px] font-semibold text-primary text-neutral-500">
                      {activeJobs.filter(j => ['running', 'assigned', 'pending'].includes(j.status)).length} Live
                    </span>
                  </div>
                </div>
                
                <div className="grid gap-5">
                  {activeJobs.map((job) => (
                    <Link key={job.id} href={`/buyer/jobs/${job.id}`}>
                      <div className="group rounded-[1.5rem] border border-white/[0.03] bg-white/[0.01] p-6 transition-all duration-500 hover:bg-white/[0.03] hover:border-white/[0.03]">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-5">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/[0.03] group-hover:bg-primary/20 group-hover:border-primary/30 transition-all duration-500">
                              <Activity className="h-6 w-6 text-foreground/70 group-hover:text-primary transition-colors" />
                            </div>
                            <div>
                              <p className="text-[15px] font-semibold tracking-normal text-white/90">{job.model}</p>
                              <p className="text-xs text-slate-400 font-mono mt-1 tracking-normal">{job.id}</p>
                            </div>
                          </div>
                          <span className={`rounded-xl px-4 py-1.5 text-xs font-semibold text-neutral-500 border transition-all duration-500 ${
                            job.status === 'running' ? 'bg-primary/10 text-primary border-primary/30 shadow-[0_0_15px_rgba(139,92,246,0.1)]'
                            : job.status === 'assigned' ? 'bg-accent/10 text-accent border-accent/30'
                            : job.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                            : job.status === 'failed' ? 'bg-destructive/10 text-destructive border-destructive/30'
                            : 'bg-muted/10 text-foreground/70 border-muted/30'
                          }`}>
                            {job.status}
                          </span>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between text-xs font-semibold text-neutral-500 text-foreground/70">
                            <span>Processing Integrity</span>
                            <span className="text-white/80">{job.progress}%</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-white/[0.03] border border-white/5">
                            <div 
                              className={`h-full transition-all duration-1000 cubic-bezier(0.4, 0, 0.2, 1) ${
                                job.status === 'failed' ? 'bg-destructive/80 shadow-[0_0_10px_rgba(239,68,68,0.3)]'
                                : job.status === 'completed' ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                                : 'bg-gradient-to-r from-primary via-purple-500 to-accent shadow-[0_0_20px_rgba(139,92,246,0.4)]'
                              }`}
                              style={{ width: `${job.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {/* Launch Lab */}
              <div className="glass-card p-8 border-white/[0.03] bg-white/[0.01]">
                <h3 className="text-xs font-semibold capitalize tracking-normal text-slate-300 mb-6 px-2">Launch Lab</h3>
                <div className="grid gap-4">
                  <Link href="/marketplace">
                    <div className="group flex items-center gap-5 p-5 rounded-[1.5rem] bg-white/[0.02] border border-white/[0.03] hover:bg-primary/10 hover:border-primary/10 transition-all duration-500">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/10 group-hover:scale-110 transition-transform">
                        <Store className="h-7 w-7 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-[15px] font-semibold tracking-normal text-white/90">Marketplace</h4>
                        <p className="text-[11px] text-foreground/70 font-medium mt-1">Acquire compute nodes</p>
                      </div>
                      <ArrowUpRight className="h-6 w-6 text-foreground/70 group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                    </div>
                  </Link>
                  <Link href="/buyer/jobs">
                    <div className="group flex items-center gap-5 p-5 rounded-[1.5rem] bg-white/[0.02] border border-white/[0.03] hover:bg-accent/10 hover:border-accent/10 transition-all duration-500">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 border border-accent/10 group-hover:scale-110 transition-transform">
                        <Play className="h-7 w-7 text-accent" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-[15px] font-semibold tracking-normal text-white/90">Deployment logs</h4>
                        <p className="text-[11px] text-foreground/70 font-medium mt-1">Verify neural execution</p>
                      </div>
                      <ArrowUpRight className="h-6 w-6 text-foreground/70 group-hover:text-accent group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                    </div>
                  </Link>
                </div>
              </div>

              {/* Nexus Picks */}
              <div className="glass-card p-8 border-white/[0.03] bg-white/[0.01]">
                <div className="px-2 flex items-center justify-between mb-8">
                  <h3 className="text-xs font-semibold capitalize tracking-normal text-foreground/70">Nexus Picks</h3>
                  <TrendingUp className="h-4 w-4 text-primary/30" />
                </div>
                <div className="space-y-6">
                  {recommendedModels.slice(0, 3).map((model) => (
                    <div key={model.id} className="group p-5 rounded-[1.5rem] border border-white/[0.03] bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-500">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[9px] font-semibold text-primary px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-neutral-500">
                          {model.category}
                        </span>
                        <span className="text-[9px] font-semibold text-foreground/70 text-neutral-500">
                          {model.runs.toLocaleString()} CALLS
                        </span>
                      </div>
                      <h4 className="text-[15px] font-semibold tracking-normal text-white/95 mb-2 group-hover:text-primary transition-all">{model.name}</h4>
                      <p className="text-[11px] leading-relaxed text-foreground/70 font-medium line-clamp-2 mb-5">{model.description}</p>
                      <Link href="/marketplace">
                        <Button variant="outline" className="w-full h-10 text-[11px] font-semibold capitalize tracking-[0.15em] rounded-2xl border-white/[0.03] hover:bg-primary hover:text-white hover:border-primary transition-all duration-500">
                          Initiate Sequence
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}