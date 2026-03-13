"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
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
    { id: "account", label: "Account", icon: User },
    { id: "billing", label: "Billing & Wallet", icon: CreditCard },
    { id: "preferences", label: "Job Preferences", icon: Settings2 },
    { id: "notifications", label: "Notifications", icon: Bell }
  ]

  return (
    <div className="min-h-screen">
      <DashboardHeader 
        title="Settings" 
        subtitle="Manage your buyer account, wallet, and job defaults"
      />
      
      <div className="p-6">
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Sidebar Nav */}
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

          {/* Settings Content */}
          <Card className="lg:col-span-3 border-border/40 bg-card/30 p-8">
            {activeTab === "account" && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold">Account Profile</h3>
                  <p className="text-sm text-muted-foreground">Manage your personal information and contact details.</p>
                </div>
                
                <div className="space-y-4 max-w-xl">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="fname">First Name</Label>
                      <Input id="fname" defaultValue="Anirudh" className="bg-input/50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lname">Last Name</Label>
                      <Input id="lname" defaultValue="Mulky" className="bg-input/50" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" defaultValue="ani@example.com" className="bg-input/50" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Company (Optional)</Label>
                    <Input id="company" placeholder="NeuralTech Inc." className="bg-input/50" />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button className="bg-primary hover:bg-primary/90">
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                </div>
              </div>
            )}

            {activeTab === "billing" && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold">Billing & Wallet</h3>
                  <p className="text-sm text-muted-foreground">Manage your connected wallet and auto-refill settings.</p>
                </div>

                <div className="space-y-6">
                  <Card className="border-accent/20 bg-accent/5 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center">
                        <Wallet className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Connected Wallet</p>
                        <p className="font-mono text-xs text-muted-foreground mt-1">0x8912...3456 (Polygon Mainnet)</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="border-accent/40 text-accent hover:bg-accent/10">Disconnect</Button>
                  </Card>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Auto-Refill Balance</p>
                        <p className="text-xs text-muted-foreground">Automatically top up wallet when below 1 MATIC</p>
                      </div>
                      <Switch />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Monthly Spending Limit</p>
                        <p className="text-xs text-muted-foreground">Cap your total spending to 50 MATIC/month</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "preferences" && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold">Job Preferences</h3>
                  <p className="text-sm text-muted-foreground">Global defaults for your AI model inference requests.</p>
                </div>

                <div className="space-y-6 max-w-xl">
                  <div className="space-y-4">
                    <Label>Preferred Inference Region</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {['US East', 'US West', 'Europe', 'Global (Fastest)'].map((region) => (
                        <button 
                          key={region}
                          className={`rounded-lg border p-3 text-center text-xs font-medium transition-all ${
                            region === 'Global (Fastest)' 
                              ? 'border-primary bg-primary/10 text-primary' 
                              : 'border-border/60 hover:border-primary/40'
                          }`}
                        >
                          {region}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div>
                      <p className="text-sm font-medium">Always Use High-Performance Nodes</p>
                      <p className="text-xs text-muted-foreground">Priority execution (may incur higher costs)</p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Store Inference Results</p>
                      <p className="text-xs text-muted-foreground">Keep results for 30 days on decentralized storage</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === "notifications" && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold">Notification Preferences</h3>
                  <p className="text-sm text-muted-foreground">Receive updates about job completions and wallet status.</p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Job Completion Notifications</p>
                      <p className="text-xs text-muted-foreground">Browser push when results are ready</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Low Balance Warnings</p>
                      <p className="text-xs text-muted-foreground">Email alert when context wallet is low</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">New Models in Watchlist</p>
                      <p className="text-xs text-muted-foreground">Alerts for new models from your favorite creators</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
