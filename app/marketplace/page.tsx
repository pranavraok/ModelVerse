"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Header } from "@/components/landing/header"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { 
  Search, 
  Filter,
  Star,
  Play,
  Package,
  ArrowUpDown,
  X
} from "lucide-react"
import { useEffect } from "react"

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

const models = [
  {
    id: 1,
    name: "GPT-Vision-Pro",
    description: "Advanced image recognition and analysis model with high accuracy for object detection.",
    category: "Image Recognition",
    creator: "0x8912...3456",
    price: 0.05,
    rating: 4.9,
    jobs: 1247,
    featured: true
  },
  {
    id: 2,
    name: "NLP-Sentiment-v3",
    description: "State-of-the-art sentiment analysis for text data with multi-language support.",
    category: "Natural Language Processing",
    creator: "0x2345...6789",
    price: 0.03,
    rating: 4.7,
    jobs: 892,
    featured: false
  },
  {
    id: 3,
    name: "Credit-Score-AI",
    description: "ML-based credit scoring model trained on diverse financial datasets.",
    category: "Credit Scoring",
    creator: "0x5678...9012",
    price: 0.12,
    rating: 4.8,
    jobs: 567,
    featured: true
  },
  {
    id: 4,
    name: "Voice-Transcriber",
    description: "High-accuracy speech-to-text with support for 50+ languages.",
    category: "Voice Analysis",
    creator: "0x9012...3456",
    price: 0.08,
    rating: 4.6,
    jobs: 432,
    featured: false
  },
  {
    id: 5,
    name: "Image-Classifier-Pro",
    description: "Multi-class image classification with custom category support.",
    category: "Image Recognition",
    creator: "0x3456...7890",
    price: 0.06,
    rating: 4.5,
    jobs: 389,
    featured: false
  },
  {
    id: 6,
    name: "Text-Summarizer",
    description: "Intelligent text summarization with adjustable compression ratios.",
    category: "Natural Language Processing",
    creator: "0x7890...1234",
    price: 0.04,
    rating: 4.4,
    jobs: 278,
    featured: false
  },
  {
    id: 7,
    name: "Fraud-Detector",
    description: "Real-time fraud detection for financial transactions.",
    category: "Credit Scoring",
    creator: "0x4567...8901",
    price: 0.15,
    rating: 4.9,
    jobs: 654,
    featured: true
  },
  {
    id: 8,
    name: "Emotion-Analyzer",
    description: "Detect emotions from voice recordings with high precision.",
    category: "Voice Analysis",
    creator: "0x6789...0123",
    price: 0.07,
    rating: 4.3,
    jobs: 198,
    featured: false
  }
]

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [category, setCategory] = useState("all")
  const [sortBy, setSortBy] = useState("popular")
  const [priceRange, setPriceRange] = useState([0, 0.2])
  const [showFilters, setShowFilters] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    const role = localStorage.getItem('userRole')
    setUserRole(role)
  }, [])

  const filteredModels = models.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         model.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = category === "all" || model.category.toLowerCase().includes(category.replace("-", " "))
    const matchesPrice = model.price >= priceRange[0] && model.price <= priceRange[1]
    return matchesSearch && matchesCategory && matchesPrice
  })

  const content = (
    <main className={userRole ? "py-8" : "pt-24 pb-16"}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">AI Model Marketplace</h1>
          <p className="mt-2 text-muted-foreground">
            Discover and run AI models powered by decentralized infrastructure
          </p>
        </div>

        {/* ... (rest of the content components) ... */}
        {/* Search & Filters */}
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search models..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-input/50 pl-9"
              />
            </div>
            <Button
              variant="outline"
              className="border-border/60 lg:hidden"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-48 bg-input/50">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48 bg-input/50">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Mobile Filters */}
        {showFilters && (
          <Card className="mb-6 border-border/40 bg-card/30 p-4 lg:hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Filters</h3>
              <button onClick={() => setShowFilters(false)}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-input/50">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div>
                <label className="text-sm text-muted-foreground">
                  Price Range: {priceRange[0]} - {priceRange[1]} MATIC
                </label>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={0.2}
                  step={0.01}
                  className="mt-2"
                />
              </div>
            </div>
          </Card>
        )}

        {/* Results Count */}
        <p className="mb-4 text-sm text-muted-foreground">
          Showing {filteredModels.length} models
        </p>

        {/* Models Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredModels.map((model) => (
            <Card 
              key={model.id} 
              className="group relative border-border/40 bg-card/30 p-6 transition-all hover:border-primary/40 hover:bg-card/50"
            >
              {model.featured && (
                <div className="absolute top-4 right-4 rounded-full bg-primary/20 px-2 py-1 text-xs font-medium text-primary">
                  Featured
                </div>
              )}

              {/* Model Icon */}
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Package className="h-6 w-6 text-primary" />
              </div>

              {/* Model Info */}
              <h3 className="text-lg font-semibold">{model.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{model.category}</p>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                {model.description}
              </p>

              {/* Creator & Stats */}
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>by {model.creator}</span>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-chart-4 text-chart-4" />
                  {model.rating}
                </div>
              </div>

              {/* Price & Actions */}
              <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-4">
                <div>
                  <p className="text-lg font-bold text-primary">{model.price} MATIC</p>
                  <p className="text-xs text-muted-foreground">{model.jobs} jobs</p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/marketplace/${model.id}`}>
                    <Button variant="outline" size="sm" className="border-border/60">
                      Details
                    </Button>
                  </Link>
                  <Link href={`/marketplace/${model.id}/run`}>
                    <Button size="sm" className="bg-primary hover:bg-primary/90">
                      <Play className="mr-1 h-3 w-3" />
                      Run
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </main>
  )

  if (userRole) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardSidebar role={userRole as 'creator' | 'buyer'} />
        <div className="pl-64">
          {content}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {content}
    </div>
  )
}
