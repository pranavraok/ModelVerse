"use client"

/**
 * FILE: app/(auth)/signup/page.tsx
 *
 * Changes from original:
 * - Node-operator role shows wallet connect + stake flow instead of email form
 * - Stake 1 MATIC → auto-register → docker start → redirect to /node-operator/nodes
 * - Buyer / Creator: unchanged (email + OAuth as before)
 * - All original styles, imports, and verification modal preserved exactly
 */

import { useEffect, useMemo, useState, Suspense, useCallback } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Cpu, Eye, EyeOff, ArrowRight, CheckCircle2, Mail,
  Loader2, AlertCircle, Lock,
} from "lucide-react"
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { getOAuthStartUrl, signupWithRole, type UserRole } from "@/lib/auth-api"
import { getBackendUrl } from "@/lib/runtime-env"
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi"
import { parseEther } from "viem"
import { ConnectButton } from "@rainbow-me/rainbowkit"

// ─── env ──────────────────────────────────────────────────────────────────────
const BACKEND_URL = getBackendUrl()

const STAKING_CONTRACT =
  (process.env.NEXT_PUBLIC_STAKING_CONTRACT ??
    "0x0000000000000000000000000000000000000000") as `0x${string}`

const STAKING_ABI = [
  {
    name: "stake",
    type: "function",
    stateMutability: "payable",
    inputs: [],
    outputs: [],
  },
  {
    name: "isNodeActive",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "node", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
  },
] as const

const LS_NODE_KEY = "modelverse_node_registration"

type NodeFlowStep =
  | "idle" | "staking" | "confirming"
  | "registering" | "docker" | "done" | "error"

const roleLabels: Record<UserRole, string> = {
  creator: "Creator",
  buyer: "Buyer",
  "node-operator": "Node Operator",
}

// ─── Node-operator wallet signup flow ────────────────────────────────────────
function NodeOperatorSignupFlow({ selectedRole }: { selectedRole: UserRole }) {
  const router                   = useRouter()
  const { address, isConnected } = useAccount()

  const [step,      setStep]   = useState<NodeFlowStep>("idle")
  const [statusMsg, setStatus] = useState("")
  const [errorMsg,  setError]  = useState("")

  const { data: isAlreadyActive } = useReadContract({
    address:      STAKING_CONTRACT,
    abi:          STAKING_ABI,
    functionName: "isNodeActive",
    args:         address ? [address] : undefined,
    query:        { enabled: !!address },
  })

  const {
    writeContract,
    data:      stakeTx,
    isPending: isStakePending,
    error:     stakeError,
    reset:     resetStake,
  } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: stakeConfirmed } =
    useWaitForTransactionReceipt({ hash: stakeTx })

  useEffect(() => {
    if (isStakePending || isConfirming) setStep("confirming")
  }, [isStakePending, isConfirming])

  useEffect(() => {
    if (stakeConfirmed && stakeTx && step === "confirming") {
      runRegisterAndDocker(stakeTx)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stakeConfirmed, stakeTx])

  const runRegisterAndDocker = useCallback(async (txHash: string) => {
    if (!address) return
    try {
      setStep("registering")
      setStatus("Registering node...")

      const regRes = await fetch(`${BACKEND_URL}/api/nodes/auto-register`, {
        method:  "POST",
        headers: {
          "x-wallet-address": address.toLowerCase(),
          "Content-Type":     "application/json",
        },
        body: JSON.stringify({
          node_name:     `Node-${address.slice(2, 8)}`,
          stake_tx_hash: txHash,
          stake_matic:   1,
        }),
      })
      if (!regRes.ok) throw new Error(`Register failed: HTTP ${regRes.status}`)
      const regData = await regRes.json() as {
        node_id: string; api_key: string; node_name: string
      }

      localStorage.setItem(LS_NODE_KEY, JSON.stringify({
        node_id:       regData.node_id,
        api_key:       regData.api_key,
        node_name:     regData.node_name,
        wallet:        address.toLowerCase(),
        tx_hash:       txHash,
        registered_at: new Date().toISOString(),
      }))
      localStorage.setItem("userRole", "node-operator")

      setStep("docker")
      setStatus("Starting inference daemon...")

      await fetch(`${BACKEND_URL}/api/docker/start`, {
        method:  "POST",
        headers: { "x-wallet-address": address.toLowerCase() },
      }).catch(() => {})

      setStep("done")
      setStatus("Node live!")
      setTimeout(() => router.push("/node-operator/nodes"), 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Setup failed")
      setStep("error")
    }
  }, [address, router])

  const handleStart = () => {
    if (!isConnected || !address) { setError("Connect your wallet first"); return }
    setError("")
    resetStake()
    if (isAlreadyActive) { runRegisterAndDocker("existing-stake"); return }
    setStep("staking")
    writeContract({
      address:      STAKING_CONTRACT,
      abi:          STAKING_ABI,
      functionName: "stake",
      value:        parseEther("1"),
    })
  }

  const isBusy   = ["staking","confirming","registering","docker"].includes(step)
  const stepMap: Partial<Record<NodeFlowStep, string>> = {
    staking:     "1/3 — Confirm stake in wallet...",
    confirming:  "2/3 — Waiting for confirmation...",
    registering: "3/3 — Registering node...",
    docker:      "Starting Docker daemon...",
    done:        "✓ Node live!",
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-1">
        <p className="text-sm font-medium text-white">One-click node setup</p>
        <p className="text-xs text-white/60">
          Connect wallet → stake <strong className="text-primary">1 MATIC</strong> on Polygon Amoy
          → node registered automatically → inference daemon starts.
          No manual setup required.
        </p>
      </div>

      <ConnectButton />

      {isConnected && address && (
        <div className="flex items-center gap-2 text-xs text-white/60 font-mono bg-white/5 rounded-lg px-3 py-2">
          <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
          {address.slice(0, 8)}…{address.slice(-6)}
          {isAlreadyActive && (
            <span className="ml-auto text-green-400 font-sans">✓ Already staked</span>
          )}
        </div>
      )}

      {(isBusy || step === "done") && (
        <div className="flex items-center gap-2 text-sm text-white/70 bg-white/5 rounded-lg px-4 py-3">
          {step === "done"
            ? <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
            : <Loader2 className="h-4 w-4 animate-spin shrink-0" />
          }
          {stepMap[step] ?? statusMsg}
        </div>
      )}

      {(errorMsg || stakeError) && (
        <div className="flex items-start gap-2 text-sm text-red-300 bg-red-500/10 border border-red-400/30 rounded-lg px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          {errorMsg || stakeError?.message?.slice(0, 160)}
        </div>
      )}

      <Button
        onClick={handleStart}
        disabled={!isConnected || isBusy || step === "done"}
        className="w-full h-12 rounded-xl bg-linear-to-r from-primary to-primary/80 text-base font-semibold
                   shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]
                   disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {isBusy
          ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Setting up...</>
          : <><Lock className="mr-2 h-4 w-4" />
              {isAlreadyActive ? "Continue as Node Operator" : "Stake 1 MATIC & Register Node"}
            </>
        }
      </Button>
    </div>
  )
}

// ─── main signup form ─────────────────────────────────────────────────────────
function SignupForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const role         = searchParams.get("role")

  const selectedRole = useMemo<UserRole>(() => {
    if (role === "creator" || role === "buyer" || role === "node-operator") return role
    return "buyer"
  }, [role])

  const [showPassword,          setShowPassword]          = useState(false)
  const [isLoading,             setIsLoading]             = useState(false)
  const [errorMessage,          setErrorMessage]          = useState("")
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [redirectCountdown,     setRedirectCountdown]     = useState(5)
  const [formData,              setFormData]              = useState({ name: "", email: "", password: "" })

  // verification modal countdown — unchanged
  useEffect(() => {
    if (!showVerificationModal) return
    if (redirectCountdown <= 0) return
    const timer = window.setTimeout(() => setRedirectCountdown(prev => prev - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [showVerificationModal, redirectCountdown])

  useEffect(() => {
    if (!showVerificationModal) return
    if (redirectCountdown !== 0) return
    router.push(`/login?role=${selectedRole}`)
  }, [showVerificationModal, redirectCountdown, router, selectedRole])

  const handleManualSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")
    setIsLoading(true)
    try {
      await signupWithRole({ name: formData.name, email: formData.email, password: formData.password, role: selectedRole })
      localStorage.setItem("pendingRole", selectedRole)
      setRedirectCountdown(5)
      setShowVerificationModal(true)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Signup failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialSignup = async (provider: "google" | "github") => {
    setErrorMessage("")
    if ((selectedRole === "buyer" || selectedRole === "node-operator") && provider === "github") {
      setErrorMessage("GitHub signup is available only for creator accounts.")
      return
    }
    localStorage.setItem("pendingRole", selectedRole)
    try {
      const { oauth_url } = await getOAuthStartUrl({ provider, role: selectedRole, mode: "signup" })
      window.location.assign(oauth_url)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to start social signup")
    }
  }

  return (
    <>
      <div className="relative z-10 mx-auto w-full max-w-sm px-4 lg:max-w-md">
        {/* header — unchanged */}
        <div className="text-center mb-10 text-white drop-shadow-[0_0_15px_rgba(139,92,246,0.3)]">
          <Link href="/" className="inline-flex items-center justify-center gap-3 group mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-primary/30 to-primary/5 border border-primary/40 shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 group-hover:shadow-[0_0_40px_rgba(139,92,246,0.8)]">
              <Cpu className="h-6 w-6 text-primary drop-shadow-[0_0_10px_rgba(139,92,246,1)] animate-pulse" />
            </div>
          </Link>
          <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-white to-primary/70">
            Create {selectedRole ? roleLabels[selectedRole] : ""} account
          </h2>
          <p className="mt-3 text-sm text-white/70">
            Join the decentralized AI economy as a{" "}
            <span className="font-semibold text-primary capitalize">{selectedRole.replace("-", " ")}</span>
          </p>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-black/45 p-7 shadow-[0_20px_80px_-28px_rgba(15,23,42,0.95),0_0_30px_rgba(139,92,246,0.25)] space-y-6 md:p-8 lg:p-10">
          <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-primary/70 to-transparent" />

          {/* ── Node-operator: wallet flow ── */}
          {selectedRole === "node-operator" ? (
            <NodeOperatorSignupFlow selectedRole={selectedRole} />
          ) : (
            /* ── Buyer / Creator: original email + social ── */
            <>
              <form onSubmit={handleManualSignup} className="space-y-7">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs uppercase tracking-wider text-white/70 font-semibold drop-shadow-[0_0_5px_rgba(0,0,0,0.5)]">Full Name</Label>
                  <Input id="name" type="text" placeholder="John Doe" value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })} required
                    className="h-12 bg-black/60 text-white placeholder-white/40 border-white/20 focus:border-primary/80 focus:ring-primary/40 transition-all rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs uppercase tracking-wider text-white/70 font-semibold drop-shadow-[0_0_5px_rgba(0,0,0,0.5)]">Email address</Label>
                  <Input id="email" type="email" placeholder="you@example.com" value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })} required
                    className="h-12 bg-black/60 text-white placeholder-white/40 border-white/20 focus:border-primary/80 focus:ring-primary/40 transition-all rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs uppercase tracking-wider text-white/70 font-semibold drop-shadow-[0_0_5px_rgba(0,0,0,0.5)]">Password</Label>
                  <div className="relative">
                    <Input id="password" type={showPassword ? "text" : "password"} placeholder="Create a password"
                      value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                      required minLength={8}
                      className="h-12 bg-black/60 text-white placeholder-white/40 border-white/20 focus:border-primary/80 focus:ring-primary/40 transition-all rounded-xl pr-12" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-white/50">Must be at least 8 characters</p>
                </div>
                <Button type="submit" disabled={isLoading}
                  className="mt-4 h-12 w-full rounded-xl bg-linear-to-r from-primary to-primary/80 text-lg font-semibold text-primary-foreground shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]">
                  {isLoading
                    ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                    : <><ArrowRight className="mr-2 h-5 w-5" />Continue</>
                  }
                </Button>
              </form>

              {/* social */}
              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/20" /></div>
                  <div className="relative flex justify-center text-xs uppercase tracking-wider">
                    <span className="rounded-full border border-white/10 bg-black/70 px-3 text-white/50 font-semibold">Or continue with</span>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Button type="button" variant="outline" onClick={() => handleSocialSignup("google")} disabled={isLoading}
                    className="h-12 rounded-xl border-white/20 bg-black/45 text-white transition-all hover:scale-[1.02] hover:border-white/40 hover:bg-black/60">
                    <svg className="mr-2 h-4 w-4 text-white" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                  </Button>
                  <Button type="button" variant="outline" onClick={() => handleSocialSignup("github")} disabled={isLoading}
                    className="h-12 rounded-xl border-white/20 bg-black/45 text-white transition-all hover:scale-[1.02] hover:border-white/40 hover:bg-black/60">
                    <svg className="mr-2 h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    GitHub
                  </Button>
                </div>
                {errorMessage && (
                  <p className="mt-4 rounded-lg border border-red-400/50 bg-red-500/10 px-3 py-2 text-sm text-red-300">{errorMessage}</p>
                )}
              </div>

              <p className="mt-6 text-center text-[11px] text-white/50 max-w-[80%] mx-auto">
                By signing up, you agree to our{" "}
                <Link href="/terms" className="font-medium text-white hover:text-primary transition-colors">Terms</Link>{" "}
                and{" "}
                <Link href="/privacy" className="font-medium text-white hover:text-primary transition-colors">Privacy Policy</Link>
              </p>
            </>
          )}
        </div>

        <p className="mt-8 text-center text-sm text-white/50">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:text-primary/70 transition-colors drop-shadow-[0_0_5px_rgba(139,92,246,0.5)]">
            Sign in here
          </Link>
        </p>
      </div>

      {/* verification modal — unchanged */}
      <Dialog open={showVerificationModal} onOpenChange={setShowVerificationModal}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" /> Verify Your Email
            </DialogTitle>
            <DialogDescription>
              We sent a verification link to your email. Please verify your account before signing in.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/10 p-4">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Check your inbox and spam folder</p>
                <p className="text-xs text-muted-foreground">After email verification, continue with login.</p>
              </div>
            </div>
            <div className="rounded-xl border border-border/50 bg-background/40 px-4 py-3 text-sm">
              Redirecting to login in{" "}
              <span className="font-semibold text-primary">{redirectCountdown}</span>{" "}
              second{redirectCountdown === 1 ? "" : "s"}.
            </div>
          </div>
          <DialogFooter>
            <Button className="w-full bg-primary hover:bg-primary/90"
              onClick={() => router.push(`/login?role=${selectedRole}`)}>
              Go to Login Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="z-10 text-primary">Loading...</div>}>
      <SignupForm />
    </Suspense>
  )
}