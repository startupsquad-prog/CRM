"use client"

import { User } from "@/types/user"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getUserAvatarUrl, getInitials } from "@/lib/avatar"
import { Shield, Crown, User as UserIcon, Edit, Trash2, MoreHorizontal, Mail, Calendar } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DataTableListProps {
  data: User[]
  onEdit?: (user: User) => void
  onDelete?: (user: User) => void
  onView?: (user: User) => void
}

export function DataTableList({ data, onEdit, onDelete, onView }: DataTableListProps) {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Shield className="size-4" />
      case 'admin': return <Crown className="size-4" />
      default: return <UserIcon className="size-4" />
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
    <div className="space-y-3 overflow-y-auto h-full p-4">
      {data.map((user) => {
        const avatarUrl = getUserAvatarUrl(user)
        const initials = getInitials(user.full_name, user.email)
        
        return (
          <Card key={user.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={avatarUrl} alt={`${user.full_name || user.email} avatar`} />
                    <AvatarFallback>
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-base truncate">
                        {user.full_name || 'No name'}
                      </h3>
                      <Badge 
                        variant={getRoleVariant(user.role_id)} 
                        className={`flex items-center gap-1 text-xs ${getRoleColor(user.role_id)}`}
                      >
                        {getRoleIcon(user.role_id)}
                        {user.role_id}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{user.email}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={getPlanVariant(user.plan)} 
                      className={`text-xs ${getPlanColor(user.plan)}`}
                    >
                      {user.plan}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit?.(user)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete?.(user)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>More Actions</DropdownMenuLabel>
                      {onView && (
                        <DropdownMenuItem onClick={() => onView(user)}>
                          View Details
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
      
      {data.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <UserIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No users found</p>
          <p className="text-sm">Try adjusting your filters or search terms</p>
        </div>
      )}
    </div>
  )
}
