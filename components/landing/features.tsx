"use client"

import { 
  Shield, 
  Zap, 
  Coins, 
  Globe, 
  Lock, 
  BarChart3 
} from "lucide-react"
import { motion } from "framer-motion"

const features = [
  // Left Column ("Trust" equivalent)
  {
    icon: Shield,
    title: "Blockchain Escrow",
    description: "Secure payment system where funds are held in smart contracts until inference is successfully completed.",
    col: 0,
    border: "border-primary/30 hover:border-primary/50",
    bg: "bg-gradient-to-br from-primary/10 via-transparent to-transparent",
    iconBg: "bg-primary/20 text-primary shadow-[0_0_20px_rgba(139,92,246,0.3)]",
  },
  {
    icon: Lock,
    title: "Privacy First",
    description: "Your model weights remain encrypted. Buyers can only run inference, never download your IP.",
    col: 0,
    border: "border-pink-500/30 hover:border-pink-500/50",
    bg: "bg-gradient-to-t from-pink-500/10 to-transparent",
    iconBg: "bg-pink-500/20 text-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.3)]",
  },
  
  // Center Column (Main Core equivalent)
  {
    icon: Zap,
    title: "Lightning Fast Inference",
    description: "Distributed compute network ensures minimal latency and maximum reliability. We route requests to the nearest verified node.",
    col: 1,
    border: "border-accent/30 hover:border-accent/50",
    bg: "bg-gradient-to-bl from-accent/10 to-transparent",
    iconBg: "bg-accent/20 text-accent shadow-[0_0_20px_rgba(56,189,248,0.3)]",
  },
  {
    icon: Coins,
    title: "Instant Crypto Payments",
    description: "Get paid instantly in MATIC. No waiting for traditional payment processing or dealing with high platform fees.",
    col: 1,
    border: "border-blue-500/30 hover:border-blue-500/50",
    bg: "bg-gradient-to-t from-blue-500/10 to-transparent",
    iconBg: "bg-blue-500/20 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)]",
  },

  // Right Column ("FAQ / Info" equivalent)
  {
    icon: Globe,
    title: "Decentralized Storage",
    description: "Models are stored on IPFS, ensuring they're always available and completely resistant to censorship.",
    col: 2,
    border: "border-purple-500/30 hover:border-purple-500/50",
    bg: "bg-gradient-to-tr from-purple-500/10 to-transparent",
    iconBg: "bg-purple-500/20 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.3)]",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track earnings, usage metrics, and model performance with our comprehensive real-time dashboard suite.",
    col: 2,
    border: "border-cyan-500/30 hover:border-cyan-500/50",
    bg: "bg-gradient-to-bl from-cyan-500/10 to-transparent",
    iconBg: "bg-cyan-500/20 text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)]",
  }
]

// Feature Card Component to keep layout clean
function FeatureCard({ feature, idx }: { feature: any, idx: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 30 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className={`group relative rounded-[2rem] border ${feature.border} ${feature.bg} p-8 backdrop-blur-md overflow-hidden hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.15)] transition-all duration-700 flex flex-col`}
    >
      {/* Inner subtle grid pattern for the card icon context */}
      <div className="absolute top-0 right-0 w-[80%] h-[80%] bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:2rem_2rem] [mask-image:radial-gradient(circle_at_top_right,black_40%,transparent_100%)] opacity-70 pointer-events-none" />
      
      <div className={`relative mb-8 flex h-16 w-16 items-center justify-center rounded-2xl ${feature.iconBg} border border-white/10 overflow-hidden`}>
         <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl bg-white/20 rounded-full" />
         <feature.icon className="h-8 w-8 relative z-10 group-hover:scale-110 transition-transform duration-500" />
      </div>
      
      <div className="relative z-10 mt-auto">
        <h3 className="mb-3 text-2xl font-medium text-white tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/60 transition-all duration-300">
          {feature.title}
        </h3>
        <p className="text-base text-muted-foreground/80 leading-relaxed">
          {feature.description}
        </p>
      </div>

      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent group-hover:animate-[shimmer_2s_ease-in-out_forwards] pointer-events-none" />
    </motion.div>
  )
}

export function Features() {
  const leftCol = features.filter(f => f.col === 0);
  const midCol = features.filter(f => f.col === 1);
  const rightCol = features.filter(f => f.col === 2);

  return (
    <section id="features" className="relative py-32 md:py-40 bg-[#0c0c0e] overflow-hidden">
      
      {/* Background Radial Dashed Structure matching the image reference */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250vw] h-[250vw] sm:w-[150vw] sm:h-[150vw] pointer-events-none flex items-center justify-center opacity-20">
        {/* Concentric Dashed Circles */}
        <div className="absolute w-[35%] h-[35%] rounded-full border border-dashed border-white" />
        <div className="absolute w-[60%] h-[60%] rounded-full border border-dashed border-white" />
        <div className="absolute w-[85%] h-[85%] rounded-full border border-dashed border-white" />
        
        {/* Radiating Dashed Lines connecting the sections */}
        <div className="absolute w-full h-[1px] border-t border-dashed border-white rotate-[15deg]" />
        <div className="absolute w-full h-[1px] border-t border-dashed border-white -rotate-[15deg]" />
        <div className="absolute w-full h-[1px] border-t border-dashed border-white rotate-[45deg]" />
        <div className="absolute w-full h-[1px] border-t border-dashed border-white -rotate-[45deg]" />
      </div>

      {/* Dynamic Animated Background Glows */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.4, 0.3],
          rotate: [0, 90, 0]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[180px] pointer-events-none mix-blend-screen" 
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.3, 0.2],
          rotate: [0, -90, 0]
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-1/4 left-1/4 w-[700px] h-[700px] bg-blue-500/20 rounded-full blur-[180px] pointer-events-none mix-blend-screen" 
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8 z-10">
        <div className="text-center mb-28 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-white/80 backdrop-blur-md"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Next-Gen Infrastructure
          </motion.div>
          
          <h2 className="text-5xl md:text-7xl font-sans font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-white/90 to-white/20 pb-2">
            <motion.span 
               initial={{ backgroundPosition: "0% 50%" }}
               animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
               transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
               className="bg-[length:200%_auto] bg-gradient-to-r from-primary via-blue-400 to-primary text-transparent bg-clip-text"
            >
              Unleash
            </motion.span>
            {" "}your capabilities
          </h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
            className="mt-6 text-lg md:text-xl text-white/50 max-w-2xl text-center leading-relaxed"
          >
            A powerfully constructed framework designed to scale your operations instantly. 
            Connect without limits.
          </motion.p>
        </div>

        {/* 3-Column Image-Matched Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          
          {/* Left Column - Slightly shifted up on mobile, low down on desktop */}
          <div className="flex flex-col gap-8 lg:translate-y-12">
             {leftCol.map((f, i) => <FeatureCard key={f.title} feature={f} idx={i} />)}
          </div>

          {/* Center Column - Taller, Elevated prominently like the mobile phone UI */}
          <div className="flex flex-col gap-8 relative z-10 lg:-translate-y-8">
             {/* Center glow behind the main column */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
             {midCol.map((f, i) => <FeatureCard key={f.title} feature={f} idx={i + 2} />)}
          </div>

          {/* Right Column - Mirrors Left side */}
          <div className="flex flex-col gap-8 lg:translate-y-12">
             {rightCol.map((f, i) => <FeatureCard key={f.title} feature={f} idx={i + 4} />)}
          </div>

        </div>
      </div>
    </section>
  )
}
