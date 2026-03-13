"use client"

import { Upload, Search, Play, CreditCard, X, Check, ArrowRight } from "lucide-react"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Upload & Encrypt",
    description: "Your model weights are secured via zero-knowledge encryption and pinned to a decentralized IPFS network. Only the authorized inference nodes ever interact with your code, ensuring your intellectual property remains completely private.",
    color: "from-blue-500/20 to-cyan-400/20",
    border: "border-blue-500/30",
    iconColor: "text-blue-400"
  },
  {
    icon: Search,
    step: "02", 
    title: "Global Discovery",
    description: "Buyers filter through our marketplace and can test your model in real-time with sample data through our decentralized routing protocol. Performance is guaranteed without ever exposing the underlying model architecture.",
    color: "from-purple-500/20 to-pink-500/20",
    border: "border-purple-500/30",
    iconColor: "text-purple-400"
  },
  {
    icon: Play,
    step: "03",
    title: "Secure Inference",
    description: "Once a transaction is initiated, specialized compute nodes execute the inference securely within trusted execution environments (TEEs). Buyers receive precise results instantly, while the raw model code remains locked away.",
    color: "from-orange-500/20 to-rose-500/20",
    border: "border-orange-500/30",
    iconColor: "text-orange-400"
  },
  {
    icon: CreditCard,
    step: "04",
    title: "Instant Settlement",
    description: "Programmable smart contracts automatically verify the successful inference and instantly route MATIC payments directly to your non-custodial wallet. No intermediaries, no platform holdups, and just a flat 5% network fee.",
    color: "from-emerald-500/20 to-teal-400/20",
    border: "border-emerald-500/30",
    iconColor: "text-emerald-400"
  }
]

export function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  // We use this to fade/translate background elements
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])

  return (
    <section id="how-it-works" ref={containerRef} className="relative bg-[#020202]">
      
      {/* Absolute Ambient Backgrounds */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          style={{ y: bgY }}
          className="absolute top-[10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen" 
        />
        <motion.div 
          style={{ y: bgY }}
          className="absolute bottom-[10%] right-[-10%] w-[40vw] h-[40vw] bg-emerald-600/10 rounded-full blur-[120px] mix-blend-screen" 
        />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)]" />
      </div>

      {/* --- Part 1: Sticky Scroll Pipeline --- */}
      {/* We give the container extra height so we can scroll through it while the left side sticks */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 py-32 md:py-48">
        
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-20">
          
          {/* Sticky Left Sidebar */}
          <div className="lg:w-[40%] relative">
            {/* Centered vertically in viewport via sticky positioning */}
            <div className="sticky top-[30vh]">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 backdrop-blur-md"
              >
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </div>
                The Protocol Pipeline
              </motion.div>
              
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-5xl lg:text-6xl xl:text-7xl leading-[1.1] font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-blue-300 via-indigo-300 to-purple-400 drop-shadow-[0_0_20px_rgba(99,102,241,0.6)] mb-8"
              >
                A seamless journey.
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-base lg:text-lg text-gray-400 font-light mb-8 max-w-md leading-relaxed"
              >
                Zero friction. Absolute security. Navigate the AI marketplace with confidence. Experience an ecosystem where developers instantly monetize their creations while enterprises access the world's most powerful open-weight models without restrictions.
              </motion.p>
            </div>
          </div>

          {/* Scrolling Steps on Right */}
          <div className="lg:w-[60%] flex flex-col gap-12 lg:gap-32 pb-16">
            {steps.map((item, index) => (
              <motion.div 
                key={item.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="relative flex gap-8 group"
              >
                {/* Connecting Line (hidden on the last item) */}
                {index !== steps.length - 1 && (
                  <div className="absolute left-[39px] top-24 bottom-[-100px] w-[2px] bg-gradient-to-b from-white/10 to-transparent lg:bottom-[-160px]" />
                )}

                {/* Number & Icon Pillar */}
                <div className="flex flex-col items-center shrink-0 w-20">
                   <div className={`relative flex h-20 w-20 items-center justify-center rounded-2xl border ${item.border} bg-[#0a0a0a] backdrop-blur-xl shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:bg-[#111]`}>
                     <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${item.color} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
                     <item.icon className={`relative z-10 h-8 w-8 ${item.iconColor}`} />
                   </div>
                   <div className="mt-4 text-sm font-bold tracking-widest text-white/30">
                     {item.step}
                   </div>
                </div>

                {/* Content Card */}
                <div className="flex-1 pt-2">
                   <h3 className="text-2xl md:text-3xl font-semibold text-white mb-4 tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all duration-300">
                     {item.title}
                   </h3>
                   <div className="p-6 rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-md transition-all duration-500 group-hover:bg-white/[0.04] group-hover:border-white/10">
                     <p className="text-lg text-gray-400 leading-relaxed font-light">
                       {item.description}
                     </p>
                   </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>

      {/* --- Part 2: The Paradigm Shift Comparison --- */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 py-32 md:py-48 border-t border-white/10">
        
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block mb-4 rounded-full border border-white/10 bg-white/5 px-4 py-1 flex items-center gap-2"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Comparison</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6"
          >
            A paradigm <span className="font-serif italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">shift.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-400 font-light"
          >
            Breaking away from centralized limitations.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Old Way Card */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative group rounded-[2rem] border border-red-500/20 bg-gradient-to-b from-[#1a0f0f] to-[#0a0505] p-8 md:p-12 overflow-hidden"
          >
            <div className="absolute inset-0 bg-[linear-gradient(rgba(239,68,68,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(239,68,68,0.03)_1px,transparent_1px)] bg-[size:2rem_2rem] pointer-events-none" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-[80px]" />
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-4 mb-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-500 border border-red-500/20">
                  <X className="h-6 w-6" />
                </div>
                <h3 className="text-3xl font-semibold text-white">The Old Way</h3>
              </div>
              
              <ul className="space-y-6 flex-1 text-lg text-gray-400">
                <li className="flex items-center gap-4">
                  <span className="h-2 w-2 rounded-full bg-red-500/50" />
                  <span>Up to 30% platform tax</span>
                </li>
                <li className="flex items-center gap-4">
                  <span className="h-2 w-2 rounded-full bg-red-500/50" />
                  <span>Blind purchases, no testing</span>
                </li>
                <li className="flex items-center gap-4">
                  <span className="h-2 w-2 rounded-full bg-red-500/50" />
                  <span>Centralized control & takedowns</span>
                </li>
                <li className="flex items-center gap-4">
                  <span className="h-2 w-2 rounded-full bg-red-500/50" />
                  <span>Delayed fiat payouts (Net-30)</span>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* New Way Card */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative group rounded-[2rem] border border-emerald-500/30 bg-gradient-to-b from-[#0f1a15] to-[#050a08] p-8 md:p-12 overflow-hidden shadow-[0_0_80px_rgba(16,185,129,0.1)]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px]" />
            
            {/* Shimmer line */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-emerald-500/10 before:to-transparent" />
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-4 mb-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                  <Check className="h-6 w-6" />
                </div>
                <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">ModelVerse</h3>
              </div>
              
              <ul className="space-y-6 flex-1 text-lg text-gray-200">
                <li className="flex items-center gap-4 font-medium">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">✓</span>
                  <span>Only <span className="text-emerald-400 font-bold">5% fee</span></span>
                </li>
                <li className="flex items-center gap-4">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">✓</span>
                  <span>Pre-purchase inference testing</span>
                </li>
                <li className="flex items-center gap-4">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">✓</span>
                  <span>Unstoppable IPFS storage</span>
                </li>
                <li className="flex items-center gap-4">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">✓</span>
                  <span>Instant crypto settlement</span>
                </li>
              </ul>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
