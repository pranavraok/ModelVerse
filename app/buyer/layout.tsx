import { DashboardSidebar } from "@/components/dashboard/sidebar"

export default function BuyerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#050505] relative overflow-hidden">
      {/* Subtle Abstract Glows */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[60vw] h-[60vw] rounded-full bg-violet-600/5 blur-[140px] mix-blend-screen" />
        <div className="absolute bottom-[10%] -right-[10%] w-[50vw] h-[50vw] rounded-full bg-blue-600/[0.02] blur-[120px] mix-blend-screen" />
      </div>

      <div className="relative z-10 w-full min-h-screen">
        <DashboardSidebar role="buyer" />
        <main className="pl-80 w-full h-full min-h-screen">
          {children}
        </main>
      </div>
    </div>
  )
}
