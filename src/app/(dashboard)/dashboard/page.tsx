import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { getUserRole } from "@/lib/clerk-auth"

export default async function DashboardPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/marketing')
  }

  const role = await getUserRole()
  
  // Redirect based on role
  if (role === 'admin') {
    redirect('/admin/dashboard')
  }
  
  redirect('/employee/dashboard')
}
