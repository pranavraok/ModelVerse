"use client"

import { useState } from "react"
import Link from "next/link"
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
    
    router.push(`/signup?role=${selectedRole}`)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      {/* Background effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-accent/10 blur-[100px]" />
      </div>

      <div className="w-full max-w-6xl z-10">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
            <Cpu className="h-5 w-5 text-primary" />
          </div>
          <span className="text-xl font-semibold tracking-tight">NeuralMarket</span>
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Choose your role
          </h1>
          <p className="mt-2 text-muted-foreground">
            Select how you want to use NeuralMarket. You can change this later.
          </p>
        </div>

        {/* Role cards */}
        <div className="grid gap-6 lg:grid-cols-3">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={`group relative rounded-2xl border p-6 text-left transition-all ${
                selectedRole === role.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border/40 bg-card/30 hover:border-border/60 hover:bg-card/50'
              }`}
            >
              {/* Selected indicator */}
              {selectedRole === role.id && (
                <div className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                  <Check className="h-4 w-4 text-primary-foreground" />
                </div>
              )}

              {/* Icon */}
              <div className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${role.gradient}`}>
                <role.icon className="h-7 w-7 text-foreground" />
              </div>

              {/* Title & Description */}
              <h3 className="text-xl font-semibold">{role.title}</h3>
              <p className="mt-1 text-muted-foreground">{role.description}</p>

              {/* Features */}
              <ul className="mt-6 space-y-3">
                {role.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>

        {/* Continue button */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <Button
            size="lg"
            className="w-full max-w-md bg-primary hover:bg-primary/90"
            disabled={!selectedRole || isLoading}
            onClick={handleContinue}
          >
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            ) : (
              <>
                Continue as {selectedRole ? roles.find(r => r.id === selectedRole)?.title : '...'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
          
          <p className="text-sm text-muted-foreground">
            You can switch roles anytime from your dashboard settings
          </p>
        </div>
      </div>
    </div>
  )
}
