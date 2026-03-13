"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Header } from "@/components/landing/header"
import { ArrowLeft, Package, Play, Star, Copy, Check } from "lucide-react"
import { fetchModelById, shortWallet, type MarketplaceModel } from "@/lib/model-api"
import { useAccount } from "wagmi"

export default function ModelDetailPage() {
  const params = useParams<{ id: string }>()
  const { address } = useAccount()
  const [model, setModel] = useState<MarketplaceModel | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [copiedCid, setCopiedCid] = useState(false)

  useEffect(() => {
    let ignore = false

    const loadModel = async () => {
      if (!params?.id) return

      try {
        setIsLoading(true)
        setLoadError("")
        const item = await fetchModelById(params.id, address)
        if (!ignore) {
          setModel(item)
        }
      } catch (error) {
        if (!ignore) {
          setLoadError(error instanceof Error ? error.message : "Failed to load model")
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    void loadModel()
    return () => {
      ignore = true
    }
  }, [params?.id, address])

  const handleCopyCid = async () => {
    if (!model?.ipfsCid) return
    await navigator.clipboard.writeText(model.ipfsCid)
    setCopiedCid(true)
    setTimeout(() => setCopiedCid(false), 1500)
  }

  return (
    <div className="min-h-screen bg-[#030303] bg-mesh relative overflow-hidden">
      <Header />

      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="aurora-1" />
        <div className="aurora-2" />
      </div>

      <main className="relative z-10 pt-28 pb-20">
        <div className="mx-auto max-w-6xl px-8 lg:px-12">
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-3 text-[10px] font-semibold capitalize tracking-normal text-muted-foreground/40 hover:text-white transition-all mb-10 group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Marketplace
          </Link>

          {isLoading && (
            <Card className="glass-card border-white/[0.05] p-10">
              <p className="text-sm text-muted-foreground/60">Loading model details...</p>
            </Card>
          )}

          {loadError && !isLoading && (
            <Card className="glass-card border-white/[0.05] p-10">
              <h2 className="text-xl font-semibold text-white/90">Could not load this model</h2>
              <p className="mt-2 text-sm text-muted-foreground/60">{loadError}</p>
            </Card>
          )}

          {!isLoading && !loadError && !model && (
            <Card className="glass-card border-white/[0.05] p-10">
              <h2 className="text-xl font-semibold text-white/90">Model not found</h2>
              <p className="mt-2 text-sm text-muted-foreground/60">This model may have been removed or the id is invalid.</p>
            </Card>
          )}

          {!isLoading && !loadError && model && (
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Card className="glass-card border-white/[0.05] p-10">
                  <div className="flex items-start gap-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
                      <Package className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h1 className="text-3xl font-semibold tracking-tight text-white">{model.name}</h1>
                      <p className="mt-2 text-xs text-muted-foreground/50">by {shortWallet(model.creatorWallet)}</p>
                      <div className="mt-4 flex items-center gap-4">
                        <span className="rounded-xl bg-primary/10 border border-primary/20 px-3 py-1 text-[10px] font-semibold text-primary">
                          {model.category}
                        </span>
                        <span className="inline-flex items-center gap-1 text-sm text-emerald-500 font-semibold">
                          <Star className="h-4 w-4 fill-emerald-500 text-emerald-500" />
                          {model.rating.toFixed(1)}
                        </span>
                        <span className="text-sm text-muted-foreground/60">{model.jobs} jobs</span>
                      </div>
                    </div>
                  </div>

                  <p className="mt-8 text-sm leading-relaxed text-muted-foreground/80">
                    {model.description || "No description provided for this model."}
                  </p>

                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
                      <p className="text-xs text-muted-foreground/50">Creator Wallet</p>
                      <p className="mt-1 text-sm text-white/90 break-all">{model.creatorWallet || "-"}</p>
                    </div>
                    <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
                      <p className="text-xs text-muted-foreground/50">Chain Model ID</p>
                      <p className="mt-1 text-sm text-white/90">{model.chainModelId || 0}</p>
                    </div>
                    <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
                      <p className="text-xs text-muted-foreground/50">Trust Score</p>
                      <p className="mt-1 text-sm text-white/90">{(model.trustScore ?? 0).toFixed(2)}</p>
                    </div>
                    <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
                      <p className="text-xs text-muted-foreground/50">Status</p>
                      <p className="mt-1 text-sm text-white/90 capitalize">{model.status || "active"}</p>
                    </div>
                  </div>

                  <div className="mt-6 rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-xs text-muted-foreground/50">IPFS CID</p>
                      <Button variant="ghost" size="sm" onClick={handleCopyCid} className="h-7 px-2 text-xs">
                        {copiedCid ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                    <p className="mt-1 text-sm text-white/90 break-all">{model.ipfsCid || "-"}</p>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
                      <p className="text-xs text-muted-foreground/50">Created At</p>
                      <p className="mt-1 text-sm text-white/90">{model.createdAt ? new Date(model.createdAt).toLocaleString() : "-"}</p>
                    </div>
                    <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
                      <p className="text-xs text-muted-foreground/50">Updated At</p>
                      <p className="mt-1 text-sm text-white/90">{model.updatedAt ? new Date(model.updatedAt).toLocaleString() : "-"}</p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-white/[0.05] bg-black/30 p-4">
                      <p className="text-xs text-muted-foreground/50 mb-2">Sample Input</p>
                      <pre className="text-xs text-white/85 whitespace-pre-wrap break-words">{model.sampleInput || "-"}</pre>
                    </div>
                    <div className="rounded-xl border border-white/[0.05] bg-black/30 p-4">
                      <p className="text-xs text-muted-foreground/50 mb-2">Expected Output</p>
                      <pre className="text-xs text-white/85 whitespace-pre-wrap break-words">{model.expectedOutput || "-"}</pre>
                    </div>
                  </div>
                </Card>
              </div>

              <div>
                <Card className="glass-card border-white/[0.05] p-8 sticky top-28">
                  <p className="text-xs font-semibold text-muted-foreground/40">Inference Price</p>
                  <p className="mt-3 text-4xl font-semibold text-white tracking-tight">{model.price}</p>
                  <p className="text-sm text-primary mt-1">MATIC</p>

                  <div className="mt-8 border-t border-white/[0.05] pt-6 space-y-3">
                    <p className="text-xs text-muted-foreground/50">Model ID: {model.id}</p>
                    <p className="text-xs text-muted-foreground/50">Creator: {shortWallet(model.creatorWallet)}</p>
                  </div>

                  <Link href={`/marketplace/${model.id}/run`}>
                    <Button className="mt-8 w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold">
                      <Play className="mr-2 h-4 w-4" />
                      Run Inference
                    </Button>
                  </Link>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
