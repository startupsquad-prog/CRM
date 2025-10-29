import { redirect } from "next/navigation"
import { getUserRole, requireAuth } from "@/lib/clerk-auth"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAuth()
  const role = await getUserRole()

  // Redirect if not admin
  if (role !== 'admin') {
    redirect('/employee/dashboard')
  }

  return <>{children}</>
}

