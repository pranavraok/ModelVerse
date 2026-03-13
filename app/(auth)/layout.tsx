import { AuthCanvas } from "@/components/ui/auth-canvas"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthCanvas>
      {children}
    </AuthCanvas>
  )
}
