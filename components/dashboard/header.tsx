"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bell, Search } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ConnectButton } from '@rainbow-me/rainbowkit';

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
  return (
    <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between px-8 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/[0.04]">
      <div className="flex flex-col justify-center">
        <h1 className="text-[17px] font-medium tracking-tight text-neutral-100">{title}</h1>
        {subtitle && <p className="text-[13px] text-neutral-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-5">
        <div className="relative hidden lg:block group">
          <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-500 transition-colors group-focus-within:text-neutral-300" strokeWidth={2} />
          <Input
            placeholder="Search..."
            className="w-64 bg-white/[0.02] border-white/[0.06] pl-9 h-9 focus-visible:ring-1 focus-visible:ring-white/10 focus-visible:border-white/10 rounded-[8px] transition-all text-[13px] font-medium placeholder:text-neutral-600 shadow-none border-none ring-0 focus-visible:ring-offset-0 focus:border-white/[0.08]"
          />
        </div>

        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button suppressHydrationWarning id="notification-menu-trigger" variant="ghost" size="icon" className="relative h-9 w-9 rounded-[8px] hover:bg-white/[0.04] border border-transparent hover:border-white/[0.04] transition-all">
                <Bell className="h-4 w-4 text-neutral-400" strokeWidth={2} />
                <span className="absolute right-[8px] top-[8px] h-1.5 w-1.5 rounded-full bg-neutral-300 ring-2 ring-[#0a0a0a]" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[320px] bg-[#0f0f0f] border border-white/[0.06] p-0 mt-2 shadow-2xl rounded-[12px]">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.04]">
                <span className="font-medium text-[13px] text-neutral-200">Notifications</span>
                <button className="text-[12px] font-medium text-neutral-500 hover:text-neutral-300 transition-colors">Clear all</button>
              </div>
              <div className="max-h-[380px] overflow-y-auto p-1.5">
                {notifications.map((notification) => (
                  <DropdownMenuItem key={notification.id} className="flex items-start gap-3 px-3 py-2.5 cursor-pointer rounded-[8px] focus:bg-white/[0.03] transition-colors mb-0.5 last:mb-0">
                    <div className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${notification.read ? 'bg-white/10' : 'bg-neutral-300'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-neutral-200">{notification.title}</p>
                      <p className="text-[12px] text-neutral-500 mt-0.5 line-clamp-1">{notification.message}</p>
                      <p className="text-[11px] text-neutral-600 mt-1.5">{notification.time}</p>
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="h-4 w-px bg-white/[0.06] mx-1" />

          <div className="[&_button]:!h-9 [&_button]:!rounded-[8px] [&_button]:!font-medium [&_button]:!text-[13px] shadow-none [&>div]:shadow-none [&>div>div]:shadow-none">
            <ConnectButton />
          </div>
        </div>
      </div>
    </header>
  )
}
