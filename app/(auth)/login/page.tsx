"use client"

import { useEffect, useMemo, useState, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Cpu, Eye, EyeOff, ArrowRight } from "lucide-react"
import {
  getOAuthStartUrl,
  getAuthMe,
  loginWithPassword,
  roleToDashboardPath,
  selectUserRole,
  type UserRole,
} from "@/lib/auth-api"

const roleLabels: Record<UserRole, string> = {
  creator: "Creator",
  buyer: "Buyer",
  "node-operator": "Node Operator",
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isOAuthProcessing, setIsOAuthProcessing] = useState(false)
  const [selectedRole, setSelectedRole] = useState<UserRole>("creator")
  const [errorMessage, setErrorMessage] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })

  const roleFromQuery = useMemo(() => {
    const role = searchParams.get("role")
    if (role === "creator" || role === "buyer" || role === "node-operator") {
      return role as UserRole
    }
    return null
  }, [searchParams])

  useEffect(() => {
    const pendingRole = localStorage.getItem("pendingRole")
    if (roleFromQuery) {
      setSelectedRole(roleFromQuery)
      return
    }

    if (pendingRole === "creator" || pendingRole === "buyer" || pendingRole === "node-operator") {
      setSelectedRole(pendingRole)
    }
  }, [roleFromQuery])

  useEffect(() => {
    let isCancelled = false

    const handleOAuthReturn = async () => {
      if (typeof window === "undefined") return
      const hash = window.location.hash
      if (!hash.startsWith("#")) return

      setIsOAuthProcessing(true)
      setErrorMessage("")

      const params = new URLSearchParams(hash.slice(1))
      const accessToken = params.get("access_token")
      if (!accessToken) {
        if (!isCancelled) setIsOAuthProcessing(false)
        return
      }

      const pendingRole = localStorage.getItem("pendingRole")
      const roleFromStorage: UserRole | null =
        pendingRole === "creator" || pendingRole === "buyer" || pendingRole === "node-operator"
          ? pendingRole
          : null
      const roleToPersist = roleFromQuery ?? roleFromStorage ?? selectedRole

      try {
        localStorage.setItem("accessToken", accessToken)

        let effectiveRole: UserRole = roleToPersist

        const me = await getAuthMe(accessToken)
        const apiRole = me.user?.role
        if (apiRole === "creator" || apiRole === "buyer" || apiRole === "node-operator") {
          effectiveRole = apiRole
        } else {
          await selectUserRole({ role: roleToPersist, accessToken })
          effectiveRole = roleToPersist
        }

        localStorage.setItem("userRole", effectiveRole)
        localStorage.removeItem("pendingRole")
        if (!isCancelled) setSelectedRole(effectiveRole)
      } catch (error) {
        if (!isCancelled) {
          setErrorMessage(error instanceof Error ? error.message : "OAuth login failed")
        }
        if (!isCancelled) setIsOAuthProcessing(false)
        return
      }

      if (!isCancelled) {
        const userRole = localStorage.getItem("userRole")
        const finalRole: UserRole =
          userRole === "creator" || userRole === "buyer" || userRole === "node-operator"
            ? userRole
            : roleToPersist

        window.history.replaceState({}, document.title, window.location.pathname + window.location.search)
        router.replace(roleToDashboardPath(finalRole))
      }

      if (!isCancelled) {
        setIsOAuthProcessing(false)
      }
    }

    handleOAuthReturn()

    return () => {
      isCancelled = true
    }
  }, [roleFromQuery, router, selectedRole])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")
    setIsLoading(true)

    try {
      const loginResponse = await loginWithPassword({
        email: formData.email,
        password: formData.password,
      })

      const accessToken = loginResponse.access_token
      if (!accessToken) {
        throw new Error("Login succeeded but no access token was returned")
      }

      const apiRole = loginResponse.user?.role ?? loginResponse.role
      let effectiveRole = selectedRole

      if (apiRole === "creator" || apiRole === "buyer" || apiRole === "node-operator") {
        effectiveRole = apiRole
      } else {
        await selectUserRole({ role: selectedRole, accessToken })
      }

      localStorage.setItem("accessToken", accessToken)
      localStorage.setItem("userRole", effectiveRole)
      localStorage.removeItem("pendingRole")

      router.push(roleToDashboardPath(effectiveRole))
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = async (provider: "google" | "github") => {
    localStorage.setItem("pendingRole", selectedRole)

    try {
      const { oauth_url } = await getOAuthStartUrl({
        provider,
        role: selectedRole,
        mode: "login",
      })
      window.location.assign(oauth_url)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to start social login")
    }
  }

    return (
      <div className="relative z-10 w-full max-w-2xl px-4 lg:max-w-3xl">
      <div className="text-center mb-10 text-white drop-shadow-[0_0_15px_rgba(139,92,246,0.3)]">
        <Link href="/" className="inline-flex items-center justify-center gap-3 group mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-primary/30 to-primary/5 border border-primary/40 shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 group-hover:shadow-[0_0_40px_rgba(139,92,246,0.8)]">
            <Cpu className="h-6 w-6 text-primary drop-shadow-[0_0_10px_rgba(139,92,246,1)] animate-pulse" />
          </div>
        </Link>
        <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-white to-primary/70">
          Welcome back
        </h2>
        <p className="mt-3 text-sm text-white/70">
          Enter your credentials to access your account
        </p>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-black/45 p-8 shadow-[0_20px_80px_-28px_rgba(15,23,42,0.95),0_0_30px_rgba(139,92,246,0.25)] space-y-7 md:p-10 lg:p-12">
        <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-primary/70 to-transparent" />
        <form onSubmit={handleSubmit} className="space-y-7">
            <div className="space-y-2">
              <Label htmlFor="role" className="text-xs uppercase tracking-wider text-white/70 font-semibold drop-shadow-[0_0_5px_rgba(0,0,0,0.5)]">Role</Label>
              <select
                id="role"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className="h-12 w-full rounded-xl border border-white/20 bg-black/60 px-3 text-sm text-white focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all hover:bg-black/70"
              >
                {Object.entries(roleLabels).map(([value, label]) => (
                  <option key={value} value={value} className="bg-slate-900 text-white">
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs uppercase tracking-wider text-white/70 font-semibold drop-shadow-[0_0_5px_rgba(0,0,0,0.5)]">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="h-12 bg-black/60 text-white placeholder-white/40 border-white/20 focus:border-primary/80 focus:ring-primary/40 transition-all rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs uppercase tracking-wider text-white/70 font-semibold drop-shadow-[0_0_5px_rgba(0,0,0,0.5)]">Password</Label>
                <Link href="/forgot-password" className="text-xs font-medium text-primary hover:text-primary/80 transition-colors drop-shadow-[0_0_5px_rgba(139,92,246,0.3)]">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="h-12 bg-black/60 text-white placeholder-white/40 border-white/20 focus:border-primary/80 focus:ring-primary/40 transition-all rounded-xl pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {errorMessage && (
              <p className="rounded-lg border border-red-400/50 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {errorMessage}
              </p>
            )}

            <Button 
              type="submit" 
              className="mt-4 h-12 w-full rounded-xl bg-linear-to-r from-primary to-primary/80 text-lg font-semibold text-primary-foreground shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all hover:from-primary/90 hover:to-primary/70 hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]"
              disabled={isLoading || isOAuthProcessing}
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
              ) : (
                <>
                  Sign in
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-wider">
                <span className="rounded-full border border-white/10 bg-black/70 px-3 text-white/50 font-semibold">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Button
                type="button"
                onClick={() => handleSocialLogin("google")}
                variant="outline"
                disabled={isOAuthProcessing}
                className="h-12 rounded-xl border-white/20 bg-black/45 text-white transition-all hover:scale-[1.02] hover:border-white/40 hover:bg-black/60"
              >
                <svg className="mr-2 h-4 w-4 text-white" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </Button>
              <Button
                type="button"
                onClick={() => handleSocialLogin("github")}
                variant="outline"
                disabled={isOAuthProcessing}
                className="h-12 rounded-xl border-white/20 bg-black/45 text-white transition-all hover:scale-[1.02] hover:border-white/40 hover:bg-black/60"
              >
                <svg className="mr-2 h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </Button>
            </div>

            {isOAuthProcessing && (
              <p className="mt-4 text-center text-sm text-white/50">Completing social login and redirecting...</p>
            )}
          </div>
        </div>
        
        <p className="mt-8 text-center text-sm text-white/50">
          Don&apos;t have an account?{" "}
          <Link href="/select-role" className="font-semibold text-white hover:text-primary transition-colors drop-shadow-[0_0_5px_rgba(139,92,246,0.3)]">
            Sign up here free
          </Link>
        </p>
      </div>
  )
}

export default function LoginPage() { return <Suspense fallback={<div className="z-10 text-primary">Loading...</div>}><LoginForm /></Suspense>; }
