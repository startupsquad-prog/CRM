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

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

type NavItem = {
  title: string
  url: string
  icon?: React.ElementType
  isActive?: boolean
  items?: {
    title: string
    url: string
  }[]
}

type Project = {
  name: string
  url: string
  icon: React.ElementType
}

function getNavItems(role: 'admin' | 'employee' | null): NavItem[] {
  const baseItems: NavItem[] = [
    {
      title: "Dashboard",
      url: role === 'admin' ? "/admin/dashboard" : "/employee/dashboard",
      icon: LayoutDashboard,
      isActive: true,
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

  // Admin-only items
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
          {
            title: "Departments",
            url: "/admin/team/departments",
          },
          {
            title: "Roles & Permissions",
            url: "/admin/team/permissions",
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
        items: [
          {
            title: "Sales Reports",
            url: "/admin/reports/sales",
          },
          {
            title: "Performance",
            url: "/admin/reports/performance",
          },
          {
            title: "Analytics",
            url: "/admin/reports/analytics",
          },
        ],
      },
      {
        title: "Settings",
        url: "/admin/settings",
        icon: Settings,
        items: [
          {
            title: "General",
            url: "/admin/settings/general",
          },
          {
            title: "Integrations",
            url: "/admin/settings/integrations",
          },
          {
            title: "Security",
            url: "/admin/settings/security",
          },
        ],
      },
    ]
  }

  // Employee items
  return [
    ...baseItems,
    {
      title: "Settings",
      url: "/employee/settings",
      icon: Settings,
      items: [
        {
          title: "Profile",
          url: "/employee/settings/profile",
        },
        {
          title: "Preferences",
          url: "/employee/settings/preferences",
        },
      ],
    },
  ]
}

function getProjects(role: 'admin' | 'employee' | null): Project[] {
  if (role === 'admin') {
    return [
      {
        name: "Sales Pipeline",
        url: "/admin/projects/sales",
        icon: BarChart3,
      },
      {
        name: "Customer Support",
        url: "/admin/projects/support",
        icon: MessageSquare,
      },
      {
        name: "Marketing",
        url: "/admin/projects/marketing",
        icon: FileText,
      },
    ]
  }

  return [
    {
      name: "My Projects",
      url: "/employee/projects",
      icon: Briefcase,
    },
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser()
  const role = (user?.publicMetadata?.role as 'admin' | 'employee') ?? 'employee'
  
  const navItems = React.useMemo(() => getNavItems(role), [role])
  const projects = React.useMemo(() => getProjects(role), [role])

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
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="px-2 py-1">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sm">CRM System</span>
          </div>
          {role === 'admin' && (
            <span className="text-xs text-muted-foreground mt-1 block">Admin Portal</span>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
        <NavProjects projects={projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
