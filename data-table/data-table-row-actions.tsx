"use client"

import { Row } from "@tanstack/react-table"
import { User } from "@/types/user"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Copy, UserPlus } from "lucide-react"
import { createSupabaseBrowser } from "@/utils/supabase/client"
import { toast } from "sonner"

interface DataTableRowActionsProps {
  row: Row<User>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const user = row.original
  const supabase = createSupabaseBrowser()

  const handleView = () => {
    // TODO: Implement view functionality
    toast.info(`View user: ${user.full_name}`)
  }

  const handleDuplicate = () => {
    // TODO: Implement duplicate functionality
    toast.info(`Duplicate user: ${user.full_name}`)
  }

  const handleInvite = () => {
    // TODO: Implement invite functionality
    toast.info(`Send invite to: ${user.full_name}`)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>More Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={handleView}>
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDuplicate}>
          <Copy className="mr-2 h-4 w-4" />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleInvite}>
          <UserPlus className="mr-2 h-4 w-4" />
          Send Invite
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
