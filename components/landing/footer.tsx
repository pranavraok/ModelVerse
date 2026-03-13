"use client"

import Link from "next/link"
import Image from "next/image"
import { Twitter, Github, Send } from "lucide-react"

const footerLinks = {
  Platform: [
    { name: "Marketplace", href: "/marketplace" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Pricing", href: "#pricing" },
    { name: "API Docs", href: "/docs" }
  ],
  Creators: [
    { name: "Upload Model", href: "/creator/upload" },
    { name: "Creator Dashboard", href: "/creator" },
    { name: "Earnings", href: "/creator/earnings" },
    { name: "Analytics", href: "/creator/analytics" }
  ],
  Buyers: [
    { name: "Browse Models", href: "/marketplace" },
    { name: "My Jobs", href: "/buyer/jobs" },
    { name: "Job History", href: "/buyer/history" },
    { name: "Documentation", href: "/docs" }
  ],
  Company: [
    { name: "About Us", href: "/about" },
    { name: "Blog", href: "/blog" },
    { name: "Careers", href: "/careers" },
    { name: "Contact", href: "/contact" }
  ]
}

export function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-[#020202] overflow-hidden pb-12">
      
      {/* Subtle Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 relative z-10">
        <div className="grid gap-12 lg:grid-cols-6">
          {/* Brand */}
          <div className="lg:col-span-2">
              <div className="flex items-center">
              <Image
                src="/logo.png"
                alt="ModelVerse"
                  width={260}
                  height={70}
                  className="h-14 w-auto"
              />
            </div>
            <p className="mt-4 max-w-xs text-sm text-gray-400 font-light leading-relaxed">
              The decentralized marketplace for AI models. Upload, monetize, and run AI with blockchain-powered trust.
            </p>
            <div className="mt-6 flex gap-3">
              {[
                { icon: Twitter, href: "#" },
                { icon: Github, href: "#" },
                { icon: Send, href: "#" }
              ].map(({ icon: Icon, href }, i) => (
                <Link
                  key={i}
                  href={href}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-400 transition-colors hover:border-white/30 hover:text-white hover:bg-white/10"
                >
                  <Icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="mb-4 text-sm font-semibold text-white/90">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-500 transition-colors hover:text-white"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-sm text-gray-500 font-light">© 2026. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-sm text-gray-500 font-light hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-gray-500 font-light hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
