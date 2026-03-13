"use client"

import Link from "next/link"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card } from "@/components/ui/card"
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
  AlertCircle
} from "lucide-react"

const stats = [
  {
    title: "Total Jobs Submitted",
    value: "156",
    change: "+8",
    trend: "up",
    icon: Play,
    color: "from-primary/20 to-primary/5"
  },
  {
    title: "Active Jobs",
    value: "3",
    change: "Running",
    trend: "neutral",
    icon: RefreshCw,
    color: "from-chart-4/20 to-chart-4/5"
  },
  {
    title: "Total Spent",
    value: "12.8 MATIC",
    change: "+2.3",
    trend: "up",
    icon: Wallet,
    color: "from-accent/20 to-accent/5"
  },
  {
    title: "Average Job Cost",
    value: "0.08 MATIC",
    change: "-5%",
    trend: "down",
    icon: CheckCircle,
    color: "from-chart-3/20 to-chart-3/5"
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
    <div className="min-h-screen pb-12">
      <DashboardHeader 
        title="Dashboard" 
        subtitle="Monitor your AI inference jobs"
      />
      
      <div className="p-6">
        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="relative overflow-hidden border-border/40 bg-card/30 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="mt-2 text-2xl font-bold">{stat.value}</p>
                  <div className={`mt-1 flex items-center text-xs ${
                    stat.trend === 'up' ? 'text-accent' 
                    : stat.trend === 'down' ? 'text-destructive'
                    : 'text-chart-4'
                  }`}>
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="mr-0.5 h-3 w-3" />
                    ) : stat.trend === 'down' ? (
                      <ArrowDownRight className="mr-0.5 h-3 w-3" />
                    ) : (
                      <Clock className="mr-0.5 h-3 w-3" />
                    )}
                    {stat.change}
                  </div>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${stat.color}`}>
                  <stat.icon className={`h-5 w-5 ${stat.title === 'Active Jobs' ? 'animate-spin' : ''}`} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Link href="/marketplace">
            <Card className="group flex cursor-pointer items-center gap-4 border-border/40 bg-gradient-to-br from-primary/10 to-primary/5 p-6 transition-all hover:border-primary/40">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
                <Store className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Browse Marketplace</h3>
                <p className="text-sm text-muted-foreground">Find AI models to run</p>
              </div>
              <ArrowUpRight className="ml-auto h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Card>
          </Link>
          <Link href="/buyer/jobs">
            <Card className="group flex cursor-pointer items-center gap-4 border-border/40 bg-gradient-to-br from-accent/10 to-accent/5 p-6 transition-all hover:border-accent/40">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20">
                <Play className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold">View All Jobs</h3>
                <p className="text-sm text-muted-foreground">Track job progress</p>
              </div>
              <ArrowUpRight className="ml-auto h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Card>
          </Link>
        </div>

        <div className="mt-6">
          {/* Active Jobs */}
          <Card className="border-border/40 bg-card/30 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Active Jobs</h2>
              <span className="rounded-full bg-chart-4/20 px-2 py-1 text-xs font-medium text-chart-4">
                {activeJobs.filter(j => ['running', 'assigned', 'pending'].includes(j.status)).length} active
              </span>
            </div>
            <div className="space-y-4">
              {activeJobs.map((job) => (
                <Link key={job.id} href={`/buyer/jobs/${job.id}`}>
                  <div className="rounded-xl border border-border/40 bg-muted/30 p-4 transition-all hover:border-primary/40 hover:bg-muted/50 mb-4 cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">{job.model}</p>
                        <p className="text-xs text-muted-foreground">{job.id}</p>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${
                        job.status === 'running' ? 'bg-primary/20 text-primary'
                        : job.status === 'assigned' ? 'bg-accent/20 text-accent'
                        : job.status === 'completed' ? 'bg-green-500/20 text-green-500'
                        : job.status === 'failed' ? 'bg-destructive/20 text-destructive'
                        : 'bg-chart-4/20 text-chart-4'
                      }`}>
                        {job.status}
                      </span>
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Progress</span>
                        <span>{job.progress}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            job.status === 'failed' ? 'bg-destructive'
                            : job.status === 'completed' ? 'bg-green-500'
                            : job.status === 'assigned' ? 'bg-accent'
                            : 'bg-primary'
                          }`}
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">Started {job.startedAt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </div>

        {/* Model Recommendations Section */}
        <div className="mt-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">Model Recommendations</h2>
            <p className="text-sm text-muted-foreground">Based on your history</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {recommendedModels.map((model) => (
              <Card key={model.id} className="flex flex-col border-border/40 bg-card/30 p-6 transition-all hover:border-primary/40 hover:bg-muted/30">
                <div className="flex-1">
                  <div className="mb-2">
                    <h3 className="font-semibold text-lg leading-tight">{model.name}</h3>
                    <p className="text-xs font-medium text-primary mt-1">{model.category}</p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3 mb-6 line-clamp-2">
                    {model.description}
                  </p>
                  <div className="text-xs text-muted-foreground mb-4">
                    {model.runs.toLocaleString()} total runs
                  </div>
                </div>
                <Link href={`/marketplace`}>
                  <Button className="w-full gap-2">
                    <Play className="h-4 w-4" />
                    Run Inference
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
