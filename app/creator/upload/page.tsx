"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Upload, 
  FileCode, 
  Check, 
  AlertCircle,
  Loader2,
  ArrowRight
} from "lucide-react"

const categories = [
  { value: "image-recognition", label: "Image Recognition" },
  { value: "nlp", label: "Natural Language Processing" },
  { value: "credit-scoring", label: "Credit Scoring" },
  { value: "voice-analysis", label: "Voice Analysis" },
  { value: "other", label: "Other" }
]

const steps = [
  { id: 1, name: "Model Info" },
  { id: 2, name: "Upload File" },
  { id: 3, name: "Pricing" },
  { id: 4, name: "Review" }
]

export default function UploadModelPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    file: null as File | null,
    sampleInput: "",
    expectedOutput: "",
    price: ""
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, file })
    }
  }

  const handleSubmit = async () => {
    setIsUploading(true)
    
    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200))
      setUploadProgress(i)
    }
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Redirect to models page
    router.push('/creator/models')
  }

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  return (
    <div className="min-h-screen">
      <DashboardHeader 
        title="Upload Model" 
        subtitle="Share your AI model with the world"
      />
      
      <div className="p-6">
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
                      <Check className="h-5 w-5" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <span className={`ml-3 text-sm font-medium ${
                    currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`mx-4 h-0.5 w-16 lg:w-24 ${
                    currentStep > step.id ? 'bg-accent' : 'bg-border'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card className="mx-auto max-w-2xl border-border/40 bg-card/30 p-8">
          {/* Step 1: Model Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold">Model Information</h2>
                <p className="text-sm text-muted-foreground">
                  Provide details about your AI model
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Model Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., GPT-Vision-Pro"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-2 bg-input/50"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what your model does and its capabilities..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-2 min-h-32 bg-input/50"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className="mt-2 bg-input/50">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Upload File */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold">Upload Model File</h2>
                <p className="text-sm text-muted-foreground">
                  Upload your model file (.tflite or .onnx, max 100MB)
                </p>
              </div>

              <div className="space-y-4">
                <div
                  className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-colors ${
                    formData.file 
                      ? 'border-accent bg-accent/5' 
                      : 'border-border hover:border-primary/50 hover:bg-primary/5'
                  }`}
                >
                  <input
                    type="file"
                    accept=".tflite,.onnx"
                    onChange={handleFileChange}
                    className="absolute inset-0 cursor-pointer opacity-0"
                  />
                  {formData.file ? (
                    <>
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent/20">
                        <FileCode className="h-7 w-7 text-accent" />
                      </div>
                      <p className="mt-4 font-medium">{formData.file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                        <Upload className="h-7 w-7 text-primary" />
                      </div>
                      <p className="mt-4 font-medium">Drop your file here or click to browse</p>
                      <p className="text-sm text-muted-foreground">
                        Supported formats: .tflite, .onnx
                      </p>
                    </>
                  )}
                </div>

                <div>
                  <Label htmlFor="sampleInput">Sample Input JSON</Label>
                  <Textarea
                    id="sampleInput"
                    placeholder='{"image": "base64_encoded_image"}'
                    value={formData.sampleInput}
                    onChange={(e) => setFormData({ ...formData, sampleInput: e.target.value })}
                    className="mt-2 min-h-24 bg-input/50 font-mono text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="expectedOutput">Expected Output Description</Label>
                  <Textarea
                    id="expectedOutput"
                    placeholder="Describe the expected output format..."
                    value={formData.expectedOutput}
                    onChange={(e) => setFormData({ ...formData, expectedOutput: e.target.value })}
                    className="mt-2 min-h-24 bg-input/50"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Pricing */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold">Set Your Price</h2>
                <p className="text-sm text-muted-foreground">
                  Choose how much to charge per inference
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="price">Price per Inference (MATIC)</Label>
                  <div className="relative mt-2">
                    <Input
                      id="price"
                      type="number"
                      step="0.001"
                      min="0.001"
                      placeholder="0.05"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="bg-input/50 pr-16"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      MATIC
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Platform fee: 5% | You receive: 95%
                  </p>
                </div>

                <div className="rounded-xl border border-border/40 bg-muted/30 p-4">
                  <h3 className="font-medium">Pricing Recommendations</h3>
                  <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Image Recognition models</span>
                      <span>0.03 - 0.10 MATIC</span>
                    </div>
                    <div className="flex justify-between">
                      <span>NLP models</span>
                      <span>0.02 - 0.08 MATIC</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Credit Scoring models</span>
                      <span>0.05 - 0.15 MATIC</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold">Review & Submit</h2>
                <p className="text-sm text-muted-foreground">
                  Review your model details before uploading
                </p>
              </div>

              {isUploading ? (
                <div className="flex flex-col items-center py-8">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <p className="mt-4 font-medium">Uploading to IPFS...</p>
                  <div className="mt-4 w-full max-w-xs">
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div 
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="mt-2 text-center text-sm text-muted-foreground">
                      {uploadProgress}%
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-xl border border-border/40 bg-muted/30 p-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Model Name</p>
                        <p className="font-medium">{formData.name || "Not set"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Category</p>
                        <p className="font-medium">
                          {categories.find(c => c.value === formData.category)?.label || "Not set"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">File</p>
                        <p className="font-medium">{formData.file?.name || "Not uploaded"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Price</p>
                        <p className="font-medium">{formData.price || "0"} MATIC</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-border/40">
                      <p className="text-xs text-muted-foreground">Description</p>
                      <p className="text-sm">{formData.description || "No description"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 rounded-xl border border-chart-4/40 bg-chart-4/10 p-4">
                    <AlertCircle className="h-5 w-5 text-chart-4 shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-chart-4">Important</p>
                      <p className="text-muted-foreground">
                        Once submitted, your model will be uploaded to IPFS and registered on the blockchain. A MetaMask transaction will be required.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          {!isUploading && (
            <div className="mt-8 flex justify-between">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="border-border/60"
              >
                Back
              </Button>
              {currentStep < 4 ? (
                <Button onClick={nextStep} className="bg-primary hover:bg-primary/90">
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90">
                  Upload Model
                  <Upload className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
