"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-white/5 bg-background/60 backdrop-blur-3xl saturate-150 transition-all duration-300">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="relative flex h-8 w-8 items-center justify-center mr-1">
            {/* Glowing backdrop */}
            <div className="absolute inset-0 rounded-full bg-linear-to-tr from-blue-500 to-purple-500 opacity-40 blur-md group-hover:opacity-70 transition-opacity duration-500"></div>
            
            {/* Minimalist Orbit Shape */}
            <div className="relative h-6 w-6">
              <div className="absolute inset-0 rounded-full border-[2.5px] border-white/90 scale-x-110 -rotate-45 transition-transform duration-500 group-hover:rotate-0"></div>
              <div className="absolute inset-0 rounded-full border-[2.5px] border-blue-400/80 scale-x-110 rotate-45 transition-transform duration-500 group-hover:rotate-90"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_10px_2px_rgba(255,255,255,0.8)]"></div>
            </div>
          </div>
          <span className="text-xl font-bold tracking-tight text-white/90 group-hover:text-white transition-colors duration-300">
            Model<span className="font-light text-white/50 group-hover:text-white/70 transition-colors duration-300">Verse</span>
          </span>
        </div>

        <div className="hidden items-center gap-8 lg:flex">
          <Link href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Features
          </Link>
          <Link href="#how-it-works" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            How It Works
          </Link>
          <Link href="#marketplace" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Marketplace
          </Link>
          <Link href="#team" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Team
          </Link>
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Login
            </Button>
          </Link>
          <Link href="/select-role">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] transition-all">
              Get Started
            </Button>
          </Link>
        </div>

        <button
          type="button"
          className="lg:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </nav>

      {mobileMenuOpen && (
        <div className="border-t border-border/40 bg-background/95 backdrop-blur-xl lg:hidden">
          <div className="flex flex-col gap-4 px-6 py-6">
            <Link 
              href="#features" 
              className="text-sm text-muted-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link 
              href="#how-it-works" 
              className="text-sm text-muted-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link 
              href="#marketplace" 
              className="text-sm text-muted-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Marketplace
            </Link>
            <Link 
              href="#team" 
              className="text-sm text-muted-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Team
            </Link>
            <div className="flex flex-col gap-2 pt-4 border-t border-border/40">
              <Link href="/login">
                <Button variant="ghost" className="w-full">Login</Button>
              </Link>
              <Link href="/select-role">
                <Button className="w-full bg-primary hover:bg-primary/90 mt-2">
                  Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
