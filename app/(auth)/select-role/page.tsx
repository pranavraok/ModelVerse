"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Cpu, Upload, ShoppingCart, ArrowRight, Check } from "lucide-react"

const roles = [
  {
    id: "creator",
    title: "Creator",
    description: "Upload and monetize your AI models",
    icon: Upload,
    features: [
      "Upload AI models to IPFS",
      "Set your own pricing",
      "Earn crypto payments instantly",
      "Access analytics dashboard",
      "Build your reputation"
    ],
    gradient: "from-primary/20 to-primary/5"
  },
  {
    id: "buyer",
    title: "Buyer",
    description: "Discover and run AI models",
    icon: ShoppingCart,
    features: [
      "Browse thousands of AI models",
      "Test models before buying",
      "Pay with crypto securely",
      "Track job status in real-time",
      "Download inference results"
    ],
    gradient: "from-accent/20 to-accent/5"
  },
  {
    id: "node-operator",
    title: "Node Operator",
    description: "Provide compute and earn rewards",
    icon: Cpu,
    features: [
      "Host AI models on your hardware",
      "Earn rewards for every inference",
      "Scale your compute globally",
      "Monitor node performance",
      "Contribute to decentralization"
    ],
    gradient: "from-chart-4/20 to-chart-4/5"
  }
]

export default function SelectRolePage() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleContinue = async () => {
    if (!selectedRole) return
    
    setIsLoading(true)
    
    // Keep selected role for signup/login prefill.
    localStorage.setItem('pendingRole', selectedRole)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Redirect to signup with selected role
    router.push(`/signup?role=${selectedRole}`)
  }

  return (
    <div className="w-full max-w-6xl z-10 relative">
      {/* Logo */}
      <Link href="/" className="mb-8 flex items-center justify-center drop-shadow-[0_0_15px_rgba(139,92,246,0.3)]">
        <Image
          src="/logo.png"
          alt="ModelVerse"
          width={280}
          height={76}
          className="h-16 w-auto"
          priority
        />
      </Link>

      {/* Header */}
      <div className="text-center mb-12 drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">
          Choose your role
        </h1>
        <p className="mt-2 text-white/70">
          Select how you want to use the platform. You can change this later.
        </p>
      </div>

      {/* Role cards */}
      <div className="grid gap-6 lg:grid-cols-3">
        {roles.map((role) => (
          <button
            key={role.id}
            onClick={() => setSelectedRole(role.id)}
            className={`group relative rounded-3xl border p-6 text-left transition-all duration-300 overflow-hidden ${
              selectedRole === role.id
                ? 'border-primary/80 bg-primary/20 shadow-[0_0_30px_rgba(139,92,246,0.4)] scale-105'
                : 'border-white/10 bg-black/40 hover:border-white/30 hover:bg-black/60 hover:shadow-[0_0_25px_rgba(255,255,255,0.1)] hover:-translate-y-2'
            }`}
          >
            {/* Selected indicator */}
            {selectedRole === role.id && (
              <div className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full bg-primary shadow-[0_0_10px_rgba(139,92,246,0.8)]">
                <Check className="h-4 w-4 text-primary-foreground" />
              </div>
            )}

            {/* Glowing orb behind icon */}
            <div className={`absolute -top-10 -left-10 h-32 w-32 rounded-full blur-[40px] opacity-40 mix-blend-screen bg-linear-to-br ${role.gradient} transition-all duration-500 group-hover:opacity-80`} />

            {/* Icon */}
            <div className={`mb-4 relative inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br ${role.gradient} border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.5)]`}>
              <role.icon className="h-7 w-7 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
            </div>

            {/* Title & Description */}
            <h3 className="text-xl font-bold text-white relative z-10">{role.title}</h3>
            <p className="mt-1 text-white/60 relative z-10">{role.description}</p>

            {/* Features */}
            <ul className="mt-6 space-y-3 relative z-10">
              {role.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-white/80">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 border border-primary/30">
                    <Check className="h-3 w-3 text-primary drop-shadow-[0_0_5px_rgba(139,92,246,0.8)]" />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>
          </button>
        ))}
      </div>

      {/* Continue button */}
      <div className="mt-10 flex flex-col items-center gap-4 relative z-10">
        <Button
          size="lg"
          className="w-full max-w-md h-14 text-lg font-semibold rounded-2xl bg-linear-to-r from-primary to-primary/80 text-primary-foreground shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
          disabled={!selectedRole || isLoading}
          onClick={handleContinue}
        >
          {isLoading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
          ) : (
            <>
              Continue as {selectedRole ? roles.find(r => r.id === selectedRole)?.title : '...'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>
        
        <p className="text-sm text-white/50 text-center drop-shadow-[0_0_5px_rgba(0,0,0,0.8)]">
          You can switch roles anytime from your dashboard settings
        </p>
      </div>
    </div>
  )
}
