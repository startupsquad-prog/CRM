import { redirect } from "next/navigation"
import { requireAuth, getUserRole } from "@/lib/clerk-auth"

export default async function EmployeeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAuth()
  const role = await getUserRole()

  // Redirect admin users to admin portal
  if (role === 'admin') {
    redirect('/admin/dashboard')
  }

  return <>{children}</>
}

