"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { 
  User, 
  Shield, 
  CreditCard, 
  Bell, 
  Settings2,
  Save,
  Plus,
  Wallet
} from "lucide-react"

export default function BuyerSettingsPage() {
  const [activeTab, setActiveTab] = useState("account")

  const tabs = [
    { id: "account", label: "Neural Identity", icon: User },
    { id: "billing", label: "Credit & Ledger", icon: CreditCard },
    { id: "preferences", label: "Inference Logic", icon: Settings2 },
    { id: "notifications", label: "Telemetry Alerts", icon: Bell }
  ]

  return (
    <div className="min-h-screen bg-transparent bg-mesh relative">
      <DashboardHeader 
        title="Configuration" 
        subtitle="Manage your sovereign parameters and network identity"
      />
      
      <div className="relative z-10 p-8">
        <div className="grid gap-10 lg:grid-cols-4">
          {/* Sidebar Nav */}
          <div className="space-y-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-[10px] font-semibold capitalize tracking-normal transition-all duration-300 border",
                  activeTab === tab.id
                    ? "bg-primary border-primary/20 text-white shadow-[0_10px_20px_rgba(139,92,246,0.3)] scale-[1.02]"
                    : "bg-white/[0.02] border-white/[0.03] text-muted-foreground/40 hover:bg-white/[0.04] hover:text-white"
                )}
              >
                <tab.icon className={cn("h-4 w-4", activeTab === tab.id ? "text-white" : "text-muted-foreground/20")} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3 glass-card p-10 border-white/[0.05]">
            {activeTab === "account" && (
              <div className="space-y-12">
                <div>
                  <h3 className="text-3xl font-semibold tracking-tight text-white">Neural Identity</h3>
                  <p className="mt-2 text-sm text-muted-foreground/40 font-medium">Sovereign identity parameters for the decentralized network.</p>
                </div>
                
                <div className="space-y-8 max-w-2xl">
                  <div className="grid gap-8 sm:grid-cols-2">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-semibold text-neutral-500 text-muted-foreground/30">First Alias</Label>
                      <Input defaultValue="Anirudh" className="h-14 bg-white/[0.02] border-white/[0.03] rounded-2xl px-6 focus:ring-primary/20 text-white font-semibold" />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-semibold text-neutral-500 text-muted-foreground/30">Last Alias</Label>
                      <Input defaultValue="Mulky" className="h-14 bg-white/[0.02] border-white/[0.03] rounded-2xl px-6 focus:ring-primary/20 text-white font-semibold" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-semibold text-neutral-500 text-muted-foreground/30">Neural Contact</Label>
                    <Input type="email" defaultValue="ani@example.com" className="h-14 bg-white/[0.02] border-white/[0.03] rounded-2xl px-6 focus:ring-primary/20 text-white font-semibold" />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-semibold text-neutral-500 text-muted-foreground/30">Enterprise Node</Label>
                    <Input placeholder="NeuralTech Systems" className="h-14 bg-white/[0.02] border-white/[0.03] rounded-2xl px-6 focus:ring-primary/20 text-white font-semibold" />
                  </div>
                </div>

                <div className="pt-6 border-t border-white/[0.03] flex justify-end">
                  <Button className="h-14 px-8 bg-primary hover:bg-primary/90 text-white font-semibold text-neutral-500 text-[11px] rounded-2xl shadow-[0_10px_30px_rgba(139,92,246,0.2)]">
                    <Save className="mr-3 h-4 w-4" />
                    Synchronize Profile
                  </Button>
                </div>
              </div>
            )}

            {activeTab === "billing" && (
              <div className="space-y-12">
                <div>
                  <h3 className="text-3xl font-semibold tracking-tight text-white">Credit & Ledger</h3>
                  <p className="mt-2 text-sm text-muted-foreground/40 font-medium">Manage your cryptographic settlement mechanisms.</p>
                </div>

                <div className="space-y-10">
                  <div className="p-8 rounded-[2rem] bg-accent/5 border border-accent/20 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-[0_10px_30px_rgba(139,92,246,0.05)]">
                    <div className="flex items-center gap-6">
                      <div className="h-16 w-16 rounded-[1.5rem] bg-accent/20 flex items-center justify-center border border-accent/20">
                        <Wallet className="h-8 w-8 text-accent" />
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-neutral-500 text-accent/60">Active Matrix Wallet</p>
                        <p className="font-mono text-lg font-semibold text-white mt-1">0x8912...3456</p>
                        <p className="text-[9px] font-semibold text-muted-foreground/40 mt-1 italic">Polygon Mainnet Protocol</p>
                      </div>
                    </div>
                    <Button variant="ghost" className="h-12 px-6 rounded-xl border border-accent/20 text-[10px] font-semibold text-neutral-500 text-accent hover:bg-accent/10">Terminate Connection</Button>
                  </div>

                  <div className="space-y-8 px-4">
                    <div className="flex items-center justify-between group">
                      <div>
                        <p className="text-sm font-semibold text-white tracking-tight">Auto-Replenish Matrix</p>
                        <p className="text-[10px] font-semibold text-muted-foreground/30 text-neutral-500 mt-1">Sovereign top-up when below 1 MATIC threshold</p>
                      </div>
                      <Switch />
                    </div>
                    
                    <div className="flex items-center justify-between group">
                      <div>
                        <p className="text-sm font-semibold text-white tracking-tight">Strategic Spending Cap</p>
                        <p className="text-[10px] font-semibold text-muted-foreground/30 text-neutral-500 mt-1">Restrict monthly neural cost to 50 MATIC</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "preferences" && (
              <div className="space-y-12">
                <div>
                  <h3 className="text-3xl font-semibold tracking-tight text-white">Inference Logic</h3>
                  <p className="mt-2 text-sm text-muted-foreground/40 font-medium">Fine-tune the execution parameters for your neural missions.</p>
                </div>

                <div className="space-y-10 max-w-2xl">
                  <div className="space-y-6">
                    <Label className="text-[10px] font-semibold text-neutral-500 text-muted-foreground/30">Preferred Neural Cluster</Label>
                    <div className="grid grid-cols-2 gap-4">
                      {['US East', 'US West', 'Europe', 'Global (Fastest)'].map((region) => (
                        <button 
                          key={region}
                          className={cn(
                            "h-16 rounded-[1.5rem] border text-[10px] font-semibold capitalize tracking-normal transition-all duration-300",
                            region === 'Global (Fastest)' 
                              ? "bg-primary/10 border-primary/20 text-primary shadow-[0_0_20px_rgba(139,92,246,0.1)]" 
                              : "bg-white/[0.01] border-white/[0.03] text-muted-foreground/30 hover:bg-white/[0.03] hover:text-white"
                          )}
                        >
                          {region}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-8 pt-6 border-t border-white/5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-white tracking-tight">High-Throughput Nodes Only</p>
                        <p className="text-[10px] font-semibold text-muted-foreground/30 text-neutral-500 mt-1 italic">Prioritize execution velocity</p>
                      </div>
                      <Switch />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-white tracking-tight">Decentralized Archive</p>
                        <p className="text-[10px] font-semibold text-muted-foreground/30 text-neutral-500 mt-1 italic">Persist results on IPFS for 30 solar days</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === "notifications" && (
              <div className="space-y-12">
                <div>
                  <h3 className="text-3xl font-semibold tracking-tight text-white">Telemetry Alerts</h3>
                  <p className="mt-2 text-sm text-muted-foreground/40 font-medium">Configure real-time monitoring of your neural operations.</p>
                </div>

                <div className="space-y-8 max-w-2xl">
                  <div className="flex items-center justify-between group p-8 rounded-[2rem] bg-white/[0.01] border border-white/[0.03] hover:bg-white/[0.02] transition-all">
                    <div>
                      <p className="text-[11px] font-semibold text-white tracking-tight">Mission Completion Sync</p>
                      <p className="text-[10px] font-medium text-muted-foreground/30 text-neutral-500 mt-1 italic">Instant telemetry when neural path resolves</p>
                    </div>
                    <Switch defaultChecked className="data-[state=checked]:bg-primary" />
                  </div>
                  
                  <div className="flex items-center justify-between group p-8 rounded-[2rem] bg-white/[0.01] border border-white/[0.03] hover:bg-white/[0.02] transition-all">
                    <div>
                      <p className="text-[11px] font-semibold text-white tracking-tight">Credit Depletion Warning</p>
                      <p className="text-[10px] font-medium text-muted-foreground/30 text-neutral-500 mt-1 italic">Alert when matrix fuel falls below threshold</p>
                    </div>
                    <Switch defaultChecked className="data-[state=checked]:bg-primary" />
                  </div>

                  <div className="flex items-center justify-between group p-8 rounded-[2rem] bg-white/[0.01] border border-white/[0.03] hover:bg-white/[0.02] transition-all">
                    <div>
                      <p className="text-[11px] font-semibold text-white tracking-tight">Blueprint Watchlist</p>
                      <p className="text-[10px] font-medium text-muted-foreground/30 text-neutral-500 mt-1 italic">Notifications for new model architectures</p>
                    </div>
                    <Switch className="data-[state=checked]:bg-primary" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
