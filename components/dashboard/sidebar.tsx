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
  { name: "Marketplace", href: "/marketplace", icon: Store },
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
    localStorage.removeItem('pendingRole')
    localStorage.removeItem('accessToken')
    router.push('/')
  }

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border/40 bg-sidebar">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-border/40 px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
            <Cpu className="h-4 w-4 text-primary" />
          </div>
          <span className="text-lg font-semibold tracking-tight">NeuralMarket</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {links.map((link) => {
            const isActive = pathname === link.href || 
              (link.href !== `/${role}` && link.href !== '/marketplace' && pathname.startsWith(link.href)) ||
              (link.href === '/marketplace' && pathname === '/marketplace')
            
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <link.icon className={cn("h-4 w-4", isActive && "text-primary")} />
                {link.name}
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-border/40 p-4">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-sm font-medium">
              JD
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium">John Doe</p>
              <p className="truncate text-xs text-muted-foreground capitalize">{role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent/50 hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>
    </aside>
  )
}
