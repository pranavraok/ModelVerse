"use client"

import { DashboardHeader } from "@/components/dashboard/header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Server, 
  Plus, 
  MoreVertical, 
  Settings, 
  Activity, 
  Cpu, 
  Database,
  Trash2,
  Power
} from "lucide-react"

const nodes = [
  {
    id: "NODE-401",
    name: "Edge-Inference-01",
    model: "GPT-Vision-Pro",
    status: "active",
    uptime: "14d 2h",
    load: "45%",
    specs: "RTX 4090 | 32GB"
  },
  {
    id: "NODE-402",
    name: "Core-Compute-Beta",
    model: "NLP-Sentiment",
    status: "active",
    uptime: "8d 5h",
    load: "12%",
    specs: "A100 | 80GB"
  },
  {
    id: "NODE-403",
    name: "Vision-Cluster-A",
    model: "Image-Classifier",
    status: "active",
    uptime: "22d 18h",
    load: "78%",
    specs: "H100 | 80GB"
  },
  {
    id: "NODE-404",
    name: "Legacy-Support",
    model: "Credit-Score-AI",
    status: "offline",
    uptime: "0s",
    load: "0%",
    specs: "RTX 3080 | 16GB"
  }
]

export default function NodesPage() {
  return (
    <div className="min-h-screen">
      <DashboardHeader 
        title="My Compute Nodes" 
        subtitle="Deploy and manage your distributed model nodes"
      />
      
      <div className="p-6">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Card className="flex items-center gap-3 border-border/40 bg-card/30 px-4 py-2">
              <Activity className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium">3 Active / 4 Total</span>
            </Card>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Deploy New Node
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {nodes.map((node) => (
            <Card key={node.id} className="group overflow-hidden border-border/40 bg-card/30 transition-all hover:border-primary/40">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${
                    node.status === 'active' ? 'from-accent/20 to-accent/5' : 'from-muted/20 to-muted/5'
                  }`}>
                    <Server className={`h-6 w-6 ${node.status === 'active' ? 'text-accent' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{node.name}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                      node.status === 'active' ? 'bg-accent/20 text-accent' : 'bg-destructive/20 text-destructive'
                    }`}>
                      {node.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{node.id} • {node.model}</p>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border/20 pt-4">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs">{node.specs}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Database className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs">{node.uptime} Uptime</span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-[10px] text-muted-foreground mb-1 uppercase tracking-tighter">
                    <span>Resource Load</span>
                    <span>{node.load}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${
                        parseInt(node.load) > 70 ? 'bg-primary' : 'bg-accent'
                      }`}
                      style={{ width: node.load }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex border-t border-border/20">
                <Button variant="ghost" className="flex-1 rounded-none text-xs h-10 hover:bg-accent/5">
                  <Activity className="mr-2 h-3 w-3" />
                  Logs
                </Button>
                <div className="w-px bg-border/20" />
                <Button variant="ghost" className="flex-1 rounded-none text-xs h-10 hover:bg-primary/5">
                  <Power className="mr-2 h-3 w-3" />
                  {node.status === 'active' ? 'Stop' : 'Start'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
