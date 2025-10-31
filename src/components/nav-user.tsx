"use client"

import { UserButton } from "@clerk/nextjs"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string | null
  }
}) {
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U'

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="flex items-center gap-2 px-2 py-1.5 w-full relative group/item">
          <div className="flex flex-1 items-center gap-2 min-w-0 group-data-[collapsible=icon]:justify-center">
            <Avatar className="h-8 w-8 rounded-lg flex-shrink-0">
              <AvatarImage src={user.avatar || undefined} alt={user.name} />
              <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight min-w-0 group-data-[collapsible=icon]:hidden">
              <span className="truncate font-medium">{user.name}</span>
              <span className="text-muted-foreground truncate text-xs">
                {user.email}
              </span>
            </div>
          </div>
          <div className="relative flex-shrink-0 group-data-[collapsible=icon]:absolute group-data-[collapsible=icon]:right-2">
            <UserButton 
              appearance={{
                elements: {
                  userButtonPopoverCard: {
                    zIndex: 9999,
                  },
                  userButtonPopoverRoot: {
                    zIndex: 9999,
                  },
                  userButtonPopover: {
                    zIndex: 9999,
                  },
                },
              }}
            />
          </div>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
