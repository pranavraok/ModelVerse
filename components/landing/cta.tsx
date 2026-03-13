"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

export function CTA() {
  return (
    <section className="relative py-24 md:py-40 bg-[#020202] overflow-hidden flex justify-center px-4 sm:px-6 lg:px-8">
      
      <div className="relative w-full max-w-5xl overflow-hidden rounded-[2.5rem] sm:rounded-[4rem] border border-white/10 bg-[#0a0a0a] shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col items-center text-center px-6 py-24 sm:px-16 sm:py-32">
        
        {/* Soft, wide bottom glow INSIDE the card using brand colors */}
        <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[150%] sm:w-[120%] h-75 bg-linear-to-t from-purple-600/30 via-blue-500/10 to-transparent blur-[80px] pointer-events-none rounded-[100%]" />
        
        {/* Subtle grid texture inside card */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center w-full">
          {/* Top Logo Badge */}
          <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/3 px-5 py-2 backdrop-blur-md shadow-lg">
            <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-white text-black">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-base font-semibold text-white tracking-wide">ModelVerse</span>
          </div>
          
          {/* Main Heading styled like the reference */}
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-white mb-6 leading-[1.1]">
            Showcase Collaborations With <br className="hidden sm:block" />
            Top Technology Partners.
          </h2>
          
          {/* Subheading styled like the reference */}
          <p className="mt-2 text-lg md:text-xl text-gray-400 font-light leading-relaxed max-w-2xl">
            Join the ModelVerse ecosystem to demonstrate your AI models. <br className="hidden md:block"/>
            Publish your work and secure funding in as little as 4 days.
          </p>
          
          {/* White Pill Button */}
          <div className="mt-12">
            <Link href="/select-role">
              <Button size="lg" className="h-14 px-10 rounded-full bg-white text-black hover:bg-gray-200 font-semibold text-base transition-all hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.15)]">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
        
      </div>
    </section>
  )
}
