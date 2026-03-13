"use client"

import { DashboardHeader } from "@/components/dashboard/header"
import { Card } from "@/components/ui/card"
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Zap,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Maximize2
} from "lucide-react"

const kpis = [
  {
    title: "Inference Volume",
    value: "45.2K",
    change: "+12.5%",
    trend: "up",
    icon: Zap,
    description: "Total requests across all models"
  },
  {
    title: "Active Users",
    value: "1,284",
    change: "+8.2%",
    trend: "up",
    icon: Users,
    description: "Unique wallets interactive"
  },
  {
    title: "Model Health",
    value: "99.9%",
    change: "0%",
    trend: "neutral",
    icon: Activity,
    description: "Average uptime of model nodes"
  },
  {
    title: "Avg Latency",
    value: "142ms",
    change: "-12ms",
    trend: "up",
    icon: BarChart3,
    description: "Time to complete inference"
  }
]

const modelUsage = [
  { name: "GPT-Vision-Pro", usage: 45, color: "bg-primary" },
  { name: "NLP-Sentiment", usage: 25, color: "bg-accent" },
  { name: "Image-Classifier", usage: 15, color: "bg-chart-3" },
  { name: "Other", usage: 15, color: "bg-chart-4" }
]

export default function CreatorAnalyticsPage() {
  return (
    <div className="min-h-screen">
      <DashboardHeader 
        title="Analytics" 
        subtitle="Deep dive into your AI model performance and audience"
      />
      
      <div className="p-6 space-y-6">
        {/* KPI Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <Card key={kpi.title} className="border-border/40 bg-card/30 p-6">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <kpi.icon className="h-5 w-5 text-primary" />
                </div>
                <div className={`flex items-center text-xs font-medium ${
                  kpi.trend === 'up' ? 'text-accent' : kpi.trend === 'down' ? 'text-destructive' : 'text-muted-foreground'
                }`}>
                  {kpi.change}
                  {kpi.trend === 'up' ? <ArrowUpRight className="ml-0.5 h-3 w-3" /> : kpi.trend === 'down' ? <ArrowDownRight className="ml-0.5 h-3 w-3" /> : null}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">{kpi.title}</p>
                <p className="text-2xl font-bold">{kpi.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{kpi.description}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Chart */}
          <Card className="lg:col-span-2 border-border/40 bg-card/30 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold">Usage Trends</h3>
                <p className="text-sm text-muted-foreground">Inference requests over the last 30 days</p>
              </div>
              <button className="rounded-lg p-2 hover:bg-muted/50 transition-colors">
                <Maximize2 className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            
            <div className="relative h-72 w-full">
              <svg className="h-full w-full" viewBox="0 0 800 240" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="usageGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgb(139 92 246)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="rgb(139 92 246)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Grid Lines */}
                {[0, 60, 120, 180, 240].map((y) => (
                  <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                ))}
                {/* Area Path */}
                <path
                  d="M0,200 C50,190 100,140 150,160 C200,180 250,100 300,120 C350,140 400,80 450,100 C500,120 550,60 600,80 C650,100 700,40 750,60 C800,80 800,240 0,240 Z"
                  fill="url(#usageGradient)"
                />
                {/* Line Path */}
                <path
                  d="M0,200 C50,190 100,140 150,160 C200,180 250,100 300,120 C350,140 400,80 450,100 C500,120 550,60 600,80 C650,100 700,40 750,60 C800,80"
                  fill="none"
                  stroke="rgb(139 92 246)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              <div className="mt-4 flex justify-between text-xs text-muted-foreground">
                <span>Feb 12</span>
                <span>Feb 19</span>
                <span>Feb 26</span>
                <span>Mar 05</span>
                <span>Mar 12</span>
              </div>
            </div>
          </Card>

          {/* Model Distribution */}
          <Card className="border-border/40 bg-card/30 p-6">
            <h3 className="text-lg font-semibold mb-6">Usage Distribution</h3>
            <div className="space-y-6">
              {modelUsage.map((model) => (
                <div key={model.name}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{model.name}</span>
                    <span className="text-sm text-muted-foreground">{model.usage}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div 
                      className={`h-full ${model.color} transition-all duration-1000`}
                      style={{ width: `${model.usage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-6 border-t border-border/40">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Top Performer</span>
                  <span className="text-sm font-semibold text-accent">GPT-Vision-Pro</span>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                  <TrendingUp className="h-5 w-5 text-accent" />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Geographic Insights Placeholder */}
        <Card className="border-border/40 bg-card/30 p-8 flex flex-col items-center justify-center text-center">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold">Audience Insights</h3>
          <p className="max-w-md mt-2 text-muted-foreground">
            We're collecting geographic and demographic data for your model users. This data will be available once you reach 5,000 lifetime inferences.
          </p>
          <div className="mt-6 h-2 w-full max-w-sm rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-primary" style={{ width: '65%' }} />
          </div>
          <span className="mt-2 text-xs text-muted-foreground">3,250 / 5,000 Inferences</span>
        </Card>
      </div>
    </div>
  )
}
