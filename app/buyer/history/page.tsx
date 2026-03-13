"use client"

import { DashboardHeader } from "@/components/dashboard/header"
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
import { cn } from "@/lib/utils"

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
    <div className="min-h-screen bg-transparent bg-mesh relative">
      <DashboardHeader 
        title="Neural History" 
        subtitle="Chronicle of your decentralized AI operations"
      />
      
      <div className="relative z-10 p-8 space-y-10">
        {/* Stats Row */}
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="glass-card p-8 border-white/[0.05] group">
            <p className="text-[10px] font-semibold text-muted-foreground/30 capitalize tracking-normalr">Total Intelligence Run</p>
            <div className="flex items-baseline gap-2 mt-4">
              <p className="text-4xl font-semibold text-white tracking-tight">1,452</p>
              <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-500 text-neutral-500">
                <TrendingUp className="h-3 w-3" />
                <span>+45</span>
              </div>
            </div>
            <p className="text-[9px] font-semibold text-muted-foreground/20 text-neutral-500 mt-2 italic shadow-sm">Verified on-chain submissions</p>
          </div>
          
          <div className="glass-card p-8 border-white/[0.05]">
            <p className="text-[10px] font-semibold text-muted-foreground/30 capitalize tracking-normalr">Execution Fidelity</p>
            <p className="text-4xl font-semibold text-white tracking-tight mt-4">98.4%</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <span className="text-[9px] font-semibold text-emerald-500/60 text-neutral-500">Industry leading success rate</span>
            </div>
          </div>

          <div className="glass-card p-8 border-white/[0.05]">
            <p className="text-[10px] font-semibold text-muted-foreground/30 capitalize tracking-normalr">Sovereign Savings</p>
            <p className="text-4xl font-semibold text-primary tracking-tight mt-4">84.2 <span className="text-sm font-semibold capitalize italic">MATIC</span></p>
            <p className="text-[9px] font-semibold text-muted-foreground/20 text-neutral-500 mt-2 italic">Relative to legacy providers</p>
          </div>
        </div>

        {/* Filters/Actions */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-4 max-w-md group">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/20 group-focus-within:text-primary" />
              <input 
                placeholder="Search history..." 
                className="w-full h-12 rounded-2xl bg-white/[0.01] border border-white/[0.03] pl-12 pr-4 text-[13px] font-medium text-white/80 placeholder:text-muted-foreground/20 focus:outline-none focus:ring-primary/20 focus:border-primary/40 transition-all"
              />
            </div>
            <Button variant="ghost" className="h-12 w-12 rounded-2xl bg-white/[0.02] border border-white/[0.03] hover:bg-white/[0.04] text-muted-foreground/40 hover:text-white transition-all">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="ghost" className="h-12 px-6 rounded-2xl bg-white/[0.02] border border-white/[0.03] hover:bg-white/[0.04] text-[10px] font-semibold text-neutral-500 text-muted-foreground/40 hover:text-white transition-all">
            <Download className="mr-3 h-4 w-4" />
            Neural Archive
          </Button>
        </div>

        {/* History Table */}
        <div className="glass-card border-white/[0.05] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.03] text-left">
                  <th className="px-8 py-5 text-[9px] font-semibold text-muted-foreground/20 capitalize tracking-normalr italic">Intelligence ID</th>
                  <th className="px-8 py-5 text-[9px] font-semibold text-muted-foreground/20 capitalize tracking-normalr italic">Transmission</th>
                  <th className="px-8 py-5 text-[9px] font-semibold text-muted-foreground/20 capitalize tracking-normalr italic">Weight</th>
                  <th className="px-8 py-5 text-[9px] font-semibold text-muted-foreground/20 capitalize tracking-normalr italic">Sequence</th>
                  <th className="px-8 py-5 text-[9px] font-semibold text-muted-foreground/20 capitalize tracking-normalr italic text-right">Ops</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {history.map((job) => (
                  <tr key={job.id} className="hover:bg-white/[0.01] transition-all duration-300 group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-5">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500">
                          <Play className="h-5 w-5 text-primary fill-current" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white tracking-tight">{job.model}</p>
                          <p className="text-[10px] text-muted-foreground/20 font-semibold text-neutral-500 mt-1">{job.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className={cn(
                        "inline-flex items-center gap-2 rounded-xl px-3 py-1 text-[9px] font-semibold text-neutral-500 border",
                        job.status === 'completed' 
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                          : 'bg-red-500/10 border-red-500/20 text-red-400'
                      )}>
                        {job.status === 'completed' ? <CheckCircle className="h-3 w-3 shadow-emerald-500/50" /> : <AlertCircle className="h-3 w-3 shadow-red-500/50" />}
                        {job.status}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-semibold text-white/80 tracking-tight">{job.cost}</p>
                    </td>
                    <td className="px-8 py-6 text-[10px] font-semibold text-muted-foreground/40 text-neutral-500 italic">
                      {job.date}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                        <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/[0.03] border border-white/[0.03] text-muted-foreground/40 hover:text-primary transition-all">
                          <ExternalLink className="h-4 w-4" />
                        </button>
                        <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/[0.03] border border-white/[0.03] text-muted-foreground/40 hover:text-emerald-400 transition-all">
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-8 py-6 border-t border-white/[0.03] flex items-center justify-between text-[10px] font-semibold capitalize tracking-normal text-muted-foreground/20">
            <span>Archive Index: Showing {history.length} of 1,452 nodes</span>
            <div className="flex gap-4">
              <Button variant="ghost" size="sm" disabled className="h-10 px-4 rounded-xl border border-white/[0.03] disabled:opacity-30">Previous</Button>
              <Button variant="ghost" size="sm" className="h-10 px-4 rounded-xl border border-white/[0.03] hover:bg-white/[0.04] text-muted-foreground/40 hover:text-white transition-all">Next</Button>
            </div>
          </div>
        </div>
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
