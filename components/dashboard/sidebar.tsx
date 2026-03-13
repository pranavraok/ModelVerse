"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  Cpu, 
  LayoutDashboard, 
  Upload, 
  Package, 
  BarChart3, 
  Wallet,
  Settings,
  LogOut,
  Store,
  History,
  Play,
  PlusCircle,
  Terminal,
  Activity
} from "lucide-react"

import { useRouter } from "next/navigation"

interface SidebarProps {
  role: 'creator' | 'buyer' | 'node-operator'
}

const creatorLinks = [
  { name: "Dashboard", href: "/creator", icon: LayoutDashboard },
  { name: "Upload Model", href: "/creator/upload", icon: Upload },
  { name: "My Models", href: "/creator/models", icon: Package },
  { name: "Analytics", href: "/creator/analytics", icon: BarChart3 },
  { name: "Earnings", href: "/creator/earnings", icon: Wallet },
  { name: "Settings", href: "/creator/settings", icon: Settings },
]

const buyerLinks = [
  { name: "Dashboard", href: "/buyer", icon: LayoutDashboard },
  { name: "Marketplace", href: "/marketplace", icon: Store },
  { name: "My Jobs", href: "/buyer/jobs", icon: Play },
  { name: "History", href: "/buyer/history", icon: History },
  { name: "Settings", href: "/buyer/settings", icon: Settings },
]

const nodeOperatorLinks = [
  { name: "Dashboard", href: "/node-operator", icon: LayoutDashboard },
  { name: "Register Node", href: "/node-operator/register", icon: PlusCircle },
  { name: "Setup", href: "/node-operator/setup", icon: Terminal },
  { name: "Active Jobs", href: "/node-operator/jobs", icon: Activity },
  { name: "My Nodes", href: "/node-operator/nodes", icon: Cpu },
  { name: "Earnings", href: "/node-operator/earnings", icon: Wallet },
  { name: "Settings", href: "/node-operator/settings", icon: Settings },
]

export function DashboardSidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const links = role === 'creator' ? creatorLinks 
    : role === 'buyer' ? buyerLinks 
    : nodeOperatorLinks

  const handleLogout = () => {
    localStorage.removeItem('userRole')
    localStorage.removeItem('pendingUser')
    localStorage.setItem('walletDisconnected', 'true') // disconnect wallet on sign out
    router.push('/')
  }

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-[320px] border-r border-white/[0.05] bg-[#030303]/80 backdrop-blur-3xl shadow-[4px_0_24px_rgba(0,0,0,0.4)]">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-24 items-center gap-5 px-8 pb-4 pt-10 mb-6 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary/20 to-primary/5 border border-primary/30 shadow-[0_0_20px_rgba(139,92,246,0.15)] group-hover:scale-105 transition-all">
            <Cpu className="h-6 w-6 text-primary drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
          </div>
          <span className="relative text-[22px] font-bold tracking-tight text-white drop-shadow-md">ModelVerse</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2.5 px-5 py-4 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
          <p className="px-3 mb-5 text-[12px] font-bold text-neutral-500 uppercase tracking-[0.2em]">Neural Interface</p>
          {links.map((link) => {
            const isActive = pathname === link.href || 
              (link.href !== `/${role}` && link.href !== '/marketplace' && pathname.startsWith(link.href)) || 
              (link.href === '/marketplace' && pathname.startsWith('/marketplace'))
            
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "group relative flex items-center gap-4 rounded-2xl px-4 py-3.5 text-[15px] font-medium transition-all duration-500",
                  isActive
                    ? "bg-white/[0.06] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] border border-white/[0.05]"
                    : "text-neutral-400 hover:bg-white/[0.04] hover:text-white border border-transparent"
                )}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent rounded-2xl opacity-50" />
                )}
                <div className={cn("relative z-10 flex items-center gap-4 transition-transform duration-500", isActive && "translate-x-1.5")}>
                  <link.icon className={cn(
                    "h-5 w-5 transition-all duration-500", 
                    isActive 
                      ? "text-primary scale-110 drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]" 
                      : "text-neutral-500 group-hover:text-white group-hover:scale-110"
                  )} />
                  <span className="tracking-wide">{link.name}</span>
                </div>
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        <div className="mt-auto p-5 space-y-4">
          <div className="relative !rounded-[24px] border border-white/[0.06] p-5 bg-[#0a0a0a]/60 hover:bg-[#111] transition-all duration-500 cursor-pointer group overflow-hidden shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-gradient-to-tr from-primary/20 to-primary/5 border border-primary/30 text-sm font-bold text-primary capitalize shadow-[0_0_15px_rgba(139,92,246,0.2)] group-hover:scale-105 transition-transform duration-500">
                AI
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-base font-semibold text-white tracking-tight">0x8912...3456</p>
                <p className="truncate text-[13px] font-medium text-neutral-400 mt-0.5 capitalize tracking-wide">{role}</p>
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="group flex w-full items-center gap-3 rounded-[16px] px-4 py-3.5 text-[14px] font-medium text-neutral-400 transition-all duration-300 hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/20"
          >
            <LogOut className="h-5 w-5 transition-transform duration-500 group-hover:translate-x-1" />
            <span className="tracking-wide">Disconnect</span>
          </button>
        </div>
      </div>
    </aside>
  )
}