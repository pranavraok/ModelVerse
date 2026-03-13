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
    title: "Total Jobs",
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
    title: "Avg Cost/Job",
    value: "0.08 MATIC",
    change: "-5%",
    trend: "down",
    icon: CheckCircle,
    color: "from-chart-3/20 to-chart-3/5"
  }
]

const activeJobs = [
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
    status: "running",
    progress: 90,
    startedAt: "8 min ago"
  }
]

const recentJobs = [
  {
    id: "JOB-1844",
    model: "Credit-Score-AI",
    status: "completed",
    cost: "0.12 MATIC",
    completedAt: "15 min ago"
  },
  {
    id: "JOB-1843",
    model: "Voice-Analysis",
    status: "completed",
    cost: "0.06 MATIC",
    completedAt: "1 hour ago"
  },
  {
    id: "JOB-1842",
    model: "GPT-Vision-Pro",
    status: "failed",
    cost: "0.00 MATIC",
    completedAt: "2 hours ago"
  },
  {
    id: "JOB-1841",
    model: "NLP-Sentiment",
    status: "completed",
    cost: "0.03 MATIC",
    completedAt: "3 hours ago"
  }
]

export default function BuyerDashboard() {
  return (
    <div className="min-h-screen">
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

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Active Jobs */}
          <Card className="border-border/40 bg-card/30 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Active Jobs</h2>
              <span className="rounded-full bg-chart-4/20 px-2 py-1 text-xs font-medium text-chart-4">
                {activeJobs.length} running
              </span>
            </div>
            <div className="space-y-4">
              {activeJobs.map((job) => (
                <div key={job.id} className="rounded-xl border border-border/40 bg-muted/30 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium">{job.model}</p>
                      <p className="text-xs text-muted-foreground">{job.id}</p>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                      job.status === 'running'
                        ? 'bg-primary/20 text-primary'
                        : 'bg-chart-4/20 text-chart-4'
                    }`}>
                      {job.status === 'running' ? 'Running' : 'Pending'}
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Progress</span>
                      <span>{job.progress}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div 
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">Started {job.startedAt}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Jobs */}
          <Card className="border-border/40 bg-card/30 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Recent Jobs</h2>
              <Link href="/buyer/history" className="text-sm text-primary hover:text-primary/90">
                View all
              </Link>
            </div>
            <div className="space-y-4">
              {recentJobs.map((job) => (
                <div key={job.id} className="flex items-center gap-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    job.status === 'completed'
                      ? 'bg-accent/20'
                      : 'bg-destructive/20'
                  }`}>
                    {job.status === 'completed' ? (
                      <CheckCircle className="h-5 w-5 text-accent" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-destructive" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{job.model}</p>
                    <p className="text-xs text-muted-foreground">{job.id}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      job.status === 'completed' ? 'text-accent' : 'text-destructive'
                    }`}>
                      {job.status === 'completed' ? `-${job.cost}` : 'Refunded'}
                    </p>
                    <p className="text-xs text-muted-foreground">{job.completedAt}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
