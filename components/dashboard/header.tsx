"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Bell, 
  Search, 
  Wallet,
  ChevronDown,
  Check,
  X
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DashboardHeaderProps {
  title: string
  subtitle?: string
}

const notifications = [
  { id: 1, title: "Payment received", message: "+0.5 MATIC from inference job", time: "2 min ago", read: false },
  { id: 2, title: "New model rating", message: "Your NLP model received 5 stars", time: "1 hour ago", read: false },
  { id: 3, title: "Inference completed", message: "Job #1234 completed successfully", time: "3 hours ago", read: true },
]

export function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [walletAddress] = useState("0x1234...5678")
  const [balance] = useState("12.5 MATIC")

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/40 bg-background/80 px-6 backdrop-blur-xl">
      <div>
        <h1 className="text-xl font-semibold">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="w-64 bg-input/50 pl-9"
          />
        </div>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
              <span className="font-medium">Notifications</span>
              <button className="text-xs text-primary hover:text-primary/90">Mark all read</button>
            </div>
            {notifications.map((notification) => (
              <DropdownMenuItem key={notification.id} className="flex items-start gap-3 px-4 py-3 cursor-pointer">
                <div className={`mt-0.5 h-2 w-2 rounded-full ${notification.read ? 'bg-muted' : 'bg-primary'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{notification.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Wallet */}
        {isWalletConnected ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-border/60 gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/20">
                  <Wallet className="h-3 w-3 text-accent" />
                </div>
                <span className="hidden sm:inline">{walletAddress}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-4 py-3 border-b border-border/40">
                <p className="text-xs text-muted-foreground">Balance</p>
                <p className="text-lg font-semibold">{balance}</p>
              </div>
              <DropdownMenuItem className="cursor-pointer">
                <Check className="mr-2 h-4 w-4" />
                Copy address
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-destructive" onClick={() => setIsWalletConnected(false)}>
                <X className="mr-2 h-4 w-4" />
                Disconnect
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button 
            variant="outline" 
            className="border-primary/40 text-primary hover:bg-primary/10"
            onClick={() => setIsWalletConnected(true)}
          >
            <Wallet className="mr-2 h-4 w-4" />
            Connect Wallet
          </Button>
        )}
      </div>
    </header>
  )
}
