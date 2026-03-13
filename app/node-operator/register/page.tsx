"use client"

/**
 * FILE: app/node-operator/register/page.tsx
 *
 * Registration now happens automatically at login/signup.
 * Anyone landing here gets redirected to the nodes dashboard immediately.
 */

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 }   from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/node-operator/nodes")
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center gap-3 text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span className="text-sm">Redirecting to dashboard…</span>
    </div>
  )
}