"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  Settings,
  BarChart3,
  Calendar,
  MessageSquare,
  Briefcase,
  Shield,
} from "lucide-react"
import { useUser } from "@clerk/nextjs"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

function getNavItems(role: 'admin' | 'employee' | null) {
  const baseItems = [
    {
      title: "Dashboard",
      url: role === 'admin' ? "/admin/dashboard" : "/employee/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Tasks",
      url: role === 'admin' ? "/admin/tasks" : "/employee/tasks",
      icon: Briefcase,
      items: [
        {
          title: "My Tasks",
          url: role === 'admin' ? "/admin/tasks" : "/employee/tasks",
        },
        {
          title: "Completed",
          url: role === 'admin' ? "/admin/tasks/completed" : "/employee/tasks/completed",
        },
      ],
    },
    {
      title: "Calendar",
      url: role === 'admin' ? "/admin/calendar" : "/employee/calendar",
      icon: Calendar,
    },
    {
      title: "Messages",
      url: role === 'admin' ? "/admin/messages" : "/employee/messages",
      icon: MessageSquare,
    },
  ]

  if (role === 'admin') {
    return [
      ...baseItems,
      {
        title: "Analytics",
        url: "/admin/analytics",
        icon: BarChart3,
      },
      {
        title: "Team Management",
        url: "/admin/team",
        icon: Users,
        items: [
          {
            title: "Employees",
            url: "/admin/team/employees",
          },
        ],
      },
      {
        title: "Companies",
        url: "/admin/companies",
        icon: Building2,
      },
      {
        title: "Reports",
        url: "/admin/reports",
        icon: FileText,
      },
    ]
  }

  return baseItems
}

function getDocuments(role: 'admin' | 'employee' | null) {
  if (role === 'admin') {
    return [
      {
        name: "Team Directory",
        url: "/admin/team/employees",
        icon: Users,
      },
      {
        name: "Reports",
        url: "/admin/reports",
        icon: FileText,
      },
    ]
  }

  return [
    {
      name: "My Documents",
      url: "/employee/documents",
      icon: FileText,
    },
  ]
}

function getNavSecondary(role: 'admin' | 'employee' | null) {
  return [
    {
      title: "Settings",
      url: role === 'admin' ? "/admin/settings" : "/employee/settings",
      icon: Settings,
    },
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser()
  const role = (user?.publicMetadata?.role as 'admin' | 'employee') ?? 'employee'
  
  const navItems = React.useMemo(() => getNavItems(role), [role])
  const documents = React.useMemo(() => getDocuments(role), [role])
  const navSecondary = React.useMemo(() => getNavSecondary(role), [role])

  const userData = React.useMemo(() => {
    if (!user) {
      return {
        name: "Guest",
        email: "",
        avatar: "",
      }
    }
    
    return {
      name: user.fullName || user.firstName || user.emailAddresses[0]?.emailAddress || "User",
      email: user.emailAddresses[0]?.emailAddress || "",
      avatar: user.imageUrl || "",
    }
  }, [user])

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/">
                <Shield className="!size-5" />
                <span className="text-base font-semibold">CRM System</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
        <NavDocuments items={documents} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
