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
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Back Button */}
          <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to Marketplace
          </Link>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Model Header */}
              <Card className="border-border/40 bg-card/30 p-6">
                <div className="flex items-start gap-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
                    <Package className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h1 className="text-2xl font-bold">{modelData.name}</h1>
                      <span className="rounded-full bg-primary/20 px-2 py-1 text-xs font-medium text-primary">
                        {modelData.category}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      by {modelData.creator}
                    </p>
                    <div className="mt-3 flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-chart-4 text-chart-4" />
                        <span className="font-medium">{modelData.rating}</span>
                        <span className="text-sm text-muted-foreground">({modelData.jobs} jobs)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="mt-6 text-muted-foreground leading-relaxed">
                  {modelData.description}
                </p>

                {/* Stats */}
                <div className="mt-6 grid grid-cols-3 gap-4 border-t border-border/40 pt-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Zap className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Avg Latency</p>
                      <p className="font-semibold">{modelData.avgLatency}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                      <Shield className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Success Rate</p>
                      <p className="font-semibold">{modelData.successRate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-4/10">
                      <Users className="h-5 w-5 text-chart-4" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Jobs</p>
                      <p className="font-semibold">{modelData.jobs}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Features */}
              <Card className="border-border/40 bg-card/30 p-6">
                <h2 className="text-lg font-semibold mb-4">Features</h2>
                <ul className="space-y-3">
                  {modelData.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-accent" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Sample I/O */}
              <Card className="border-border/40 bg-card/30 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Sample Input/Output</h2>
                  <button 
                    onClick={handleCopyInput}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                
                <div className="grid gap-4 lg:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Input</p>
                    <pre className="rounded-lg bg-muted/50 p-4 text-sm overflow-x-auto">
                      <code>{modelData.sampleInput}</code>
                    </pre>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Output</p>
                    <pre className="rounded-lg bg-muted/50 p-4 text-sm overflow-x-auto">
                      <code>{modelData.sampleOutput}</code>
                    </pre>
                  </div>
                </div>
              </Card>

              {/* Try Model */}
              <Card className="border-border/40 bg-card/30 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Code className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">Try Before You Buy</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Test the model with sample data before making a purchase.
                </p>
                
                <Textarea
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  placeholder="Enter JSON input..."
                  className="font-mono text-sm bg-input/50 min-h-32 mb-4"
                />
                
                <Button 
                  onClick={handleTestModel}
                  disabled={isTesting}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isTesting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Test Model
                    </>
                  )}
                </Button>

                {testOutput && (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-2">Result</p>
                    <pre className="rounded-lg bg-accent/10 border border-accent/20 p-4 text-sm overflow-x-auto">
                      <code>{testOutput}</code>
                    </pre>
                  </div>
                )}
              </Card>

              {/* Reviews */}
              <Card className="border-border/40 bg-card/30 p-6">
                <h2 className="text-lg font-semibold mb-4">Reviews</h2>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="rounded-xl border border-border/40 bg-muted/30 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium">
                            {review.user.slice(2, 4)}
                          </div>
                          <span className="text-sm font-medium">{review.user}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-chart-4 text-chart-4" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                      <p className="mt-2 text-xs text-muted-foreground">{review.date}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Sidebar - Pricing */}
            <div>
              <Card className="sticky top-24 border-border/40 bg-card/30 p-6">
                <div className="text-center mb-6">
                  <p className="text-sm text-muted-foreground">Price per inference</p>
                  <p className="text-4xl font-bold text-primary">{modelData.price} MATIC</p>
                  <p className="text-sm text-muted-foreground">~$0.058 USD</p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Platform fee (5%)</span>
                    <span>0.0025 MATIC</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Creator receives</span>
                    <span className="text-accent">0.0475 MATIC</span>
                  </div>
                </div>

                <Link href={`/marketplace/${params.id}/run`}>
                  <Button className="w-full bg-primary hover:bg-primary/90" size="lg">
                    <Play className="mr-2 h-4 w-4" />
                    Run Inference
                  </Button>
                </Link>

                <div className="mt-6 space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Average response time: {modelData.avgLatency}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    Escrow protected payment
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="h-4 w-4" />
                    Refund if inference fails
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
