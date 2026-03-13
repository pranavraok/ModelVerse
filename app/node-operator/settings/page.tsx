"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { 
  Server, 
  Shield, 
  Cpu, 
  Bell, 
  Globe,
  Save,
  Network
} from "lucide-react"

export default function OperatorSettingsPage() {
  const [activeTab, setActiveTab] = useState("hardware")

  const tabs = [
    { id: "hardware", label: "Hardware", icon: Cpu },
    { id: "network", label: "Network", icon: Globe },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell }
  ]

  return (
    <div className="min-h-screen">
      <DashboardHeader 
        title="Infrastructure Settings" 
        subtitle="Configure your hardware profiles and network parameters"
      />
      
      <div className="p-6">
        <div className="grid gap-6 lg:grid-cols-4">
          <div className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <Card className="lg:col-span-3 border-border/40 bg-card/30 p-8">
            {activeTab === "hardware" && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold">Compute Profile</h3>
                  <p className="text-sm text-muted-foreground">Manage your hardware specifications and resource allocation.</p>
                </div>
                
                <div className="space-y-4 max-w-xl">
                  <div className="space-y-2">
                    <Label htmlFor="gpu">Preferred GPU Cluster</Label>
                    <Input id="gpu" defaultValue="NVIDIA RTX Series" className="bg-input/50" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="mem">VRAM Reservation (GB)</Label>
                    <Input id="mem" type="number" defaultValue="24" className="bg-input/50" />
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div>
                      <p className="text-sm font-medium">Automatic Overclocking</p>
                      <p className="text-xs text-muted-foreground">Boost performance during peak network demand</p>
                    </div>
                    <Switch />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button className="bg-primary hover:bg-primary/90">
                    <Save className="mr-2 h-4 w-4" />
                    Save Configuration
                  </Button>
                </div>
              </div>
            )}

            {activeTab === "network" && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold">Network Parameters</h3>
                  <p className="text-sm text-muted-foreground">Configure your node visibility and connection speed.</p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Network className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">P2P Peer Discovery</p>
                        <p className="text-xs text-muted-foreground">Allow other nodes to discover your gateway</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="space-y-2 max-w-sm">
                    <Label htmlFor="port">Inbound Port Range</Label>
                    <Input id="port" defaultValue="30001 - 30010" className="bg-input/50" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold">Alerts & Monitoring</h3>
                  <p className="text-sm text-muted-foreground">Stay updated on infrastructure health and reward payouts.</p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Node Offline Alerts</p>
                      <p className="text-xs text-muted-foreground">Immediate notification if node heartbeats fail</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">High Load Warnings</p>
                      <p className="text-xs text-muted-foreground">Notify when resource usage exceeds 90%</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === "security" && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold">Infrastructure Security</h3>
                  <p className="text-sm text-muted-foreground">Secure your nodes and management dashboard.</p>
                </div>

                <div className="space-y-4 max-w-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Remote Node Management</p>
                      <p className="text-xs text-muted-foreground">Enable SSH-based remote control</p>
                    </div>
                    <Switch />
                  </div>
                  <Button variant="outline" className="w-full border-border/60">Manage Access Keys</Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
