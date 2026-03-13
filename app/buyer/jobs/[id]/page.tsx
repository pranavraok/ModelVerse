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
    <div className="min-h-screen">
      <DashboardHeader 
        title={`Job ${params.id}`}
        subtitle="View job details and results"
      />
      
      <div className="p-6">
        {/* Back Button */}
        <Link href="/buyer/jobs" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </Link>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <Card className="border-border/40 bg-card/30 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                    <Package className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{jobData.model}</h2>
                    <p className="text-sm text-muted-foreground">{jobData.id}</p>
                  </div>
                </div>
                <span className="rounded-full bg-accent/20 px-3 py-1 text-sm font-medium text-accent">
                  Completed
                </span>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-6 border-t border-border/40 pt-6">
                <div>
                  <p className="text-xs text-muted-foreground">Cost</p>
                  <p className="text-lg font-semibold text-primary">{jobData.cost}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Latency</p>
                  <p className="text-lg font-semibold">{jobData.latency}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Completed</p>
                  <p className="text-lg font-semibold">{jobData.completedAt}</p>
                </div>
              </div>
            </Card>

            {/* Input */}
            <Card className="border-border/40 bg-card/30 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Input Data</h3>
                <button
                  onClick={() => handleCopy(jobData.input)}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <pre className="rounded-lg bg-muted/50 p-4 text-sm overflow-x-auto">
                <code>{jobData.input}</code>
              </pre>
            </Card>

            {/* Output */}
            <Card className="border-border/40 bg-card/30 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Output Result</h3>
                <Button variant="outline" size="sm" className="border-border/60">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
              <pre className="rounded-lg bg-accent/10 border border-accent/20 p-4 text-sm overflow-x-auto">
                <code>{jobData.output}</code>
              </pre>
            </Card>
          </div>

          {/* Sidebar - Timeline */}
          <div className="space-y-6">
            {/* Timeline */}
            <Card className="border-border/40 bg-card/30 p-6">
              <h3 className="font-semibold mb-6">Job Timeline</h3>
              <div className="relative">
                {/* Progress line */}
                <div className="absolute left-4 top-0 h-full w-0.5 bg-border" />
                <div 
                  className="absolute left-4 top-0 w-0.5 bg-accent transition-all duration-1000"
                  style={{ height: `${progress}%` }}
                />
                
                <div className="space-y-6">
                  {timeline.map((step, index) => (
                    <div key={index} className="relative flex items-start gap-4 pl-10">
                      <div className={`absolute left-2 flex h-5 w-5 items-center justify-center rounded-full ${
                        step.completed ? 'bg-accent' : 'bg-muted'
                      }`}>
                        {step.completed ? (
                          <CheckCircle className="h-3 w-3 text-accent-foreground" />
                        ) : (
                          <Clock className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${step.completed ? '' : 'text-muted-foreground'}`}>
                          {step.status}
                        </p>
                        <p className="text-xs text-muted-foreground">{step.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Transaction Info */}
            <Card className="border-border/40 bg-card/30 p-6">
              <h3 className="font-semibold mb-4">Transaction</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Transaction Hash</p>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-sm truncate">{jobData.txHash}</code>
                    <button className="text-primary hover:text-primary/90">
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Wallet className="h-4 w-4" />
                  <span>Payment released to creator</span>
                </div>
              </div>
            </Card>

            {/* Actions */}
            <Card className="border-border/40 bg-card/30 p-6">
              <h3 className="font-semibold mb-4">Actions</h3>
              <div className="space-y-3">
                <Link href={`/marketplace/${jobData.modelId}/run`} className="w-full">
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    <Play className="mr-2 h-4 w-4" />
                    Run Again
                  </Button>
                </Link>
                <Link href={`/marketplace/${jobData.modelId}`} className="w-full">
                  <Button variant="outline" className="w-full border-border/60">
                    View Model
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
