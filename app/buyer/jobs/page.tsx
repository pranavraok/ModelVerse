"use client"

import Link from "next/link"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Search,
  Play,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Eye,
  RotateCcw
} from "lucide-react"

const jobs = [
  {
    id: "JOB-1848",
    model: "GPT-Vision-Pro",
    status: "running",
    progress: 75,
    cost: "0.0525 MATIC",
    input: '{"image": "base64..."}',
    createdAt: "2026-03-12 14:45",
    completedAt: null
  },
  {
    id: "JOB-1847",
    model: "NLP-Sentiment-v3",
    status: "pending",
    progress: 0,
    cost: "0.0315 MATIC",
    input: '{"text": "Sample text..."}',
    createdAt: "2026-03-12 14:42",
    completedAt: null
  },
  {
    id: "JOB-1846",
    model: "Image-Classifier",
    status: "completed",
    progress: 100,
    cost: "0.063 MATIC",
    input: '{"image": "base64..."}',
    createdAt: "2026-03-12 14:30",
    completedAt: "2026-03-12 14:31"
  },
  {
    id: "JOB-1845",
    model: "Credit-Score-AI",
    status: "completed",
    progress: 100,
    cost: "0.126 MATIC",
    input: '{"data": {...}}',
    createdAt: "2026-03-12 13:15",
    completedAt: "2026-03-12 13:17"
  },
  {
    id: "JOB-1844",
    model: "Voice-Transcriber",
    status: "failed",
    progress: 0,
    cost: "0.00 MATIC",
    input: '{"audio": "base64..."}',
    createdAt: "2026-03-12 12:00",
    completedAt: "2026-03-12 12:01"
  },
  {
    id: "JOB-1843",
    model: "GPT-Vision-Pro",
    status: "completed",
    progress: 100,
    cost: "0.0525 MATIC",
    input: '{"image": "base64..."}',
    createdAt: "2026-03-12 10:30",
    completedAt: "2026-03-12 10:32"
  }
]

const statusConfig = {
  pending: { label: "Pending", color: "bg-chart-4/20 text-chart-4", icon: Clock },
  running: { label: "Running", color: "bg-primary/20 text-primary", icon: RefreshCw },
  completed: { label: "Completed", color: "bg-accent/20 text-accent", icon: CheckCircle },
  failed: { label: "Failed", color: "bg-destructive/20 text-destructive", icon: AlertCircle }
}

export default function JobsPage() {
  return (
    <div className="min-h-screen">
      <DashboardHeader 
        title="My Jobs" 
        subtitle="Track and manage your inference jobs"
      />
      
      <div className="p-6">
        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by job ID or model..."
              className="bg-input/50 pl-9"
            />
          </div>
          <div className="flex items-center gap-4">
            <Select defaultValue="all">
              <SelectTrigger className="w-40 bg-input/50">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Jobs List */}
        <div className="space-y-4">
          {jobs.map((job) => {
            const status = statusConfig[job.status as keyof typeof statusConfig]
            const StatusIcon = status.icon
            
            return (
              <Card key={job.id} className="border-border/40 bg-card/30 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${status.color.split(' ')[0]}`}>
                      <StatusIcon className={`h-6 w-6 ${status.color.split(' ')[1]} ${job.status === 'running' ? 'animate-spin' : ''}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{job.model}</h3>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{job.id}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="font-semibold">{job.cost}</p>
                      <p className="text-xs text-muted-foreground">{job.createdAt}</p>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/buyer/jobs/${job.id}`}>
                        <Button variant="outline" size="sm" className="border-border/60">
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                      </Link>
                      {job.status === 'failed' && (
                        <Button variant="outline" size="sm" className="border-border/60">
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Retry
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress bar for running jobs */}
                {job.status === 'running' && (
                  <div className="mt-4">
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
                )}
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
