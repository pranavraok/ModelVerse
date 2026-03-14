"use client"

import { Twitter, Github, Linkedin, ArrowRight } from "lucide-react"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"

const team = [
  {
    name: "ARJUN BHAT",
    bio: "Previously ML lead at Google. Building the future of decentralized AI.",
    avatar: "AB",
    color: "from-blue-500 to-indigo-500"
  },
  {
    name: "TUSHAR P",
    bio: "Smart contract expert. Ex-Chainlink. Passionate about Web3 infrastructure.",
    avatar: "TP",
    color: "from-emerald-500 to-teal-500"
  },
  {
    name: "PRANAV RAO K",
    bio: "10+ years in product. Previously PM at OpenAI and Anthropic.",
    avatar: "PR",
    color: "from-purple-500 to-pink-500"
  },
  {
    name: "A ANIRUDH",
    bio: "Award-winning designer. Creating intuitive Web3 experiences.",
    avatar: "AA",
    color: "from-orange-500 to-rose-500"
  }
]

export function Team() {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })

  const yBg = useTransform(scrollYProgress, [0, 1], [0, -200])

  return (
    <section id="team" ref={containerRef} className="relative py-32 md:py-48 bg-[#020202] overflow-hidden">
      
      {/* Immersive Background */}
      <motion.div style={{ y: yBg }} className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[120vw] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.15)_0%,transparent_70%)] pointer-events-none mix-blend-screen" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(0,0,0,0.8)_80%,#020202)] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8 z-10">
        
        {/* Animated Header */}
        <div className="mx-auto max-w-2xl text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-medium text-white backdrop-blur-md shadow-2xl"
          >
            <span className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
            The Visionaries
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl font-sans font-bold tracking-tight text-white mb-6"
          >
            Architects of the{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-[length:200%_auto] animate-[gradient_8s_linear_infinite]">
              future
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-white/50 leading-relaxed"
          >
            Our core team brings together decades of experience at the absolute bleeding edge of machine learning, cryptography, and distributed systems.
          </motion.p>
        </div>

        {/* Floating Glass Team Cards */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 relative mt-16">
          {team.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="group relative rounded-[2.5rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl transition-all duration-500 hover:-translate-y-4 hover:bg-white/10 hover:border-white/20 hover:shadow-[0_40px_80px_-20px_rgba(139,92,246,0.15)] overflow-hidden flex flex-col"
            >
              {/* Soft spotlight following hover (CSS simulated) */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              
              {/* Avatar Orbit */}
              <div className="relative mx-auto mb-8 mt-4">
                 <div className="absolute inset-0 rounded-full bg-white/5 blur-xl group-hover:bg-white/20 transition-all duration-500" />
                 <div className={`relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br ${member.color} shadow-inner`}>
                   <span className="text-3xl font-black text-white/90 tracking-tighter mix-blend-overlay">{member.avatar}</span>
                 </div>
                 
                 {/* Decorative Orbit Ring */}
                 <div className="absolute -inset-4 rounded-full border border-white/10 border-dashed animate-[spin_10s_linear_infinite] opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                 <div className="absolute -inset-4 rounded-full border border-white/5 border-t-white/30 animate-[spin_15s_linear_infinite_reverse]" />
              </div>
              
              <div className="text-center relative z-10 flex-grow">
                <h3 className="text-2xl font-semibold text-white mb-2">{member.name}</h3>
                <p className="text-sm text-gray-400 leading-relaxed font-light mb-8">
                  {member.bio}
                </p>
              </div>
              
              {/* Social Links Bar */}
              <div className="mt-auto flex justify-center gap-4 relative z-10">
                {[Twitter, Github, Linkedin].map((Icon, i) => (
                  <button
                    key={i}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 border border-white/10 text-gray-400 transition-all duration-300 hover:scale-110 hover:bg-white/10 hover:text-white hover:border-white/30"
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                ))}
              </div>

              {/* Shine sweep */}
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent group-hover:animate-[shimmer_2s_ease-in-out_forwards] pointer-events-none" />
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
