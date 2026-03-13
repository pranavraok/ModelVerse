"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Header } from "@/components/landing/header"
import { 
  Star,
  Play,
  Package,
  ArrowLeft,
  CheckCircle,
  Clock,
  Users,
  Zap,
  Shield,
  Code,
  Copy,
  Check
} from "lucide-react"

// Mock model data
const modelData = {
  id: 1,
  name: "GPT-Vision-Pro",
  description: "Advanced image recognition and analysis model with high accuracy for object detection. This model can identify thousands of objects, scenes, and concepts in images with industry-leading precision. Perfect for applications requiring visual understanding.",
  category: "Image Recognition",
  creator: "0x8912...3456",
  creatorRating: 4.9,
  price: 0.05,
  rating: 4.9,
  jobs: 1247,
  avgLatency: "1.2s",
  successRate: "99.2%",
  sampleInput: '{\n  "image": "base64_encoded_image_data",\n  "options": {\n    "confidence_threshold": 0.8,\n    "max_objects": 10\n  }\n}',
  sampleOutput: '{\n  "objects": [\n    { "label": "cat", "confidence": 0.98, "bbox": [10, 20, 100, 150] },\n    { "label": "chair", "confidence": 0.85, "bbox": [200, 50, 350, 300] }\n  ],\n  "inference_time": "1.1s"\n}',
  features: [
    "High accuracy object detection",
    "Multi-object recognition",
    "Scene understanding",
    "Custom confidence thresholds",
    "Bounding box coordinates"
  ]
}

const reviews = [
  {
    id: 1,
    user: "0x5678...9012",
    rating: 5,
    comment: "Excellent model! Fast and accurate results every time.",
    date: "2 days ago"
  },
  {
    id: 2,
    user: "0x9012...3456",
    rating: 5,
    comment: "Great for our production use case. Highly recommend.",
    date: "1 week ago"
  },
  {
    id: 3,
    user: "0x3456...7890",
    rating: 4,
    comment: "Good accuracy but could be faster for larger images.",
    date: "2 weeks ago"
  }
]

export default function ModelDetailPage() {
  const params = useParams()
  const [copied, setCopied] = useState(false)
  const [testInput, setTestInput] = useState(modelData.sampleInput)
  const [testOutput, setTestOutput] = useState("")
  const [isTesting, setIsTesting] = useState(false)

  const handleCopyInput = () => {
    navigator.clipboard.writeText(modelData.sampleInput)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleTestModel = async () => {
    setIsTesting(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    setTestOutput(modelData.sampleOutput)
    setIsTesting(false)
  }

  return (
    <div className="min-h-screen bg-[#030303] bg-mesh relative overflow-hidden">
      <Header />

      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="aurora-1" />
        <div className="aurora-2" />
      </div>
      
      <main className="relative z-10 pt-28 pb-20">
        <div className="mx-auto max-w-7xl px-8 lg:px-12">
          {/* Back Button */}
          <Link href="/marketplace" className="inline-flex items-center gap-3 text-[10px] font-semibold capitalize tracking-normal text-muted-foreground/40 hover:text-white transition-all mb-10 group">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Marketplace
          </Link>

          <div className="grid gap-10 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-10">
              {/* Model Header */}
              <div className="glass-card p-10 border-white/[0.05]">
                <div className="flex items-start gap-8">
                  <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-primary/10 border border-primary/20 shadow-[0_0_20px_rgba(139,92,246,0.1)]">
                    <Package className="h-10 w-10 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <h1 className="text-4xl font-semibold tracking-tight text-white">{modelData.name}</h1>
                      <span className="rounded-xl bg-primary/10 border border-primary/20 px-3 py-1 text-[10px] font-semibold text-neutral-500 text-primary shadow-[0_0_10px_rgba(139,92,246,0.1)]">
                        {modelData.category}
                      </span>
                    </div>
                    <p className="mt-2 text-xs font-semibold text-muted-foreground/40 text-neutral-500">
                      by {modelData.creator}
                    </p>
                    <div className="mt-4 flex items-center gap-5">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 fill-emerald-500 text-emerald-500" />
                        <span className="font-semibold text-white/90">{modelData.rating}</span>
                        <span className="text-xs font-medium text-muted-foreground/40">({modelData.jobs} jobs)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="mt-8 text-[15px] text-muted-foreground/70 leading-relaxed font-medium">
                  {modelData.description}
                </p>

                {/* Stats */}
                <div className="mt-10 grid grid-cols-3 gap-6 border-t border-white/[0.03] pt-10">
                  <div className="flex items-center gap-4 group">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/[0.05] group-hover:scale-110 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all duration-500">
                      <Zap className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-[9px] font-semibold text-muted-foreground/30 text-neutral-500">Avg Latency</p>
                      <p className="font-semibold text-white/90 tracking-tight">{modelData.avgLatency}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 group">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/[0.05] group-hover:scale-110 group-hover:bg-accent/10 group-hover:border-accent/20 transition-all duration-500">
                      <Shield className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <p className="text-[9px] font-semibold text-muted-foreground/30 text-neutral-500">Success Rate</p>
                      <p className="font-semibold text-white/90 tracking-tight">{modelData.successRate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 group">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/[0.05] group-hover:scale-110 transition-all duration-500">
                      <Users className="h-6 w-6 text-muted-foreground/40" />
                    </div>
                    <div>
                      <p className="text-[9px] font-semibold text-muted-foreground/30 text-neutral-500">Total Jobs</p>
                      <p className="font-semibold text-white/90 tracking-tight">{modelData.jobs.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="glass-card p-10 border-white/[0.05]">
                <h2 className="text-2xl font-semibold tracking-tight text-white/95 mb-8">Technical Specs</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {modelData.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.01] border border-white/[0.03] hover:bg-white/[0.03] transition-all">
                      <CheckCircle className="h-5 w-5 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                      <span className="text-sm font-semibold text-white/80">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sample I/O */}
              <div className="glass-card p-10 border-white/[0.05]">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-semibold tracking-tight text-white/95">Neural Blueprint</h2>
                  <button 
                    onClick={handleCopyInput}
                    className="flex items-center gap-2 text-[10px] font-semibold text-neutral-500 text-muted-foreground/40 hover:text-primary transition-all group"
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />}
                    {copied ? "Copied!" : "Copy Endpoint"}
                  </button>
                </div>
                
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="space-y-3">
                    <p className="text-[9px] font-semibold text-muted-foreground/20 text-neutral-500 italic">Input JSON</p>
                    <pre className="rounded-[2rem] bg-black/40 border border-white/[0.03] p-8 text-sm overflow-x-auto font-mono text-primary/70 shadow-inner">
                      <code>{modelData.sampleInput}</code>
                    </pre>
                  </div>
                  <div className="space-y-3">
                    <p className="text-[9px] font-semibold text-muted-foreground/20 text-neutral-500 italic">Output Schema</p>
                    <pre className="rounded-[2rem] bg-black/40 border border-white/[0.03] p-8 text-sm overflow-x-auto font-mono text-emerald-500/60 shadow-inner">
                      <code>{modelData.sampleOutput}</code>
                    </pre>
                  </div>
                </div>
              </div>

              {/* Try Model */}
              <div className="glass-card p-10 border-white/[0.05]">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
                    <Code className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-white/95">Live Inference Lab</h2>
                    <p className="text-[10px] font-semibold text-muted-foreground/40 text-neutral-500 mt-1">Test neural weights in real-time</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <Textarea
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    placeholder="Enter JSON input..."
                    className="font-mono text-sm bg-black/20 border-white/[0.05] focus:ring-primary/20 focus:border-primary/40 rounded-[2rem] min-h-40 p-8 text-white/80"
                  />
                  
                  <Button 
                    onClick={handleTestModel}
                    disabled={isTesting}
                    className="h-14 bg-primary text-white hover:bg-primary/90 font-semibold capitalize tracking-normal text-[11px] rounded-2xl shadow-[0_0_25px_rgba(139,92,246,0.2)]"
                  >
                    {isTesting ? (
                      <>
                        <div className="mr-3 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Play className="mr-3 h-4 w-4" />
                        Execute Inference
                      </>
                    )}
                  </Button>

                  {testOutput && (
                    <div className="mt-8 animate-in fade-in slide-in-from-top-4 duration-700">
                      <p className="text-[9px] font-semibold text-emerald-500/40 text-neutral-500 mb-3 italic">Output Recieved</p>
                      <pre className="rounded-[2rem] bg-emerald-500/5 border border-emerald-500/20 p-8 text-sm overflow-x-auto font-mono text-emerald-400">
                        <code>{testOutput}</code>
                      </pre>
                    </div>
                  )}
                </div>
              </div>

              {/* Reviews */}
              <div className="glass-card p-10 border-white/[0.05]">
                <h2 className="text-2xl font-semibold tracking-tight text-white/95 mb-10 text-center">Neural Validation</h2>
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="rounded-[2rem] border border-white/[0.03] bg-white/[0.01] p-8 transition-all hover:bg-white/[0.03] hover:border-white/[0.05]">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-semibold text-primary shadow-sm">
                            {review.user.slice(2, 4).toUpperCase()}
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-white/90">{review.user}</span>
                            <p className="text-[9px] font-semibold text-muted-foreground/30 text-neutral-500 mt-1">{review.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-emerald-500 text-emerald-500 shadow-sm" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground/70 leading-relaxed font-medium">"{review.comment}"</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar - Pricing */}
            <div className="space-y-8">
              <div className="sticky top-28 glass-card p-10 border-white/[0.05] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                <div className="text-center mb-10">
                  <p className="text-[10px] font-semibold text-muted-foreground/30 capitalize tracking-normalr mb-4">Inference Cost</p>
                  <div className="relative inline-block">
                    <p className="text-6xl font-semibold tracking-tight text-white drop-shadow-xl">{modelData.price}</p>
                    <span className="absolute -right-12 bottom-2 text-xs font-semibold text-primary text-neutral-500 italic">MATIC</span>
                  </div>
                  <p className="text-[10px] font-semibold text-muted-foreground/20 text-neutral-500 mt-4 italic">~$0.058 USD</p>
                </div>

                <div className="space-y-4 mb-10 p-8 rounded-[2rem] bg-white/[0.02] border border-white/5">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-500">
                    <span className="text-muted-foreground/40">Network Fee</span>
                    <span className="text-white/60">0.0025 MATIC</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold capitalize tracking-normal pt-4 border-t border-white/5">
                    <span className="text-muted-foreground/40">Total Settlement</span>
                    <span className="text-emerald-500">0.0525 MATIC</span>
                  </div>
                </div>

                <Link href={`/marketplace/${params.id}/run`}>
                  <Button className="w-full h-16 bg-primary text-white hover:bg-primary/90 font-semibold capitalize tracking-normal text-[11px] rounded-2xl shadow-[0_10px_30px_rgba(139,92,246,0.3)] group" size="lg">
                    <Play className="mr-3 h-5 w-5 fill-current transition-transform group-hover:scale-110" />
                    Initialize Node
                  </Button>
                </Link>

                <div className="mt-10 space-y-4 pt-10 border-t border-white/5">
                  <div className="flex items-center gap-4 text-[10px] font-semibold text-neutral-500 text-muted-foreground/30">
                    <Clock className="h-4 w-4 text-primary/40" />
                    Latency: {modelData.avgLatency}
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-semibold text-neutral-500 text-muted-foreground/30">
                    <Shield className="h-4 w-4 text-emerald-500/40" />
                    Escrow Protected
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-semibold text-neutral-500 text-muted-foreground/30">
                    <CheckCircle className="h-4 w-4 text-accent/40" />
                    Guaranteed Veracity
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}