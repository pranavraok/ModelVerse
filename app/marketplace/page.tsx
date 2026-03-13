"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/landing/header"
import { Search, Star, Play, Package } from "lucide-react"
import { useAccount } from "wagmi"
import { fetchModels, shortWallet, type MarketplaceModel } from "@/lib/model-api"

const categories = [
// ... (rest of categories)
  { value: "all", label: "All Categories" },
  { value: "image-recognition", label: "Image Recognition" },
  { value: "nlp", label: "Natural Language Processing" },
  { value: "credit-scoring", label: "Credit Scoring" },
  { value: "voice-analysis", label: "Voice Analysis" },
  { value: "other", label: "Other" }
]

const sortOptions = [
  { value: "popular", label: "Most Popular" },
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" }
]

export default function MarketplacePage() {
  const { address } = useAccount()
  const [searchQuery, setSearchQuery] = useState("")
  const [category, setCategory] = useState("all")
  const [sortBy, setSortBy] = useState("popular")
  const [userRole, setUserRole] = useState<string | null>(null)
  const [models, setModels] = useState<MarketplaceModel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState("")

  useEffect(() => {
    // Priority: queryParam > localStorage
    const params = new URLSearchParams(window.location.search)
    const paramRole = params.get('role')
    const localRole = localStorage.getItem('userRole')
    
    const finalRole = paramRole || localRole
    if (finalRole) {
      setUserRole(finalRole)
      if (!localRole) localStorage.setItem('userRole', finalRole)
    }
  }, [])

  useEffect(() => {
    let ignore = false

    const loadModels = async () => {
      try {
        setIsLoading(true)
        setLoadError("")
        const items = await fetchModels({ wallet: address, category, limit: 200 })
        if (!ignore) {
          setModels(items)
        }
      } catch (error) {
        if (!ignore) {
          setLoadError(error instanceof Error ? error.message : "Failed to load marketplace models")
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    void loadModels()
    return () => {
      ignore = true
    }
  }, [address, category])

  const filteredModels = useMemo(() => {
    const normalizedQuery = searchQuery.toLowerCase().trim()
    const searched = models.filter((model) => {
      if (!normalizedQuery) return true
      return (
        model.name.toLowerCase().includes(normalizedQuery) ||
        model.description.toLowerCase().includes(normalizedQuery)
      )
    })

    const sorted = [...searched]
    if (sortBy === "price-low") sorted.sort((a, b) => a.price - b.price)
    if (sortBy === "price-high") sorted.sort((a, b) => b.price - a.price)
    if (sortBy === "rating") sorted.sort((a, b) => b.rating - a.rating)
    if (sortBy === "newest") {
      sorted.sort((a, b) => {
        const aTs = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const bTs = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return bTs - aTs
      })
    }
    if (sortBy === "popular" || sortBy === "trending") sorted.sort((a, b) => b.jobs - a.jobs)
    return sorted
  }, [models, searchQuery, sortBy])

  const featuredModels = useMemo(
    () => [...filteredModels].sort((a, b) => b.jobs - a.jobs).slice(0, 4),
    [filteredModels]
  )

  const content = (
    <main className={userRole ? "py-10" : "pt-28 pb-20"}>
      <div className="mx-auto max-w-7xl px-8 lg:px-12">
        {/* Header & Search */}
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h1 className="text-4xl font-semibold tracking-tight text-white">Marketplace</h1>
            <p className="text-[10px] font-semibold text-muted-foreground/70 capitalize tracking-normal">Discover and deploy neural assets</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative w-full md:w-80 lg:w-[450px] group">
              <div className="absolute -inset-1 bg-primary/10 blur-xl opacity-0 group-focus-within:opacity-100 transition-all rounded-2xl" />
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-white transition-colors" />
              <Input
                placeholder="Search for a model..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/5 pl-12 border-white/[0.05] transition-all focus-visible:ring-primary/20 focus-visible:border-primary/40 rounded-2xl h-11 text-sm font-medium tracking-tight"
              />
            </div>
          </div>
        </div>

        {/* Horizontal Tabs */}
        <div className="mb-8 flex space-x-10 border-b border-white/[0.03] overflow-x-auto pb-px [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {categories.slice(0, 6).map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`whitespace-nowrap pb-4 text-xs font-semibold capitalize tracking-[0.15em] transition-all relative ${
                category === cat.value
                  ? "text-primary"
                  : "text-muted-foreground/40 hover:text-white"
              }`}
            >
              {cat.label}
              {category === cat.value && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-t-full shadow-sm" />
              )}
            </button>
          ))}
        </div>

        {/* Featured Models Row */}
        <div className="mb-12 flex gap-6 overflow-x-auto pb-6 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {featuredModels.map(model => (
            <div key={model.id} className="group relative min-w-[340px] flex-1 cursor-pointer glass-card p-6 transition-all duration-500 hover:translate-y-[-4px] snap-start border-white/[0.05]">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-all duration-500">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg tracking-tight text-white/95">{model.name}</h3>
                  <span className="text-[10px] font-semibold text-primary/60">{model.category}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground/70 leading-relaxed font-medium line-clamp-2">{model.description}</p>
            </div>
          ))}
        </div>

        {/* Action Chips & Sort */}
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            {[
              { id: 'popular', label: '🏆 Popular' },
              { id: 'trending', label: '🔥 Trending' },
              { id: 'rating', label: '⭐ Highest Rated' },
              { id: 'newest', label: '✨ Newest' },
            ].map(chip => (
              <button
                key={chip.id}
                onClick={() => setSortBy(chip.id)}
                className={`rounded-xl border px-5 py-2.5 text-[11px] font-semibold capitalize tracking-normalr transition-all duration-500 ${
                  sortBy === chip.id
                    ? "border-primary/40 bg-primary/10 text-primary shadow-[0_0_15px_rgba(139,92,246,0.1)]"
                    : "border-white/[0.03] bg-white/[0.02] text-muted-foreground/60 hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[200px] h-11 bg-white/[0.02] border-white/[0.03] rounded-xl font-semibold text-[11px] text-muted-foreground focus:ring-primary/20">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent className="glass-card border-white/[0.05]">
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value} className="text-xs font-semibold capitalize tracking-normalr rounded-lg focus:bg-primary/10">
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Data Table */}
        <div className="glass-card overflow-hidden border-white/[0.05]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="border-b border-white/[0.03] text-[10px] font-semibold capitalize tracking-normal text-muted-foreground/70 bg-white/[0.02]">
                <tr>
                  <th className="px-8 py-5">#</th>
                  <th className="px-8 py-5">Model</th>
                  <th className="px-8 py-5">Price</th>
                  <th className="px-8 py-5">Rating</th>
                  <th className="px-8 py-5">Jobs</th>
                  <th className="px-8 py-5">Creator</th>
                  <th className="px-8 py-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {filteredModels.map((model, idx) => (
                  <tr key={model.id} className="group transition-all duration-500 hover:bg-white/[0.02] cursor-pointer">
                    <td className="px-8 py-6 font-semibold text-muted-foreground/30">{idx + 1}</td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/[0.03] group-hover:bg-primary/10 group-hover:border-primary/20 transition-all duration-500">
                          <Package className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <div>
                          <div className="font-semibold text-[15px] text-white/90 group-hover:text-white tracking-tight transition-colors">{model.name}</div>
                          <div className="text-[10px] text-muted-foreground/30 capitalize font-semibold tracking-normal mt-1.5">{model.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 font-semibold text-white/90 tracking-tight">{model.price} MATIC</td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-1.5 text-emerald-500 font-semibold">
                        <Star className="h-4 w-4 fill-emerald-500 text-emerald-500" />
                        {model.rating}
                      </div>
                    </td>
                    <td className="px-8 py-6 font-semibold text-muted-foreground/80">{model.jobs.toLocaleString()}</td>
                    <td className="px-8 py-6 text-muted-foreground/40 font-mono text-xs capitalize tracking-tight">{shortWallet(model.creatorWallet)}</td>
                    <td className="px-8 py-6 text-right">
                      <div className="relative flex items-center justify-end h-8 overflow-hidden sm:overflow-visible">
                        {/* Static Age - hidden on row hover */}
                        <span className="text-[11px] font-semibold text-muted-foreground/20 group-hover:-translate-x-full group-hover:opacity-0 transition-all duration-500 absolute right-0">
                          {idx % 2 === 0 ? '6M' : '1Y'}
                        </span>
                        
                        {/* Actions - visible on row hover */}
                        <div className="flex items-center justify-end gap-3 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 absolute right-0">
                          <Link href={`/marketplace/${model.id}`}>
                            <Button variant="ghost" size="sm" className="h-9 hover:bg-white/5 rounded-xl text-xs font-semibold text-muted-foreground hover:text-white px-4">Details</Button>
                          </Link>
                          <Link href={`/marketplace/${model.id}/run`}>
                            <Button size="sm" className="h-9 bg-primary/10 text-primary hover:bg-primary hover:text-white font-semibold text-[11px] capitalize tracking-[0.15em] px-6 rounded-xl shadow-[0_0_15px_rgba(139,92,246,0.1)] transition-all">
                              Run
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {isLoading && (
          <div className="py-24 text-center">
            <p className="text-sm font-medium text-muted-foreground/60">Loading marketplace models...</p>
          </div>
        )}

        {loadError && !isLoading && (
          <div className="py-24 text-center">
            <h3 className="text-xl font-semibold tracking-tight text-white/90 mb-3">Could not load models</h3>
            <p className="text-sm text-muted-foreground/60 font-medium">{loadError}</p>
          </div>
        )}

        {!isLoading && !loadError && filteredModels.length === 0 && (
          <div className="py-32 text-center">
            <h3 className="text-xl font-semibold tracking-tight text-white/90 mb-3">No neural models found</h3>
            <p className="text-sm text-muted-foreground/50 font-medium">Refine your search parameters or select a different category.</p>
          </div>
        )}
      </div>
    </main>
  )

  if (userRole) {
    return (
      <div className="min-h-screen bg-[#030303] bg-mesh relative overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="aurora-1" />
          <div className="aurora-2" />
        </div>
        <div className="relative z-10 flex">
          <DashboardSidebar role={userRole as any} />
          <div className="flex-1 pl-80 transition-all duration-500">
            {content}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#030303]">
      <Header />
      {content}
    </div>
  )
}