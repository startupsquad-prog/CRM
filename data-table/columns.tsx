import { ColumnDef } from "@tanstack/react-table"
import { User } from "@/types/user"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DataTableColumnHeader } from "./data-table-column-header"
import { DataTableRowActions } from "./data-table-row-actions"
import { Shield, Crown, User as UserIcon, Edit, Trash2 } from "lucide-react"
import { getUserAvatarUrl, getInitials } from "@/lib/avatar"

export const createColumns = (
  onViewUser?: (user: User) => void,
  onEditUser?: (user: User) => void,
  onDeleteUser?: (user: User) => void
): ColumnDef<User>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "full_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      const user = row.original
      const avatarUrl = getUserAvatarUrl(user)
      const initials = getInitials(user.full_name, user.email)
      
      return (
        <div className="flex items-center gap-2">
          <div 
            className="w-7 h-7 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onViewUser?.(user)}
          >
            <img 
              src={avatarUrl} 
              alt={`${user.full_name || user.email} avatar`}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to initials if image fails to load
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                const parent = target.parentElement
                if (parent) {
                  parent.innerHTML = `<span class="text-xs font-medium">${initials}</span>`
                }
              }}
            />
          </div>
          <div>
            <div 
              className="font-medium text-sm cursor-pointer hover:text-primary transition-colors"
              onClick={() => onViewUser?.(user)}
            >
              {user.full_name || 'No name'}
            </div>
            <div className="text-xs text-muted-foreground">{user.email}</div>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "role_id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ row }) => {
      const role = row.getValue("role_id") as string
      const getRoleIcon = (role: string) => {
        switch (role) {
          case 'owner': return <Shield className="h-3 w-3" />
          case 'admin': return <Crown className="h-3 w-3" />
          default: return <UserIcon className="h-3 w-3" />
        }
      }
      
      const getRoleVariant = (role: string) => {
        switch (role) {
          case 'owner': return 'default' as const
          case 'admin': return 'secondary' as const
          default: return 'outline' as const
        }
      }

      const getRoleColor = (role: string) => {
        switch (role) {
          case 'owner': return 'bg-red-100 text-red-800 border-red-200'
          case 'admin': return 'bg-blue-100 text-blue-800 border-blue-200'
          case 'client': return 'bg-green-100 text-green-800 border-green-200'
          default: return ''
        }
      }

      return (
        <Badge 
          variant={getRoleVariant(role)} 
          className={`flex items-center gap-1 text-xs ${getRoleColor(role)}`}
        >
          {getRoleIcon(role)}
          {role}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "plan",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Plan" />
    ),
    cell: ({ row }) => {
      const plan = row.getValue("plan") as string
      const getPlanVariant = (plan: string) => {
        switch (plan) {
          case 'enterprise': return 'default' as const
          case 'pro': return 'secondary' as const
          default: return 'outline' as const
        }
      }

      const getPlanColor = (plan: string) => {
        switch (plan) {
          case 'free': return 'bg-gray-100 text-gray-800 border-gray-200'
          case 'pro': return 'bg-purple-100 text-purple-800 border-purple-200'
          case 'enterprise': return 'bg-orange-100 text-orange-800 border-orange-200'
          default: return ''
        }
      }

      return (
        <Badge 
          variant={getPlanVariant(plan)} 
          className={`text-xs ${getPlanColor(plan)}`}
        >
          {plan}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Joined" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"))
      return (
        <div className="text-sm">
          {date.toLocaleDateString()}
        </div>
      )
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const user = row.original
      
      return (
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditUser?.(user)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit user</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => onDeleteUser?.(user)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete user</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <DataTableRowActions row={row} />
        </div>
      )
    },
    enableHiding: false,
  },
]

// Export default columns for backward compatibility
export const columns = createColumns()
