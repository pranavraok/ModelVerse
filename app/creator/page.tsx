"use client"

import { DashboardHeader } from "@/components/dashboard/header"
import { Card } from "@/components/ui/card"
import { RegisterModelForm } from "@/components/RegisterModelForm"
import { 
  Package, 
  Play, 
  Wallet, 
  Star,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"

const stats = [
  {
    title: "Total Models",
    value: "12",
    change: "+2",
    trend: "up",
    icon: Package,
    color: "from-primary/20 to-primary/5"
  },
  {
    title: "Inference Requests",
    value: "1,847",
    change: "+12.5%",
    trend: "up",
    icon: Play,
    color: "from-accent/20 to-accent/5"
  },
  {
    title: "Total Earnings",
    value: "24.5 MATIC",
    change: "+8.3%",
    trend: "up",
    icon: Wallet,
    color: "from-chart-3/20 to-chart-3/5"
  },
  {
    title: "Avg Rating",
    value: "4.8",
    change: "-0.1",
    trend: "down",
    icon: Star,
    color: "from-chart-4/20 to-chart-4/5"
  }
]

const recentActivity = [
  {
    id: 1,
    type: "inference",
    model: "GPT-Vision-Pro",
    user: "0x8912...3456",
    amount: "0.05 MATIC",
    status: "completed",
    time: "2 min ago"
  },
  {
    id: 2,
    type: "inference",
    model: "NLP-Sentiment",
    user: "0x2345...6789",
    amount: "0.03 MATIC",
    status: "completed",
    time: "15 min ago"
  },
  {
    id: 3,
    type: "inference",
    model: "Image-Classifier",
    user: "0x5678...9012",
    amount: "0.08 MATIC",
    status: "running",
    time: "23 min ago"
  },
  {
    id: 4,
    type: "payment",
    model: "Credit-Score-AI",
    user: "0x9012...3456",
    amount: "0.12 MATIC",
    status: "completed",
    time: "1 hour ago"
  },
  {
    id: 5,
    type: "inference",
    model: "Voice-Analysis",
    user: "0x3456...7890",
    amount: "0.06 MATIC",
    status: "completed",
    time: "2 hours ago"
  }
]

const topModels = [
  { name: "GPT-Vision-Pro", jobs: 456, earnings: "8.2 MATIC", rating: 4.9 },
  { name: "NLP-Sentiment", jobs: 312, earnings: "5.4 MATIC", rating: 4.7 },
  { name: "Image-Classifier", jobs: 289, earnings: "4.8 MATIC", rating: 4.8 },
  { name: "Credit-Score-AI", jobs: 187, earnings: "3.2 MATIC", rating: 4.6 }
]

export default function CreatorDashboard() {
  return (
    <div className="min-h-screen">
      <DashboardHeader 
        title="Dashboard" 
        subtitle="Overview of your AI models and earnings"
      />
      
      <div className="p-6">
        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="relative overflow-hidden border-border/40 bg-card/30 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="mt-2 text-2xl font-bold">{stat.value}</p>
                  <div className={`mt-1 flex items-center text-xs ${
                    stat.trend === 'up' ? 'text-accent' : 'text-destructive'
                  }`}>
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="mr-0.5 h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="mr-0.5 h-3 w-3" />
                    )}
                    {stat.change}
                  </div>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Recent Activity */}
          <Card className="border-border/40 bg-card/30 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Recent Activity</h2>
              <button className="text-sm text-primary hover:text-primary/90">View all</button>
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    activity.status === 'completed' 
                      ? 'bg-accent/20' 
                      : activity.status === 'running'
                      ? 'bg-primary/20'
                      : 'bg-muted/20'
                  }`}>
                    {activity.type === 'inference' ? (
                      <Play className={`h-4 w-4 ${
                        activity.status === 'running' ? 'text-primary animate-pulse' : 'text-accent'
                      }`} />
                    ) : (
                      <Wallet className="h-4 w-4 text-accent" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.model}</p>
                    <p className="text-xs text-muted-foreground">{activity.user}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-accent">{activity.amount}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Top Models */}
          <Card className="border-border/40 bg-card/30 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Top Performing Models</h2>
              <button className="text-sm text-primary hover:text-primary/90">View all</button>
            </div>
            <div className="space-y-4">
              {topModels.map((model, index) => (
                <div key={model.name} className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                    #{index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{model.name}</p>
                    <p className="text-xs text-muted-foreground">{model.jobs} jobs completed</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{model.earnings}</p>
                    <div className="flex items-center justify-end gap-1">
                      <Star className="h-3 w-3 text-chart-4 fill-chart-4" />
                      <span className="text-xs text-muted-foreground">{model.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Performance Chart */}
        <Card className="mt-6 border-border/40 bg-card/30 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold">Earnings Overview</h2>
              <p className="text-sm text-muted-foreground">Your earnings over the last 30 days</p>
            </div>
            <div className="flex gap-2">
              {['7D', '30D', '90D'].map((period) => (
                <button
                  key={period}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    period === '30D'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          
          {/* Chart visualization */}
          <div className="relative h-64">
            <svg className="h-full w-full" viewBox="0 0 800 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(139 92 246)" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="rgb(139 92 246)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0,150 C50,140 100,100 150,120 C200,140 250,80 300,90 C350,100 400,60 450,70 C500,80 550,40 600,50 C650,60 700,30 750,40 C800,50 800,40 800,40 L800,200 L0,200 Z"
                fill="url(#earningsGradient)"
              />
              <path
                d="M0,150 C50,140 100,100 150,120 C200,140 250,80 300,90 C350,100 400,60 450,70 C500,80 550,40 600,50 C650,60 700,30 750,40 C800,50 800,40 800,40"
                fill="none"
                stroke="rgb(139 92 246)"
                strokeWidth="2"
              />
            </svg>
            
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-muted-foreground">
              <span>3 MATIC</span>
              <span>2 MATIC</span>
              <span>1 MATIC</span>
              <span>0 MATIC</span>
            </div>
            
            {/* Trend indicator */}
            <div className="absolute top-4 right-4 flex items-center gap-2 rounded-lg bg-accent/10 px-3 py-1.5">
              <TrendingUp className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-accent">+24.5%</span>
            </div>
          </div>
        </Card>

        {/* Register Model Form Section */}
        <div className="mt-8">
          <RegisterModelForm />
        </div>
      </div>
    </div>
  )
}
