import { redirect } from "next/navigation"
import { getUserRole, requireAuth } from "@/lib/clerk-auth"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

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

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="overflow-hidden">
        <SiteHeader />
        <div className="flex flex-1 flex-col min-h-0 overflow-y-auto overflow-x-hidden w-full max-w-full">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
