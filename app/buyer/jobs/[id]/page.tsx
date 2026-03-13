"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  ArrowLeft,
  CheckCircle,
  Clock,
  Play,
  Download,
  Copy,
  Check,
  Package,
  Wallet,
  ExternalLink
} from "lucide-react"

const jobData = {
  id: "JOB-1848",
  model: "GPT-Vision-Pro",
  modelId: 1,
  status: "completed",
  cost: "0.0525 MATIC",
  input: '{\n  "image": "base64_encoded_image_data",\n  "options": {\n    "confidence_threshold": 0.8,\n    "max_objects": 10\n  }\n}',
  output: '{\n  "objects": [\n    { "label": "cat", "confidence": 0.98, "bbox": [10, 20, 100, 150] },\n    { "label": "chair", "confidence": 0.85, "bbox": [200, 50, 350, 300] }\n  ],\n  "inference_time": "1.1s"\n}',
  createdAt: "2026-03-12 14:45:23",
  completedAt: "2026-03-12 14:45:56",
  latency: "1.2s",
  txHash: "0xabc123def456789..."
}

const timeline = [
  { status: "Job Created", time: "14:45:23", completed: true },
  { status: "Node Assigned", time: "14:45:25", completed: true },
  { status: "Inference Running", time: "14:45:26", completed: true },
  { status: "Result Submitted", time: "14:45:54", completed: true },
  { status: "Payment Released", time: "14:45:56", completed: true }
]

export default function JobDetailPage() {
  const params = useParams()
  const [copied, setCopied] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Simulate progress animation
    const timer = setTimeout(() => setProgress(100), 500)
    return () => clearTimeout(timer)
  }, [])

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-transparent bg-mesh relative">
      <DashboardHeader 
        title={`Mission ${params.id}`}
        subtitle="Detailed analysis of inference execution"
      />
      
      <div className="relative z-10 p-8">
        {/* Back Button */}
        <Link href="/buyer/jobs" className="inline-flex items-center gap-3 text-[10px] font-semibold capitalize tracking-normal text-muted-foreground/40 hover:text-white transition-all mb-10 group">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Neural Jobs
        </Link>

        <div className="grid gap-10 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Job Header */}
            <div className="glass-card p-10 border-white/[0.05] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8">
                <span className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 text-[10px] font-semibold capitalize tracking-normal text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                  Success
                </span>
              </div>

              <div className="flex items-start gap-8">
                <div className="flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-primary/10 border border-primary/20 shadow-[0_0_20px_rgba(139,92,246,0.1)]">
                  <Package className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <h2 className="text-4xl font-semibold tracking-tight text-white">{jobData.model}</h2>
                  <p className="mt-2 text-[10px] font-semibold text-muted-foreground/40 text-neutral-500">{jobData.id}</p>
                </div>
              </div>

              <div className="mt-10 grid grid-cols-3 gap-10 border-t border-white/[0.03] pt-10">
                <div>
                  <p className="text-[9px] font-semibold text-muted-foreground/30 capitalize tracking-normalr mb-2">Settlement</p>
                  <p className="text-2xl font-semibold text-primary tracking-tight">{jobData.cost}</p>
                </div>
                <div>
                  <p className="text-[9px] font-semibold text-muted-foreground/30 capitalize tracking-normalr mb-2">Inference Time</p>
                  <p className="text-2xl font-semibold text-white tracking-tight">{jobData.latency}</p>
                </div>
                <div>
                  <p className="text-[9px] font-semibold text-muted-foreground/30 capitalize tracking-normalr mb-2">Completed</p>
                  <p className="text-xl font-semibold text-white tracking-tight">{jobData.completedAt.split(' ')[1]}</p>
                  <p className="text-[10px] font-medium text-muted-foreground/40 mt-1">{jobData.completedAt.split(' ')[0]}</p>
                </div>
              </div>
            </div>

            {/* Input */}
            <div className="glass-card p-10 border-white/[0.05]">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-semibold tracking-tight text-white/95">Neural Input</h3>
                <button
                  onClick={() => handleCopy(jobData.input)}
                  className="flex items-center gap-3 text-[10px] font-semibold text-neutral-500 text-muted-foreground/40 hover:text-white transition-all group"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4 transition-transform group-hover:scale-110" />}
                  {copied ? "Copied!" : "Copy Manifest"}
                </button>
              </div>
              <pre className="rounded-[1.5rem] bg-black/40 border border-white/[0.03] p-8 text-sm overflow-x-auto font-mono text-primary/70 shadow-inner">
                <code>{jobData.input}</code>
              </pre>
            </div>

            {/* Output */}
            <div className="glass-card p-10 border-white/[0.05]">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-semibold tracking-tight text-white/95">Execution Result</h3>
                <Button variant="ghost" className="h-10 px-4 rounded-xl bg-white/[0.02] border border-white/[0.05] text-[10px] font-semibold text-neutral-500 text-muted-foreground/60 hover:text-white transition-all">
                  <Download className="mr-3 h-4 w-4" />
                  Export Data
                </Button>
              </div>
              <pre className="rounded-[1.5rem] bg-emerald-500/5 border border-emerald-500/20 p-8 text-sm overflow-x-auto font-mono text-emerald-400 shadow-inner">
                <code>{jobData.output}</code>
              </pre>
            </div>
          </div>

          {/* Sidebar - Timeline */}
          <div className="space-y-10">
            {/* Timeline */}
            <div className="glass-card p-10 border-white/[0.05]">
              <h3 className="text-2xl font-semibold tracking-tight text-white/95 mb-10">Mission Timeline</h3>
              <div className="relative">
                {/* Progress line */}
                <div className="absolute left-5 top-0 h-full w-[1px] bg-white/5" />
                <div 
                  className="absolute left-5 top-0 w-[1px] bg-emerald-500 transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                  style={{ height: `${progress}%` }}
                />
                
                <div className="space-y-10">
                  {timeline.map((step, index) => (
                    <div key={index} className="relative flex items-start gap-8 pl-14">
                      <div className={`absolute left-[13px] flex h-4 w-4 items-center justify-center rounded-full border transition-all duration-500 ${
                        step.completed ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-white/5 border-white/[0.05]'
                      }`} />
                      <div>
                        <p className={`text-sm font-semibold tracking-tight ${step.completed ? 'text-white' : 'text-muted-foreground/30'}`}>
                          {step.status}
                        </p>
                        <p className="text-[10px] font-semibold text-muted-foreground/20 text-neutral-500 mt-1 italic">{step.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Transaction Info */}
            <div className="glass-card p-10 border-white/[0.05]">
              <h3 className="text-xl font-semibold tracking-tight text-white/95 mb-6">On-Chain Evidence</h3>
              <div className="space-y-6">
                <div className="p-6 rounded-[1.5rem] bg-white/[0.01] border border-white/5">
                  <p className="text-[9px] font-semibold text-muted-foreground/30 text-neutral-500 italic mb-2">Transaction Hash</p>
                  <div className="flex items-center gap-4">
                    <code className="text-[11px] font-mono text-primary/70 truncate flex-1">{jobData.txHash}</code>
                    <button className="text-muted-foreground/40 hover:text-white hover:scale-110 transition-all">
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-semibold text-neutral-500 text-muted-foreground/30">
                  <div className="p-2 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                    <Wallet className="h-4 w-4 text-emerald-500/40" />
                  </div>
                  <span>Escrow Settlement Complete</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="glass-card p-10 border-white/[0.05] shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
              <h3 className="text-xl font-semibold tracking-tight text-white/95 mb-8">Post-Action</h3>
              <div className="space-y-4">
                <Link href={`/marketplace/${jobData.modelId}/run`} className="block">
                  <Button className="w-full h-14 bg-primary text-white hover:bg-primary/90 font-semibold capitalize tracking-normal text-[11px] rounded-2xl shadow-[0_10px_30px_rgba(139,92,246,0.2)] group">
                    <Play className="mr-3 h-4 w-4 fill-current transition-transform group-hover:scale-110" />
                    Re-Execute Job
                  </Button>
                </Link>
                <Link href={`/marketplace/${jobData.modelId}`} className="block">
                  <Button variant="ghost" className="w-full h-14 border border-white/[0.03] hover:bg-white/5 text-[11px] font-semibold text-neutral-500 text-muted-foreground/40 hover:text-white rounded-2xl transition-all">
                    Model Blueprint
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
