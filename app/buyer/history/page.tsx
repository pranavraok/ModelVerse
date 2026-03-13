"use client"

import { DashboardHeader } from "@/components/dashboard/header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Clock, 
  Search, 
  Filter,
  Download,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Play
} from "lucide-react"

const history = [
  {
    id: "JOB-1844",
    model: "Credit-Score-AI",
    status: "completed",
    cost: "0.12 MATIC",
    date: "2026-03-12 21:15",
    txHash: "0x82...3f1a"
  },
  {
    id: "JOB-1843",
    model: "Voice-Analysis",
    status: "completed",
    cost: "0.06 MATIC",
    date: "2026-03-12 18:42",
    txHash: "0x5d...9e4b"
  },
  {
    id: "JOB-1842",
    model: "GPT-Vision-Pro",
    status: "failed",
    cost: "0.00 MATIC",
    date: "2026-03-12 15:30",
    txHash: "0x12...a90c"
  },
  {
    id: "JOB-1841",
    model: "NLP-Sentiment",
    status: "completed",
    cost: "0.03 MATIC",
    date: "2026-03-12 12:10",
    txHash: "0x44...77bc"
  },
  {
    id: "JOB-1840",
    model: "Image-Classifier",
    status: "completed",
    cost: "0.08 MATIC",
    date: "2026-03-11 23:45",
    txHash: "0xef...12aa"
  },
  {
    id: "JOB-1839",
    model: "Voice-Analysis",
    status: "completed",
    cost: "0.06 MATIC",
    date: "2026-03-11 20:20",
    txHash: "0x33...bb88"
  },
  {
    id: "JOB-1838",
    model: "Credit-Score-AI",
    status: "completed",
    cost: "0.12 MATIC",
    date: "2026-03-11 16:55",
    txHash: "0x90...cc44"
  }
]

export default function BuyerHistoryPage() {
  return (
    <div className="min-h-screen">
      <DashboardHeader 
        title="Job History" 
        subtitle="Full log of your AI inference requests and transactions"
      />
      
      <div className="p-6 space-y-6">
        {/* Stats Row */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-border/40 bg-card/30 p-6">
            <p className="text-sm text-muted-foreground">Total Jobs Run</p>
            <p className="text-3xl font-bold mt-2">1,452</p>
            <div className="flex items-center gap-1 mt-1 text-xs text-accent">
              <TrendingUp className="h-3 w-3" />
              <span>+45 this week</span>
            </div>
          </Card>
          <Card className="border-border/40 bg-card/30 p-6">
            <p className="text-sm text-muted-foreground">Success Rate</p>
            <p className="text-3xl font-bold mt-2">98.4%</p>
            <div className="flex items-center gap-1 mt-1 text-xs text-accent">
              <CheckCircle className="h-3 w-3" />
              <span>Industry leading</span>
            </div>
          </Card>
          <Card className="border-border/40 bg-card/30 p-6">
            <p className="text-sm text-muted-foreground">Total Savings</p>
            <p className="text-3xl font-bold mt-2">84.2 MATIC</p>
            <p className="text-xs text-muted-foreground mt-1">vs centralized alternatives</p>
          </Card>
        </div>

        {/* Filters/Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-4 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input 
                placeholder="Search history..." 
                className="w-full rounded-md border border-input bg-input/50 pl-10 pr-4 py-2 text-sm"
              />
            </div>
            <Button variant="outline" size="icon" className="border-border/60">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" className="border-border/60">
            <Download className="mr-2 h-4 w-4" />
            Export History
          </Button>
        </div>

        {/* History Table */}
        <Card className="border-border/40 bg-card/30">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/40 text-left">
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Job / ID</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cost</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {history.map((job) => (
                  <tr key={job.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
                          <Play className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{job.model}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{job.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        job.status === 'completed' 
                          ? 'bg-accent/20 text-accent' 
                          : 'bg-destructive/20 text-destructive'
                      }`}>
                        {job.status === 'completed' ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold">{job.cost}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {job.date}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1 hover:text-primary transition-colors" title="View Transaction">
                          <ExternalLink className="h-4 w-4" />
                        </button>
                        <button className="p-1 hover:text-primary transition-colors" title="Export Result">
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
            <span>Showing 7 of 1,452 entries</span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" disabled className="h-8">Previous</Button>
              <Button variant="ghost" size="sm" className="h-8">Next</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

function TrendingUp({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  )
}
