"use client"

import { usePathname } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

const pageTitles: Record<string, string> = {
  // Employee routes
  "/employee/dashboard": "Dashboard",
  "/employee/leads": "My Leads",
  "/employee/calls": "My Calls",
  "/employee/quotations": "Quotations",
  "/employee/marketing-assets": "Marketing Assets",
  "/employee/knowledge-base": "Knowledge Base",
  "/employee/messaging-templates": "Messaging Templates",
  "/employee/team": "Team",
  "/employee/profile": "My Profile",
  "/employee/settings": "Settings",
  "/employee/documents": "My Documents",
  // Admin routes
  "/admin/dashboard": "Dashboard",
  "/admin/tasks": "Tasks",
  "/admin/calendar": "Calendar",
  "/admin/messages": "Messages",
  "/admin/analytics": "Analytics",
  "/admin/team": "Team Management",
  "/admin/team/employees": "Employees",
  "/admin/team/departments": "Departments",
  "/admin/team/permissions": "Roles & Permissions",
  "/admin/leads-overview": "Leads Overview",
  "/admin/leads-overview/distribution": "Lead Distribution",
  "/admin/leads-overview/analytics": "Lead Analytics",
  "/admin/leads-overview/rules": "Assignment Rules",
  "/admin/reports": "Reports",
  "/admin/companies": "Companies",
  "/admin/settings": "System Settings",
}

export function SiteHeader() {
  const pathname = usePathname()
  const title = pageTitles[pathname] || "Dashboard"

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-background z-30 sticky top-0 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) w-full max-w-full overflow-hidden">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6 min-w-0">
        <SidebarTrigger className="-ml-1 shrink-0" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4 shrink-0 hidden sm:flex"
        />
        <h1 className="text-base font-medium truncate min-w-0 flex-1">{title}</h1>
      </div>
    </header>
  )
}
