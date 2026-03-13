"use client"

import Link from "next/link"
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
  Star,
  Package
} from "lucide-react"

const models = [
  {
    id: 1,
    name: "GPT-Vision-Pro",
    category: "Image Recognition",
    status: "active",
    jobs: 456,
    earnings: "8.2 MATIC",
    rating: 4.9,
    createdAt: "2026-01-15"
  },
  {
    id: 2,
    name: "NLP-Sentiment",
    category: "Natural Language Processing",
    status: "active",
    jobs: 312,
    earnings: "5.4 MATIC",
    rating: 4.7,
    createdAt: "2026-02-01"
  },
  {
    id: 3,
    name: "Image-Classifier",
    category: "Image Recognition",
    status: "active",
    jobs: 289,
    earnings: "4.8 MATIC",
    rating: 4.8,
    createdAt: "2026-02-10"
  },
  {
    id: 4,
    name: "Credit-Score-AI",
    category: "Credit Scoring",
    status: "paused",
    jobs: 187,
    earnings: "3.2 MATIC",
    rating: 4.6,
    createdAt: "2026-02-20"
  },
  {
    id: 5,
    name: "Voice-Analysis",
    category: "Voice Analysis",
    status: "active",
    jobs: 145,
    earnings: "2.1 MATIC",
    rating: 4.5,
    createdAt: "2026-03-01"
  },
  {
    id: 6,
    name: "Text-Summarizer",
    category: "Natural Language Processing",
    status: "active",
    jobs: 98,
    earnings: "1.4 MATIC",
    rating: 4.3,
    createdAt: "2026-03-05"
  }
]

export default function MyModelsPage() {
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
          {models.map((model) => (
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

              {/* Stats */}
              <div className="mt-4 grid grid-cols-3 gap-4 border-t border-border/40 pt-4">
                <div>
                  <p className="text-xs text-muted-foreground">Jobs</p>
                  <p className="font-semibold">{model.jobs}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Earned</p>
                  <p className="font-semibold text-accent">{model.earnings}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Rating</p>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-chart-4 text-chart-4" />
                    <span className="font-semibold">{model.rating}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex items-center gap-2">
                <Button variant="outline" size="sm" className="flex-1 border-border/60">
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </Button>
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
      </div>
    </div>
  )
}
