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
  Key, 
  Bell, 
  Globe,
  Save,
  Copy,
  Plus
} from "lucide-react"

export default function CreatorSettingsPage() {
  const [activeTab, setActiveTab] = useState("profile")

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Shield },
    { id: "api", label: "API Keys", icon: Key },
    { id: "notifications", label: "Notifications", icon: Bell }
  ]

  return (
    <div className="min-h-screen">
      <DashboardHeader 
        title="Settings" 
        subtitle="Manage your creator identity and marketplace preferences"
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
            {activeTab === "profile" && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold">Public Profile</h3>
                  <p className="text-sm text-muted-foreground">This information will be visible to potential buyers in the marketplace.</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-6">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center text-xl font-bold border-2 border-border/40">
                      AM
                    </div>
                    <Button variant="outline" size="sm" className="border-border/60">Change Avatar</Button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input id="displayName" defaultValue="Anirudh Mulky" className="bg-input/50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                        <Input id="username" defaultValue="anirudh_m" className="bg-input/50 pl-8" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <textarea 
                      id="bio" 
                      rows={4}
                      defaultValue="AI Researcher & Developer specialized in computer vision and NLP models."
                      className="w-full rounded-md border border-input bg-input/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website / Portfolio</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input id="website" placeholder="https://yourportfolio.com" className="bg-input/50 pl-10" />
                    </div>
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

            {activeTab === "api" && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold">API Keys</h3>
                  <p className="text-sm text-muted-foreground">Manage keys for integrating your models into external applications.</p>
                </div>

                <div className="space-y-4">
                  <Card className="border-border/40 bg-muted/30 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Production Key</p>
                        <p className="font-mono text-xs text-muted-foreground mt-1">nm_prod_41f...8x92</p>
                        <p className="text-[10px] text-muted-foreground mt-2">Created Mar 10, 2026</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8 border-border/60">
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">Revoke</Button>
                      </div>
                    </div>
                  </Card>

                  <Button variant="outline" className="w-full border-dashed border-border/60 py-8">
                    <Plus className="mr-2 h-4 w-4" />
                    Generate New API Key
                  </Button>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold">Notification Preferences</h3>
                  <p className="text-sm text-muted-foreground">Control how you receive updates about model usage and earnings.</p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Earnings Alerts</p>
                      <p className="text-xs text-muted-foreground">Get notified when a buyer uses your model</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Model Health Monitoring</p>
                      <p className="text-xs text-muted-foreground">Immediate alerts if your model node goes offline</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Marketing Emails</p>
                      <p className="text-xs text-muted-foreground">Stay updated on new platform features and tips</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === "security" && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold">Security</h3>
                  <p className="text-sm text-muted-foreground">Manage your account security and authentication methods.</p>
                </div>

                <div className="space-y-4 max-w-sm">
                  <div className="space-y-2">
                    <Label htmlFor="currentPass">Current Password</Label>
                    <Input id="currentPass" type="password" className="bg-input/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPass">New Password</Label>
                    <Input id="newPass" type="password" className="bg-input/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPass">Confirm New Password</Label>
                    <Input id="confirmPass" type="password" className="bg-input/50" />
                  </div>
                  <Button className="mt-2 w-full">Update Password</Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
