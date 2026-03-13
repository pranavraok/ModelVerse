"use client"

import { useMemo, useState, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Cpu, Eye, EyeOff, ArrowRight } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import type { UserRole } from "@/lib/auth-api"

const roleLabels: Record<UserRole, string> = {
  creator: "Creator",
  buyer: "Buyer",
  "node-operator": "Node Operator",
}

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const role = searchParams.get('role')
  const selectedRole = useMemo<UserRole>(() => {
    if (role === "creator" || role === "buyer" || role === "node-operator") {
      return role
    }
    return "buyer"
  }, [role])
  
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  
  // Node Operator specifics
  const [showNodeModal, setShowNodeModal] = useState(false)
  const [nodeName, setNodeName] = useState("My Laptop Node")
  const [stakeAmount, setStakeAmount] = useState([10])
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  })

  // Handles finishing the local signup process or showing the node setup modal.
  const handleAuthAction = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setErrorMessage("")
    setIsLoading(true)
    
    // Simulate API call for form validation / social auth init
    await new Promise(resolve => setTimeout(resolve, 800))
    
    if (selectedRole === "node-operator") {
      setIsLoading(false)
      setShowNodeModal(true)
    } else {
      finalizeSignup()
    }
  }

  // Completes the final redirect
  const finalizeSignup = async () => {
    setIsLoading(true);
    // Simulate final API registration step
    await new Promise(resolve => setTimeout(resolve, 800))
    setIsLoading(false)

    // Store user data temporarily (in real app, this would be server-side)
    localStorage.setItem('pendingUser', JSON.stringify({ ...formData, role: selectedRole }))
    
    // Redirect based on role
    if (selectedRole === "creator") {
      router.push('/creator')
    } else if (selectedRole === "buyer") {
      router.push('/buyer')
    } else {
      router.push('/node-operator')
    }
  }

  return (
    <>
      <div className="w-full max-w-md px-6 py-12 z-10">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center justify-center gap-3 group">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-primary/30 to-primary/5 border border-primary/20 shadow-[0_0_20px_rgba(139,92,246,0.2)] transition-transform group-hover:scale-105">
              <Cpu className="h-6 w-6 text-primary" />
            </div>
          </Link>
          <h2 className="mt-8 text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/70">
            Create {selectedRole ? roleLabels[selectedRole] : ""} account
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Join the decentralized AI economy as a <span className="font-semibold text-primary capitalize">{selectedRole.replace('-', ' ')}</span>
          </p>
        </div>

        <div className="relative rounded-3xl border border-border/50 bg-card/40 px-8 py-10 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleAuthAction} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="h-12 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="h-12 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="h-12 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all rounded-xl pr-12"
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-1 text-xs text-muted-foreground/80">
                Must be at least 8 characters
              </p>
            </div>

            {errorMessage && (
              <p className="rounded-lg border border-red-400/50 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {errorMessage}
              </p>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl bg-linear-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] font-medium text-lg mt-4"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
              ) : (
                <>
                  Continue
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-wider">
                <span className="bg-card/40 px-3 text-muted-foreground font-semibold backdrop-blur-md">Or continue with</span>
              </div>
            </div>

            <div className={`mt-6 grid gap-4 ${selectedRole === "buyer" ? "grid-cols-1" : "grid-cols-2"}`}>
              <Button 
                variant="outline" 
                onClick={() => handleAuthAction()}
                disabled={isLoading}
                className="h-12 rounded-xl border-border/50 bg-background/30 hover:bg-background/50 hover:border-border/80 transition-all">
                <svg className="mr-2 h-4 w-4 text-foreground/80" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </Button>
              {selectedRole !== "buyer" && (
                <Button 
                  variant="outline" 
                  onClick={() => handleAuthAction()}
                  disabled={isLoading}
                  className="h-12 rounded-xl border-border/50 bg-background/30 hover:bg-background/50 hover:border-border/80 transition-all">
                  <svg className="mr-2 h-4 w-4 text-foreground/80" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub
                </Button>
              )}
            </div>
          </div>
          
          <p className="mt-6 text-center text-[11px] text-muted-foreground/80 max-w-[80%] mx-auto">
            By signing up, you agree to our{" "}
            <Link href="/terms" className="font-medium text-foreground hover:text-primary transition-colors">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="font-medium text-foreground hover:text-primary transition-colors">
              Privacy Policy
            </Link>
          </p>
        </div>
        
        <p className="mt-8 text-center text-sm text-muted-foreground/80">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-foreground hover:text-primary transition-colors">
            Sign in here
          </Link>
        </p>
      </div>

      {/* Node Operator Setup Modal */}
      <Dialog open={showNodeModal} onOpenChange={setShowNodeModal}>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>Configure Your Node</DialogTitle>
            <DialogDescription>
              We&apos;ve auto-detected your system hardware. Customize your node name and set your initial stake to proceed.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
              <Cpu className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Auto-detected Hardware</p>
                <p className="text-xs text-muted-foreground">CPU cores = 8, RAM = 16GB</p>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="node-name">Node Name</Label>
              <Input
                id="node-name"
                value={nodeName}
                onChange={(e) => setNodeName(e.target.value)}
                placeholder="e.g. My Awesome Node"
              />
            </div>
            
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <Label>Set Stake</Label>
                <span className="text-sm font-medium text-primary">{stakeAmount[0]} MATIC</span>
              </div>
              <Slider
                value={stakeAmount}
                onValueChange={setStakeAmount}
                max={100}
                min={10}
                step={5}
                className="my-2"
              />
              <p className="text-xs text-muted-foreground">
                Minimum stake is 10 MATIC to ensure network security.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
               className="w-full bg-primary hover:bg-primary/90" 
               onClick={finalizeSignup}
               disabled={isLoading}
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              ) : (
                "Complete Setup"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      {/* Background effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 right-1/4 h-125 w-125 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/4 h-150 w-150 translate-x-1/4 translate-y-1/4 rounded-full bg-accent/20 blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 h-100 w-100 -translate-x-1/2 -translate-y-1/2 rounded-full bg-chart-4/10 blur-[100px]" />
      </div>

      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.15] z-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)`,
          backgroundSize: '48px 48px'
        }}
      />

      <Suspense fallback={<div className="z-10 text-primary">Loading...</div>}>
         <SignupForm />
      </Suspense>
    </div>
  )
}
