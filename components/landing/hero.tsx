"use client"

import Link from "next/link"
import { Mic, ArrowRight, Bot, Cpu, Plus, Zap } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { motion, useInView, useSpring, useMotionValue, useMotionTemplate } from "framer-motion"

function Counter({ from = 0, to, duration = 5, suffix = "", prefix = "" }: { from?: number, to: number, duration?: number, suffix?: string, prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: "-100px" })
  
  const motionValue = useMotionValue(from)
  const springValue = useSpring(motionValue, {
    damping: 40,
    stiffness: 100,
    restDelta: 0.001
  })

  useEffect(() => {
    if (inView) {
      motionValue.set(to)
    }
  }, [inView, motionValue, to])

  useEffect(() => {
    return springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = prefix + Intl.NumberFormat('en-US').format(Math.floor(latest)) + suffix
      }
    })
  }, [springValue, prefix, suffix])

  return <span ref={ref}>{prefix}{from}{suffix}</span>
}

function SpotlightCard({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  return (
    <div
      className={`relative group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-2xl transition-all duration-500 hover:border-white/20 hover:bg-white/[0.04] p-8 ${className}`}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-500 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(255,255,255,0.06),
              transparent 80%
            )
          `,
        }}
      />
      {children}
    </div>
  )
}

const slideUpVariant = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const } }
}

export function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#030303] pt-32 pb-32 md:pb-40 flex flex-col items-center">
      {/* Advanced "ModelVerse" Immersive Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Animated Aurora / Cosmic Dust */}
        <div className="absolute top-[-20%] left-[-10%] h-[70vw] w-[70vw] rounded-full bg-blue-600/20 blur-[130px] opacity-70 animate-[pulse_10s_ease-in-out_infinite] pointer-events-none mix-blend-screen transform -rotate-12" />
        <div className="absolute top-[20%] right-[-20%] h-[60vw] w-[60vw] rounded-full bg-indigo-500/20 blur-[120px] opacity-60 animate-[pulse_15s_ease-in-out_infinite_alternate] pointer-events-none mix-blend-screen" />
        <div className="absolute bottom-[-20%] left-[10%] h-[80vw] w-[80vw] rounded-full bg-purple-600/15 blur-[150px] opacity-50 animate-[pulse_12s_ease-in-out_infinite] pointer-events-none mix-blend-screen" />
        
        {/* Dynamic Structural Grid (Perspective) */}
        <div className="absolute inset-0 perspective-[1000px] pointer-events-none opacity-30">
           <div className="absolute inset-0 origin-bottom [transform:rotateX(60deg)_scale(2.5)] bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:linear-gradient(to_top,black,transparent)] animate-[grid-move_20s_linear_infinite]" />
        </div>

        <style dangerouslySetInnerHTML={{__html: `
          @keyframes grid-move {
            0% { transform: rotateX(60deg) scale(2.5) translateY(0); }
            100% { transform: rotateX(60deg) scale(2.5) translateY(4rem); }
          }
          @keyframes shimmer {
            100% { transform: translateX(150%); }
          }
          @keyframes gradient-shift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}} />

        {/* Center Spotlight */}
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 h-[80vh] w-[60vw] bg-radial-gradient from-white/10 to-transparent blur-[100px] pointer-events-none pointer-events-none" />
      </div>

      <div className="mx-auto w-full max-w-7xl px-6 lg:px-8 flex flex-col items-center relative z-10">
        {/* Top Badge */}
        <div className="mb-8 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/80 backdrop-blur-md shadow-sm transition-colors hover:bg-white/10 cursor-default">
          <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
          Decentralized Model Marketplace
        </div>

        {/* Heading */}
        <motion.h1 
          className="relative text-center text-5xl sm:text-6xl md:text-[5.5rem] lg:text-[6.5rem] font-bold tracking-tighter mb-6 leading-[1.05]"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.2 } } }}
        >
          {/* Subtle glow behind the main text */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[120%] bg-blue-500/10 blur-[100px] -z-10 rounded-[100%] pointer-events-none" />
          
          <motion.span variants={slideUpVariant} className="block mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-indigo-200 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            Discover Every Model.
          </motion.span>
          
          <motion.span variants={slideUpVariant} className="block relative">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-purple-300 to-white drop-shadow-[0_0_15px_rgba(167,139,250,0.3)]">
              Deploy With{" "}
            </span>
            <span className="relative inline-block text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">
              Trust
              <svg className="absolute -bottom-1 left-0 w-full h-4 sm:-bottom-2 sm:h-6 pointer-events-none overflow-visible" viewBox="0 0 100 20" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="gradientPath" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="var(--primary, #8b5cf6)" />
                    <stop offset="50%" stopColor="var(--accent, #38bdf8)" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
                <motion.path 
                  d="M 2 15 Q 25 5, 50 15 T 98 15" 
                  fill="transparent" 
                  stroke="url(#gradientPath)" 
                  strokeWidth="5" 
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 }}
                />
              </svg>
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50">.</span>
          </motion.span>
        </motion.h1>

        {/* Subheading */}
        <p className="max-w-2xl text-center text-xl text-white/60 mb-10 font-normal leading-relaxed tracking-tight">
          Open-source, proprietary & fine-tuned models—our decentralized network connects you directly to over 5,000+ top-tier AI models. Always secure.
        </p>

        {/* Search Bar matching image */}
        <div className="relative w-full max-w-2xl group mt-2">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary/30 via-accent/30 to-blue-500/30 opacity-40 blur-md group-hover:opacity-70 transition duration-500" />
          <div className="relative flex items-center w-full rounded-full border border-white/10 bg-black/40 backdrop-blur-xl px-4 py-3 shadow-2xl transition-all group-hover:bg-black/50">
            <Plus className="h-5 w-5 text-muted-foreground mx-2" />
            <input 
              type="text"
              placeholder="What model do you want to run?"
              className="flex-1 bg-transparent px-3 py-2 text-base text-white placeholder:text-muted-foreground/60 outline-none"
            />
            <div className="flex items-center gap-3 pr-2">
              <Mic className="h-5 w-5 text-muted-foreground hover:text-white cursor-pointer transition-colors" />
              <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black hover:bg-white/90 transition-transform hover:scale-105 shadow-md">
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Central Display Card (Comparison Style) */}
        <div className="relative w-full max-w-5xl mt-24 mb-16">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[98%] z-10">
             <div className="rounded-t-3xl border border-b-0 border-white/5 bg-white/[0.02] px-16 sm:px-24 py-3 backdrop-blur-xl shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.5)] flex items-center justify-center">
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70 whitespace-nowrap">
                  Network Model Comparison
                </span>
             </div>
          </div>

          <div className="relative rounded-[2rem] border border-white/10 bg-white/[0.03] backdrop-blur-2xl p-6 sm:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)]">
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
            
            <div className="grid grid-cols-1 overflow-hidden md:grid-cols-2 gap-8 relative items-center">
              
              {/* Central vs Badge */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 hidden md:flex h-16 w-16 items-center justify-center rounded-full border-4 border-background bg-gradient-to-br from-primary to-accent shadow-[0_0_30px_-5px_var(--primary)] text-white">
                <Bot className="h-7 w-7" />
              </div>

              {/* Left Item */}
              <SpotlightCard className="shadow-inner relative z-10 w-full">
                 <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none" />
                 
                 <div className="relative flex items-center justify-between mb-8">
                   <div className="flex items-center gap-4">
                     <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary shadow-inner border border-primary/20 overflow-hidden">
                       <div className="absolute inset-0 bg-primary/20 hover:bg-primary/30 blur-xl transition-colors rounded-full" />
                       <Zap className="h-6 w-6 relative z-10 group-hover:scale-110 transition-transform duration-500" />
                     </div>
                     <div>
                       <h3 className="text-2xl font-semibold text-white group-hover:text-primary transition-colors duration-300">Llama 3</h3>
                       <p className="text-[10px] text-muted-foreground tracking-widest uppercase mt-0.5 flex items-center gap-1.5">
                         META AI
                       </p>
                     </div>
                   </div>
                   <div className="relative rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-[10px] uppercase tracking-wider font-medium text-primary shadow-sm overflow-hidden group/badge">
                     Verified Node
                   </div>
                 </div>
                 
                 <div className="flex justify-between items-end mb-8 relative">
                    <div>
                      <p className="text-4xl font-medium text-white tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/50 transition-all duration-300">$0.15<span className="text-base text-muted-foreground font-normal group-hover:text-white/40">/1M</span></p>
                      <p className="text-[10px] text-muted-foreground mt-1.5 uppercase tracking-[0.15em] flex items-center gap-2">
                        Inference Fee
                      </p>
                    </div>
                 </div>

                 <div className="space-y-6 relative p-5 rounded-2xl bg-black/20 border border-white/5 shadow-inner">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[10px] text-primary uppercase tracking-widest font-medium">Processing Model</span>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Finite Loading Bar 1 */}
                      <div className="relative h-1.5 w-full rounded-full bg-black/60 overflow-hidden shadow-inner">
                         <motion.div 
                           initial={{ width: "0%" }}
                           animate={{ width: "92%" }}
                           transition={{ duration: 5, ease: "easeOut" }}
                           className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary/80 via-accent to-primary/80 rounded-full bg-[length:200%_100%] shadow-[0_0_15px_rgba(139,92,246,0.6)]" 
                         />
                      </div>
                      
                      {/* Finite Loading Bar 2 */}
                      <div className="relative h-1.5 w-full rounded-full bg-black/60 overflow-hidden shadow-inner">
                         <motion.div 
                           initial={{ width: "0%" }}
                           animate={{ width: "76%" }}
                           transition={{ duration: 5, ease: "easeInOut", delay: 0.2 }}
                           className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary/60 via-purple-400 to-primary/60 rounded-full bg-[length:200%_100%] shadow-[0_0_10px_rgba(139,92,246,0.4)]" 
                         />
                      </div>
                      
                      {/* Finite Loading Bar 3 */}
                      <div className="relative h-1.5 w-full rounded-full bg-black/60 overflow-hidden shadow-inner">
                         <motion.div 
                           initial={{ width: "0%" }}
                           animate={{ width: "88%" }}
                           transition={{ duration: 4.8, ease: "easeOut", delay: 0.4 }}
                           className="absolute top-0 left-0 h-full bg-gradient-to-r from-accent via-primary to-accent rounded-full bg-[length:200%_100%] shadow-[0_0_12px_rgba(56,189,248,0.5)]" 
                         />
                      </div>
                    </div>
                 </div>
              </SpotlightCard>

              {/* Right Item */}
              <SpotlightCard className="shadow-inner relative z-10 w-full">
                 <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none" />
                 
                 <div className="relative flex items-center justify-between mb-8">
                   <div className="flex items-center gap-4">
                     <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 text-blue-400 shadow-inner border border-blue-500/20 overflow-hidden">
                       <div className="absolute inset-0 bg-blue-500/20 hover:bg-blue-500/30 blur-xl transition-colors rounded-full" />
                       <Cpu className="h-6 w-6 relative z-10 group-hover:scale-110 transition-transform duration-500" />
                     </div>
                     <div>
                       <h3 className="text-2xl font-semibold text-white group-hover:text-blue-400 transition-colors duration-300">Mistral Large</h3>
                       <p className="text-[10px] text-muted-foreground tracking-widest uppercase mt-0.5 flex items-center gap-1.5">
                         MISTRAL
                       </p>
                     </div>
                   </div>
                   <div className="relative rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-[10px] uppercase tracking-wider font-medium text-blue-400 shadow-sm overflow-hidden group/badge">
                     Verified Node
                   </div>
                 </div>
                 
                 <div className="flex justify-between items-end mb-8 relative">
                    <div>
                      <p className="text-4xl font-medium text-white tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/50 transition-all duration-300">$0.20<span className="text-base text-muted-foreground font-normal group-hover:text-white/40">/1M</span></p>
                      <p className="text-[10px] text-muted-foreground mt-1.5 uppercase tracking-[0.15em] flex items-center gap-2">
                        Inference Fee
                      </p>
                    </div>
                 </div>

                 <div className="space-y-6 relative p-5 rounded-2xl bg-black/20 border border-white/5 shadow-inner">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[10px] text-blue-400 uppercase tracking-widest font-medium">Initializing Stream</span>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Finite Loading Bar 1 */}
                      <div className="relative h-1.5 w-full rounded-full bg-black/60 overflow-hidden shadow-inner">
                         <motion.div 
                           initial={{ width: "0%" }}
                           animate={{ width: "84%" }}
                           transition={{ duration: 4.5, ease: "easeOut" }}
                           className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500/80 via-cyan-300 to-blue-500/80 rounded-full bg-[length:200%_100%] shadow-[0_0_15px_rgba(59,130,246,0.6)]" 
                         />
                      </div>
                      
                      {/* Finite Loading Bar 2 */}
                      <div className="relative h-1.5 w-full rounded-full bg-black/60 overflow-hidden shadow-inner">
                         <motion.div 
                           initial={{ width: "0%" }}
                           animate={{ width: "61%" }}
                           transition={{ duration: 5.5, ease: "easeInOut", delay: 0.1 }}
                           className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-400/80 via-blue-400 to-cyan-400/80 rounded-full bg-[length:200%_100%] shadow-[0_0_10px_rgba(34,211,238,0.5)]" 
                         />
                      </div>
                      
                      {/* Finite Loading Bar 3 */}
                      <div className="relative h-1.5 w-full rounded-full bg-black/60 overflow-hidden shadow-inner">
                         <motion.div 
                           initial={{ width: "0%" }}
                           animate={{ width: "95%" }}
                           transition={{ duration: 5, ease: "easeOut", delay: 0.3 }}
                           className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500/80 via-blue-400 to-indigo-500/80 rounded-full bg-[length:200%_100%] shadow-[0_0_12px_rgba(99,102,241,0.5)]" 
                         />
                      </div>
                    </div>
                 </div>
              </SpotlightCard>

            </div>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-32 text-center opacity-80 hover:opacity-100 transition-opacity duration-500">
           <div>
             <div className="text-5xl md:text-7xl font-bold text-white mb-3 tracking-tighter drop-shadow-md"><Counter to={10} suffix="k+" /></div>
             <div className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-medium">Models Indexed</div>
           </div>
           <div>
             <div className="text-5xl md:text-7xl font-bold text-white mb-3 tracking-tighter drop-shadow-md"><Counter to={50} suffix="+" /></div>
             <div className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-medium">Categories</div>
           </div>
           <div>
             <div className="text-5xl md:text-7xl font-bold text-white mb-3 tracking-tighter drop-shadow-md"><Counter to={0} suffix="%" /></div>
             <div className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-medium">Platform Fees</div>
           </div>
           <div>
             <div className="text-5xl md:text-7xl font-bold text-white mb-3 tracking-tighter drop-shadow-md"><Counter to={12} prefix="+" /></div>
             <div className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-medium">Frameworks</div>
           </div>
        </div>

      </div>
    </section>
  )
}
