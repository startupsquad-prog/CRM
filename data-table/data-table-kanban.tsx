"use client"

import React, { useState } from "react"
import { User } from "@/types/user"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getUserAvatarUrl, getInitials } from "@/lib/avatar"
import { Shield, Crown, User as UserIcon, Edit, Trash2, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { toast } from "sonner"

interface DataTableKanbanProps {
  data: User[]
  onEdit?: (user: User) => void
  onDelete?: (user: User) => void
  onView?: (user: User) => void
  onRoleChange?: (userId: string, newRole: string) => void
}

interface SortableUserCardProps {
  user: User
  onEdit?: (user: User) => void
  onDelete?: (user: User) => void
  onView?: (user: User) => void
}

interface KanbanColumn {
  id: string
  title: string
  users: User[]
  color: string
}

function SortableUserCard({ user, onEdit, onDelete, onView }: SortableUserCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: user.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const avatarUrl = getUserAvatarUrl(user)
  const initials = getInitials(user.full_name, user.email)

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
    <Card 
      ref={setNodeRef}
      style={style}
      className={`bg-white shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-50' : ''
      }`}
      {...attributes}
      {...listeners}
      onClick={() => onView?.(user)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={avatarUrl} alt={`${user.full_name || user.email} avatar`} />
              <AvatarFallback className="text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">
                {user.full_name || 'No name'}
              </h4>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              {onView && (
                <DropdownMenuItem onClick={() => onView(user)}>
                  View Details
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(user)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem 
                  onClick={() => onDelete(user)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex items-center justify-between">
          <Badge 
            variant={getPlanVariant(user.plan)} 
            className={`text-xs ${getPlanColor(user.plan)}`}
          >
            {user.plan}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {new Date(user.created_at).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

export function DataTableKanban({ data, onEdit, onDelete, onView, onRoleChange }: DataTableKanbanProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [localData, setLocalData] = useState<User[]>(data)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Update local data when props change
  React.useEffect(() => {
    setLocalData(data)
  }, [data])

  // Group users by role
  const columns: KanbanColumn[] = [
    {
      id: "owner",
      title: "Owners",
      users: localData.filter(user => user.role_id === "owner"),
      color: "bg-red-50 border-red-200"
    },
    {
      id: "admin", 
      title: "Admins",
      users: localData.filter(user => user.role_id === "admin"),
      color: "bg-blue-50 border-blue-200"
    },
    {
      id: "client",
      title: "Clients", 
      users: localData.filter(user => user.role_id === "client"),
      color: "bg-green-50 border-green-200"
    }
  ]

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Find the user being dragged
    const draggedUser = localData.find(user => user.id === activeId)
    if (!draggedUser) return

    // Find the target column (role)
    const targetColumn = columns.find(col => col.id === overId)
    if (!targetColumn || targetColumn.id === draggedUser.role_id) return

    // Update local state optimistically
    setLocalData(prev => 
      prev.map(user => 
        user.id === activeId 
          ? { ...user, role_id: targetColumn.id as "owner" | "admin" | "client" }
          : user
      )
    )

    // Call the role change handler
    if (onRoleChange) {
      onRoleChange(activeId, targetColumn.id)
    }

    toast.success(`User role changed to ${targetColumn.title}`)
  }

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

  const getPlanVariant = (plan: string) => {
    switch (plan) {
      case 'enterprise': return 'default' as const
      case 'pro': return 'secondary' as const
      default: return 'outline' as const
    }
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 overflow-x-auto pb-4 h-full p-4">
        {columns.map((column) => (
          <div key={column.id} className="flex-shrink-0 w-80 h-full">
            <div className={`rounded-lg border-2 ${column.color} p-4 h-full flex flex-col`}>
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  {getRoleIcon(column.id)}
                  {column.title}
                </h3>
                <Badge variant="outline" className="text-xs">
                  {column.users.length}
                </Badge>
              </div>
              
              <SortableContext 
                items={column.users.map(user => user.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3 overflow-y-auto flex-1 pr-2">
                  {column.users.map((user) => (
                    <SortableUserCard
                      key={user.id}
                      user={user}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onView={onView}
                    />
                  ))}
                  
                  {column.users.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <UserIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No {column.title.toLowerCase()}</p>
                    </div>
                  )}
                </div>
              </SortableContext>
            </div>
          </div>
        ))}
      </div>
      
      <DragOverlay>
        {activeId ? (
          <SortableUserCard
            user={localData.find(user => user.id === activeId)!}
            onEdit={onEdit}
            onDelete={onDelete}
            onView={onView}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
