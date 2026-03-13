"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { decodeEventLog, formatEther, parseGwei } from "viem"
import { useAccount, usePublicClient, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi"
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
  ArrowRight,
  ShieldCheck
} from "lucide-react"
import StakeRegistryABI from "@/lib/abis/ModelVerseStakeRegistryABI.json"
import ModelRegistryABI from "@/lib/abis/ModelRegistryABI.json"

const STAKE_REGISTRY_ADDRESS =
  (process.env.NEXT_PUBLIC_STAKE_REGISTRY_ADDRESS ??
    "0x818e9Df23c8A2B61b7796b0A081C0bA1014d1d91") as `0x${string}`
const MODEL_REGISTRY_ADDRESS =
  (process.env.NEXT_PUBLIC_MODEL_REGISTRY_ADDRESS ??
    "0x818e9Df23c8A2B61b7796b0A081C0bA1014d1d91") as `0x${string}`
const MIN_PRIORITY_FEE_WEI = parseGwei("25")
const MIN_MAX_FEE_WEI = parseGwei("30")

const categories = [
  { value: "image-recognition", label: "Image Recognition" },
  { value: "nlp", label: "Natural Language Processing" },
  { value: "credit-scoring", label: "Credit Scoring" },
  { value: "voice-analysis", label: "Voice Analysis" },
  { value: "other", label: "Other" }
]

const steps = [
  { id: 1, name: "Staking" },
  { id: 2, name: "Model Info" },
  { id: 3, name: "Upload File" },
  { id: 4, name: "Pricing" },
  { id: 5, name: "Review" }
]

export default function UploadModelPage() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const publicClient = usePublicClient()
  const { writeContractAsync } = useWriteContract()
  const [currentStep, setCurrentStep] = useState(1)
  const [stepError, setStepError] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState("")
  const [uploadedCid, setUploadedCid] = useState("")
  const [stakeTxHash, setStakeTxHash] = useState<`0x${string}` | undefined>()
  const [stakeError, setStakeError] = useState("")
  const [isStaking, setIsStaking] = useState(false)
  const [hasStakedInSession, setHasStakedInSession] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    file: null as File | null,
    sampleInput: "",
    expectedOutput: "",
    price: ""
  })

  const {
    data: requiredStakeRaw,
    isLoading: isStakeAmountLoading,
    error: requiredStakeError,
  } = useReadContract({
    address: STAKE_REGISTRY_ADDRESS,
    abi: StakeRegistryABI,
    functionName: "MODEL_STAKE_AMOUNT",
  })

  const { data: totalStakeRaw, error: totalStakeError } = useReadContract({
    address: STAKE_REGISTRY_ADDRESS,
    abi: StakeRegistryABI,
    functionName: "getTotalStake",
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address),
    },
  })

  const requiredStake = typeof requiredStakeRaw === "bigint" ? requiredStakeRaw : 0n
  const totalStake = typeof totalStakeRaw === "bigint" ? totalStakeRaw : 0n
  const hasExistingStake = totalStake > 0n
  const isStakeSatisfied = hasStakedInSession || hasExistingStake
  const stakeReadErrorMessage =
    requiredStakeError?.message || totalStakeError?.message || ""

  const { isLoading: isStakeConfirming, isSuccess: isStakeConfirmed } = useWaitForTransactionReceipt({
    hash: stakeTxHash,
  })

  useEffect(() => {
    if (isStakeConfirmed) {
      setHasStakedInSession(true)
      setStakeError("")
      if (currentStep === 1) {
        setCurrentStep(2)
      }
    }
  }, [isStakeConfirmed, currentStep])

  const handleStakeDeposit = async () => {
    setStakeError("")
    setStepError("")

    if (!isConnected || !address) {
      setStakeError("Connect your wallet before staking.")
      return
    }
    if (requiredStake <= 0n) {
      setStakeError("Could not read MODEL_STAKE_AMOUNT from contract.")
      return
    }

    try {
      setIsStaking(true)
      const hash = await writeContractAsync({
        address: STAKE_REGISTRY_ADDRESS,
        abi: StakeRegistryABI,
        functionName: "depositModelStake",
        value: requiredStake,
      })
      setStakeTxHash(hash)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Staking transaction failed"
      setStakeError(message)
      setIsStaking(false)
    }
  }

  useEffect(() => {
    if (isStakeConfirmed) {
      setIsStaking(false)
    }
  }, [isStakeConfirmed])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, file })
    }
  }

  const handleSubmit = async () => {
    setUploadError("")
    setUploadedCid("")

    if (!isConnected || !address) {
      setUploadError("Connect your wallet before uploading.")
      return
    }
    if (!formData.name.trim()) {
      setUploadError("Model name is required.")
      return
    }
    if (!formData.file) {
      setUploadError("Please select a .onnx or .tflite file.")
      return
    }

    try {
      setIsUploading(true)
      setUploadProgress(15)

      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000"
      const body = new FormData()
      body.append("name", formData.name.trim())
      body.append("description", formData.description)
      body.append("category", formData.category || "other")
      body.append("sample_input", formData.sampleInput)
      body.append("expected_output", formData.expectedOutput)
      body.append("price", formData.price || "0")
      body.append("model_file", formData.file)

      setUploadProgress(45)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 45000)
      try {
        const response = await fetch(`${apiBase}/api/models/upload`, {
          method: "POST",
          headers: {
            "x-wallet-address": address,
          },
          body,
          signal: controller.signal,
        })

        setUploadProgress(60)

        const data = await response.json().catch(() => ({}))
        if (!response.ok) {
          throw new Error(data?.detail || data?.message || "Upload failed")
        }

        const modelId = String(data?.model_id || "")
        const cid = String(data?.ipfs_cid || "")
        if (!modelId) {
          throw new Error("Upload succeeded but model_id was missing")
        }
        if (!cid) {
          throw new Error("Upload succeeded but IPFS CID was missing")
        }

        setUploadProgress(75)
        const estimatedFees = await publicClient?.estimateFeesPerGas().catch(() => null)
        const maxPriorityFeePerGas = (() => {
          const candidate = estimatedFees?.maxPriorityFeePerGas
          if (candidate && candidate > MIN_PRIORITY_FEE_WEI) return candidate
          return MIN_PRIORITY_FEE_WEI
        })()
        const maxFeePerGas = (() => {
          const candidate = estimatedFees?.maxFeePerGas
          const minCandidate = MIN_MAX_FEE_WEI > maxPriorityFeePerGas ? MIN_MAX_FEE_WEI : (maxPriorityFeePerGas + parseGwei("2"))
          if (candidate && candidate > minCandidate) return candidate
          return minCandidate
        })()

        const registerTxHash = await writeContractAsync({
          address: MODEL_REGISTRY_ADDRESS,
          abi: ModelRegistryABI,
          functionName: "registerModel",
          args: [address, cid],
          maxPriorityFeePerGas,
          maxFeePerGas,
        })

        if (!publicClient) {
          throw new Error("Wallet client not ready")
        }

        const receipt = await publicClient.waitForTransactionReceipt({ hash: registerTxHash })
        setUploadProgress(88)

        let chainModelId: bigint | null = null
        for (const log of receipt.logs) {
          try {
            const decoded = decodeEventLog({
              abi: ModelRegistryABI,
              data: log.data,
              topics: log.topics,
            }) as { eventName: string; args?: { modelId?: bigint } }
            if (decoded.eventName === "ModelRegistered" && decoded.args?.modelId != null) {
              chainModelId = decoded.args.modelId
              break
            }
          } catch {
            // Ignore unrelated logs.
          }
        }

        if (chainModelId == null) {
          throw new Error("Model registration confirmed but ModelRegistered event was not found")
        }

        const linkPayload = JSON.stringify({
          chain_model_id: chainModelId.toString(),
          register_tx_hash: registerTxHash,
        })

        let linkResponse: Response | null = null
        let linkData: Record<string, unknown> = {}
        for (let attempt = 0; attempt < 2; attempt += 1) {
          linkResponse = await fetch(`${apiBase}/api/models/${encodeURIComponent(modelId)}/link-chain-id`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-wallet-address": address,
            },
            body: linkPayload,
          })
          linkData = await linkResponse.json().catch(() => ({})) as Record<string, unknown>
          if (linkResponse.ok) {
            break
          }
          if (attempt === 0) {
            await new Promise((resolve) => setTimeout(resolve, 700))
          }
        }
        if (!linkResponse || !linkResponse.ok) {
          throw new Error(String(linkData?.detail || linkData?.message || "Failed to link on-chain model ID"))
        }

        setUploadedCid(cid)
        setUploadProgress(100)

        setTimeout(() => {
          router.push(`/creator/models?uploaded=1&cid=${encodeURIComponent(cid)}`)
        }, 800)
      } finally {
        clearTimeout(timeoutId)
      }
    } catch (error) {
      const message =
        error instanceof DOMException && error.name === "AbortError"
          ? "Upload timed out after 45s. Please check backend/Pinata and try again."
          : error instanceof Error
          ? error.message
          : "Upload failed"
      setUploadError(message)
      setUploadProgress(0)
      setIsUploading(false)
    }
  }

  const nextStep = () => {
    setStepError("")

    if (currentStep === 1 && !isStakeSatisfied) {
      setStepError("Complete the staking step before continuing.")
      return
    }

    if (currentStep === 2) {
      if (!formData.name.trim()) {
        setStepError("Model name is required.")
        return
      }
      if (!formData.category) {
        setStepError("Select a category.")
        return
      }
    }

    if (currentStep === 3 && !formData.file) {
      setStepError("Please upload a model file to continue.")
      return
    }

    if (currentStep === 4) {
      const numericPrice = Number(formData.price)
      if (!formData.price || Number.isNaN(numericPrice) || numericPrice <= 0) {
        setStepError("Enter a valid price greater than 0.")
        return
      }
    }

    if (currentStep < 5) setCurrentStep(currentStep + 1)
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
          {/* Step 1: Staking */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold">Stake Before Upload</h2>
                <p className="text-sm text-muted-foreground">
                  Deposit the protocol-required stake before publishing models.
                </p>
              </div>

              <div className="rounded-xl border border-border/40 bg-muted/30 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <p className="font-medium">ModelVerse Stake Registry</p>
                </div>
                <p className="text-xs text-muted-foreground break-all">
                  Contract: {STAKE_REGISTRY_ADDRESS}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Required stake</span>
                  <span className="font-medium">
                    {isStakeAmountLoading
                      ? "Loading..."
                      : requiredStake > 0n
                      ? `${formatEther(requiredStake)} MATIC`
                      : "Unavailable"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Your current total stake</span>
                  <span className="font-medium">{formatEther(totalStake)} MATIC</span>
                </div>
                <div className="text-xs">
                  {isStakeSatisfied ? (
                    <span className="text-accent">Stake requirement satisfied.</span>
                  ) : (
                    <span className="text-muted-foreground">Stake is required before model submission.</span>
                  )}
                </div>
                {stakeReadErrorMessage && (
                  <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive wrap-break-word">
                    Contract read error: {stakeReadErrorMessage}
                  </div>
                )}
              </div>

              {!isStakeSatisfied && (
                <Button
                  onClick={handleStakeDeposit}
                  disabled={!isConnected || isStaking || isStakeConfirming || isStakeAmountLoading || requiredStake <= 0n}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isStaking || isStakeConfirming ? "Processing Stake..." : "Deposit Stake"}
                </Button>
              )}

              {stakeTxHash && (
                <p className="text-xs break-all text-muted-foreground">
                  Tx Hash: {stakeTxHash}
                </p>
              )}

              {stakeError && (
                <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
                  {stakeError}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Model Info */}
          {currentStep === 2 && (
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

          {/* Step 3: Upload File */}
          {currentStep === 3 && (
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

          {/* Step 4: Pricing */}
          {currentStep === 4 && (
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

          {/* Step 5: Review */}
          {currentStep === 5 && (
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
                  <p className="mt-4 font-medium">
                    {uploadedCid ? "Uploaded successfully" : "Uploading to IPFS..."}
                  </p>
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
                    {uploadedCid && (
                      <p className="mt-2 break-all text-center text-xs text-accent">
                        CID: {uploadedCid}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-xl border border-border/40 bg-muted/30 p-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Staking</p>
                        <p className="font-medium">{isStakeSatisfied ? "Completed" : "Pending"}</p>
                      </div>
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

                  {uploadError && (
                    <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
                      {uploadError}
                    </div>
                  )}
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
              {currentStep < 5 ? (
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

          {stepError && !isUploading && (
            <div className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
              {stepError}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
