"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  Settings,
  BarChart3,
  Phone,
  Package,
  BookOpen,
  User,
  Receipt,
  MessageSquare,
  Shield,
  TrendingUp,
  Users2,
  Award,
  PieChart,
  ShoppingBag,
} from "lucide-react"
import { useUser } from "@clerk/nextjs"

import { NavMain, type NavGroup, type NavItem } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { NavLeadsCounter } from "@/components/nav-leads-counter"
import { NavCounter } from "@/components/nav-counter"
import Link from "next/link"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

function getEmployeeNavGroups(): NavGroup[] {
  return [
    {
      label: "Navigation",
      items: [
        {
          title: "Home",
          url: "/employee/dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      label: "Sales & Leads",
      items: [
        {
          title: "My Leads",
          url: "/employee/leads",
          icon: TrendingUp,
          badge: <NavLeadsCounter />,
        },
        {
          title: "My Calls",
          url: "/employee/calls",
          icon: Phone,
          badge: <NavCounter apiPath="/api/calls/count" />,
        },
        {
          title: "Quotations",
          url: "/employee/quotations",
          icon: Receipt,
          badge: <NavCounter apiPath="/api/quotations/count" />,
        },
        {
          title: "Orders",
          url: "/employee/orders",
          icon: ShoppingBag,
        },
      ],
    },
    {
      label: "Import Operations",
      items: [
        {
          title: "Collections",
          url: "/employee/collections",
          icon: Package,
        },
        {
          title: "Products",
          url: "/employee/products",
          icon: ShoppingBag,
          badge: <NavCounter apiPath="/api/products/count" />,
        },
        {
          title: "Marketing Assets",
          url: "/employee/marketing-assets",
          icon: Package,
          badge: <NavCounter apiPath="/api/marketing-assets/count" />,
        },
        {
          title: "Knowledge Base",
          url: "/employee/knowledge-base",
          icon: BookOpen,
          badge: <NavCounter apiPath="/api/knowledge-base/count" />,
        },
        {
          title: "Messaging Templates",
          url: "/employee/messaging-templates",
          icon: MessageSquare,
          badge: <NavCounter apiPath="/api/messaging-templates/count" />,
        },
      ],
    },
    {
      label: "Account",
      items: [
        {
          title: "Team",
          url: "/employee/team",
          icon: Users,
        },
        {
          title: "My Profile",
          url: "/employee/profile",
          icon: User,
        },
      ],
    },
  ]
}

function getAdminNavGroups(): NavGroup[] {
  const employeeGroups = getEmployeeNavGroups()
  
  // Add admin-specific groups
  const adminGroups: NavGroup[] = [
    ...employeeGroups,
    {
      label: "Management",
      items: [
        {
          title: "User Management",
          url: "/admin/users",
          icon: Shield,
          items: [
            { title: "All Users", url: "/admin/users" },
            { title: "Groups", url: "/admin/users/groups" },
            { title: "Roles & Permissions", url: "/admin/users/roles" },
          ],
        },
        {
          title: "Team Management",
          url: "/admin/team",
          icon: Users2,
          items: [
            { title: "Employees", url: "/admin/team/employees" },
            { title: "Departments", url: "/admin/team/departments" },
            { title: "Roles & Permissions", url: "/admin/team/permissions" },
          ],
        },
        {
          title: "Leads Overview",
          url: "/admin/leads-overview",
          icon: BarChart3,
          items: [
            { title: "All Leads", url: "/admin/leads-overview" },
            { title: "Lead Distribution", url: "/admin/leads-overview/distribution" },
            { title: "Lead Analytics", url: "/admin/leads-overview/analytics" },
            { title: "Assignment Rules", url: "/admin/leads-overview/rules" },
          ],
        },
        {
          title: "Analytics",
          url: "/admin/analytics",
          icon: PieChart,
        },
        {
          title: "Reports & Metrics",
          url: "/admin/reports",
          icon: FileText,
        },
        {
          title: "Competitor Analysis",
          url: "/admin/competitors",
          icon: Award,
        },
        {
          title: "Suppliers & Factories",
          url: "/admin/suppliers",
          icon: Building2,
        },
        {
          title: "After-Sales Tickets",
          url: "/admin/tickets",
          icon: MessageSquare,
        },
        {
          title: "Companies",
          url: "/admin/companies",
          icon: Building2,
        },
        {
          title: "System Settings",
          url: "/admin/settings",
          icon: Settings,
        },
      ],
    },
  ]

  return adminGroups
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
  
  const navGroups = React.useMemo(() => {
    return role === 'admin' ? getAdminNavGroups() : getEmployeeNavGroups()
  }, [role])
  
  const navSecondary = React.useMemo(() => getNavSecondary(role), [role])

  const userData: {
    name: string
    email: string
    avatar: string | null
  } = React.useMemo(() => {
    if (!user) {
      return {
        name: "Guest",
        email: "",
        avatar: null,
      }
    }
    
    return {
      name: user.fullName || user.firstName || user.emailAddresses[0]?.emailAddress || "User",
      email: user.emailAddresses[0]?.emailAddress || "",
      avatar: user.imageUrl || null,
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
              <Link href={role === 'admin' ? "/admin/dashboard" : "/employee/dashboard"}>
                <Shield className="!size-5" />
                <span className="text-base font-semibold">OLLDeals Import Portal</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain groups={navGroups} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
