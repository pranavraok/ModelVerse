"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useAccount } from "wagmi"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Plus, 
  Search,
  MoreVertical,
  Eye,
  Edit,
  Pause,
  Play,
  Trash2,
  Package
} from "lucide-react"
import { fetchModels, shortWallet, walletMatches, type MarketplaceModel } from "@/lib/model-api"

export default function MyModelsPage() {
  const { address } = useAccount()
  const [query, setQuery] = useState("")
  const [models, setModels] = useState<MarketplaceModel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState("")

  useEffect(() => {
    let ignore = false

    const loadCreatorModels = async () => {
      if (!address) {
        setModels([])
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setLoadError("")
        const all = await fetchModels({ wallet: address, limit: 200, mine: true })
        if (!ignore) {
          setModels(all.filter((model) => walletMatches(model.creatorWallet, address)))
        }
      } catch (error) {
        if (!ignore) {
          setLoadError(error instanceof Error ? error.message : "Failed to load your models")
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    void loadCreatorModels()
    return () => {
      ignore = true
    }
  }, [address])

  const visibleModels = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return models
    return models.filter(
      (model) =>
        model.name.toLowerCase().includes(q) ||
        model.category.toLowerCase().includes(q) ||
        model.description.toLowerCase().includes(q)
    )
  }, [models, query])

  return (
    <div className="min-h-screen">
      <DashboardHeader 
        title="My Models" 
        subtitle="Manage your uploaded AI models"
      />
      
      <div className="p-6">
        {/* Actions Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search models..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-input/50 pl-9"
            />
          </div>
          <Link href="/creator/upload">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Upload New Model
            </Button>
          </Link>
        </div>

        {/* Models Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleModels.map((model) => (
            <Card key={model.id} className="group relative border-border/40 bg-card/30 p-6 transition-all hover:border-primary/40 hover:bg-card/50">
              {/* Status Badge */}
              <div className={`absolute top-4 right-4 rounded-full px-2 py-1 text-xs font-medium ${
                model.status === 'active'
                  ? 'bg-accent/20 text-accent'
                  : 'bg-muted/50 text-muted-foreground'
              }`}>
                {model.status === 'active' ? 'Active' : 'Paused'}
              </div>

              {/* Model Icon */}
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Package className="h-6 w-6 text-primary" />
              </div>

              {/* Model Info */}
              <h3 className="text-lg font-semibold">{model.name}</h3>
              <p className="text-sm text-muted-foreground">{model.category}</p>
              <p className="mt-1 text-xs text-muted-foreground">Creator: {shortWallet(model.creatorWallet)}</p>

              {/* Stats */}
              <div className="mt-4 grid grid-cols-3 gap-4 border-t border-border/40 pt-4">
                <div>
                  <p className="text-xs text-muted-foreground">Jobs</p>
                  <p className="font-semibold">{model.jobs}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Price</p>
                  <p className="font-semibold text-accent">{model.price} MATIC</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="font-semibold capitalize">{model.status || "active"}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex items-center gap-2">
                <Link href={`/marketplace/${model.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full border-border/60">
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="border-border/60">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="cursor-pointer">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      {model.status === 'active' ? (
                        <>
                          <Pause className="mr-2 h-4 w-4" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          Resume
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          ))}
        </div>

        {isLoading && (
          <div className="py-16 text-center text-sm text-muted-foreground">Loading your models...</div>
        )}

        {loadError && !isLoading && (
          <div className="py-16 text-center text-sm text-destructive">{loadError}</div>
        )}

        {!isLoading && !loadError && !address && (
          <div className="py-16 text-center text-sm text-muted-foreground">Connect your wallet to view your uploaded models.</div>
        )}

        {!isLoading && !loadError && address && visibleModels.length === 0 && (
          <div className="py-16 text-center text-sm text-muted-foreground">No uploaded models found for this wallet.</div>
        )}
      </div>
    </div>
  )
}
