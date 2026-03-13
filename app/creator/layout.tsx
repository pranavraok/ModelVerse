import { DashboardSidebar } from "@/components/dashboard/sidebar"

export default function CreatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar role="creator" />
      <main className="pl-64">
        {children}
      </main>
    </div>
  )
}
