"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
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
  Loader2
} from "lucide-react"

const steps = [
  { id: 1, name: "Input Data", icon: FileJson },
  { id: 2, name: "Review", icon: CheckCircle },
  { id: 3, name: "Payment", icon: Wallet }
]

// Mock model data
const modelData = {
  name: "GPT-Vision-Pro",
  category: "Image Recognition",
  price: 0.05,
  platformFee: 0.0025
}

export default function RunInferencePage() {
  const router = useRouter()
  const params = useParams()
  const [currentStep, setCurrentStep] = useState(1)
  const [inputData, setInputData] = useState('{\n  "image": "base64_encoded_image_data",\n  "options": {\n    "confidence_threshold": 0.8\n  }\n}')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState("")

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
    // Simulate MetaMask transaction
    await new Promise(resolve => setTimeout(resolve, 2000))
    // Redirect to job status page
    router.push('/buyer/jobs/JOB-1848')
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          {/* Back Button */}
          <Link href={`/marketplace/${params.id}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to Model
          </Link>

          <h1 className="text-2xl font-bold mb-8">Run Inference</h1>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex items-center">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                      currentStep > step.id
                        ? 'border-accent bg-accent text-accent-foreground'
                        : currentStep === step.id
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-muted/50 text-muted-foreground'
                    }`}>
                      {currentStep > step.id ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <step.icon className="h-5 w-5" />
                      )}
                    </div>
                    <span className={`ml-3 text-sm font-medium hidden sm:block ${
                      currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {step.name}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`mx-4 h-0.5 w-12 sm:w-24 ${
                      currentStep > step.id ? 'bg-accent' : 'bg-border'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <Card className="border-border/40 bg-card/30 p-8">
            {/* Step 1: Input Data */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold">Input Data</h2>
                  <p className="text-sm text-muted-foreground">
                    Provide the JSON input for your inference request
                  </p>
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
                    className={`font-mono text-sm bg-input/50 min-h-64 ${error ? 'border-destructive' : ''}`}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Review */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold">Review Details</h2>
                  <p className="text-sm text-muted-foreground">
                    Confirm your inference request before payment
                  </p>
                </div>

                <div className="rounded-xl border border-border/40 bg-muted/30 p-6 space-y-4">
                  <div className="flex items-center gap-4 pb-4 border-b border-border/40">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <Package className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{modelData.name}</p>
                      <p className="text-sm text-muted-foreground">{modelData.category}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Model price</span>
                      <span>{modelData.price} MATIC</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Platform fee (5%)</span>
                      <span>{modelData.platformFee} MATIC</span>
                    </div>
                    <div className="flex justify-between font-semibold pt-2 border-t border-border/40">
                      <span>Total</span>
                      <span className="text-primary">{modelData.price + modelData.platformFee} MATIC</span>
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

            {/* Step 3: Payment */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold">Confirm Payment</h2>
                  <p className="text-sm text-muted-foreground">
                    Complete the transaction to run your inference
                  </p>
                </div>

                {isProcessing ? (
                  <div className="flex flex-col items-center py-12">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="mt-4 font-medium">Processing Transaction...</p>
                    <p className="text-sm text-muted-foreground">Please confirm in MetaMask</p>
                  </div>
                ) : (
                  <>
                    <div className="rounded-xl border border-primary/40 bg-primary/5 p-6">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">You will pay</p>
                        <p className="text-4xl font-bold text-primary mt-2">
                          {modelData.price + modelData.platformFee} MATIC
                        </p>
                        <p className="text-sm text-muted-foreground">~$0.061 USD</p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-chart-4/40 bg-chart-4/10 p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-chart-4 shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-chart-4">Escrow Protection</p>
                          <p className="text-muted-foreground">
                            Your payment will be held in escrow until the inference completes successfully. 
                            If the job fails, you will receive a full refund.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-accent" />
                        Payment secured by smart contract
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-accent" />
                        Automatic refund on failure
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-accent" />
                        Results delivered to your dashboard
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            {!isProcessing && (
              <div className="mt-8 flex justify-between">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="border-border/60"
                >
                  Back
                </Button>
                {currentStep < 3 ? (
                  <Button onClick={nextStep} className="bg-primary hover:bg-primary/90">
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90">
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
