"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"

export default function NodeOperatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const role = localStorage.getItem('userRole')
    if (role !== 'node-operator') {
      router.push('/login')
    } else {
      setIsReady(true)
    }
  }, [router])

  if (!isReady) return null

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <DashboardSidebar role="node-operator" />
      <main className="flex-1 pl-64 transition-all duration-300">
        {children}
      </main>
    </div>
  )
}
