"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { useAccount } from "wagmi"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Header } from "@/components/landing/header"
import {
  ArrowLeft,
  ArrowRight,
  Package,
  CheckCircle,
  Wallet,
  FileJson,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { fetchModelById, type MarketplaceModel } from "@/lib/model-api"

const steps = [
  { id: 1, name: "Input Data", icon: FileJson },
  { id: 2, name: "Review", icon: CheckCircle },
  { id: 3, name: "Payment", icon: Wallet },
]

export default function RunInferencePage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const { address } = useAccount()
  const [currentStep, setCurrentStep] = useState(1)
  const [inputData, setInputData] = useState('{\n  "input": "sample_value"\n}')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState("")
  const [model, setModel] = useState<MarketplaceModel | null>(null)
  const [isLoadingModel, setIsLoadingModel] = useState(true)

  useEffect(() => {
    let ignore = false

    const loadModel = async () => {
      if (!params?.id) return
      try {
        setIsLoadingModel(true)
        const item = await fetchModelById(params.id, address)
        if (!ignore) setModel(item)
      } finally {
        if (!ignore) setIsLoadingModel(false)
      }
    }

    void loadModel()
    return () => {
      ignore = true
    }
  }, [params?.id, address])

  const validateJson = () => {
    try {
      JSON.parse(inputData)
      setError("")
      return true
    } catch {
      setError("Invalid JSON format")
      return false
    }
  }

  const nextStep = () => {
    if (currentStep === 1 && !validateJson()) return
    if (currentStep < 3) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async () => {
    setIsProcessing(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    router.push("/buyer/jobs")
  }

  const modelPrice = model?.price ?? 0
  const platformFee = Number((modelPrice * 0.05).toFixed(6))

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <Link
            href={`/marketplace/${params.id}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Model
          </Link>

          <h1 className="text-2xl font-bold mb-8">Run Inference</h1>

          {isLoadingModel && (
            <Card className="border-border/40 bg-card/30 p-6 mb-6">
              <p className="text-sm text-muted-foreground">Loading model pricing...</p>
            </Card>
          )}

          {!isLoadingModel && !model && (
            <Card className="border-border/40 bg-card/30 p-6 mb-6">
              <p className="text-sm text-destructive">Model not found.</p>
            </Card>
          )}

          {!!model && (
            <div className="mb-6 rounded-xl border border-border/40 bg-muted/30 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{model.name}</p>
                  <p className="text-xs text-muted-foreground">{model.category}</p>
                </div>
              </div>
            </div>
          )}

          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex items-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                        currentStep > step.id
                          ? "border-accent bg-accent text-accent-foreground"
                          : currentStep === step.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-muted/50 text-muted-foreground"
                      }`}
                    >
                      {currentStep > step.id ? <CheckCircle className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
                    </div>
                    <span
                      className={`ml-3 text-sm font-medium hidden sm:block ${
                        currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {step.name}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`mx-4 h-0.5 w-12 sm:w-24 ${currentStep > step.id ? "bg-accent" : "bg-border"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <Card className="border-border/40 bg-card/30 p-8">
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold">Input Data</h2>
                  <p className="text-sm text-muted-foreground">Provide the JSON input for your inference request</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">JSON Input</label>
                    {error && (
                      <span className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {error}
                      </span>
                    )}
                  </div>
                  <Textarea
                    value={inputData}
                    onChange={(e) => {
                      setInputData(e.target.value)
                      setError("")
                    }}
                    placeholder="Enter JSON input..."
                    className={`font-mono text-sm bg-input/50 min-h-64 ${error ? "border-destructive" : ""}`}
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold">Review Details</h2>
                  <p className="text-sm text-muted-foreground">Confirm your inference request before payment</p>
                </div>

                <div className="rounded-xl border border-border/40 bg-muted/30 p-6 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Model price</span>
                      <span>{modelPrice} MATIC</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Platform fee (5%)</span>
                      <span>{platformFee} MATIC</span>
                    </div>
                    <div className="flex justify-between font-semibold pt-2 border-t border-border/40">
                      <span>Total</span>
                      <span className="text-primary">{modelPrice + platformFee} MATIC</span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Your Input</p>
                  <pre className="rounded-lg bg-muted/50 p-4 text-sm overflow-x-auto">
                    <code>{inputData}</code>
                  </pre>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold">Confirm Payment</h2>
                  <p className="text-sm text-muted-foreground">Complete the transaction to run your inference</p>
                </div>

                {isProcessing ? (
                  <div className="flex flex-col items-center py-12">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="mt-4 font-medium">Processing Transaction...</p>
                    <p className="text-sm text-muted-foreground">Please confirm in MetaMask</p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-primary/40 bg-primary/5 p-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">You will pay</p>
                      <p className="text-4xl font-bold text-primary mt-2">{modelPrice + platformFee} MATIC</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!isProcessing && (
              <div className="mt-8 flex justify-between">
                <Button variant="outline" onClick={prevStep} disabled={currentStep === 1} className="border-border/60">
                  Back
                </Button>
                {currentStep < 3 ? (
                  <Button onClick={nextStep} className="bg-primary hover:bg-primary/90">
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90" disabled={!model}>
                    <Wallet className="mr-2 h-4 w-4" />
                    Confirm & Pay
                  </Button>
                )}
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  )
}
