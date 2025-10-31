"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Plus, Edit, Trash2, Shield, Lock } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

export interface Role {
  id: string
  name: string
  display_name: string
  description: string | null
  level: number
  is_system_role: boolean
  created_at: string
  user_count?: { count: number }[]
  role_permissions?: Array<{
    permission: {
      id: string
      resource: string
      action: string
      description: string | null
      category: string | null
    }
  }>
}

export interface Permission {
  id: string
  resource: string
  action: string
  description: string | null
  category: string | null
}

export function RolesDataTable() {
  const [roles, setRoles] = React.useState<Role[]>([])
  const [permissions, setPermissions] = React.useState<Permission[]>([])
  const [groupedPermissions, setGroupedPermissions] = React.useState<Record<string, Record<string, Permission[]>>>({})
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [openDialog, setOpenDialog] = React.useState(false)
  const [selectedRole, setSelectedRole] = React.useState<Role | null>(null)

  const fetchRoles = React.useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/roles?includePermissions=true')
      if (!response.ok) throw new Error('Failed to fetch roles')
      
      const result = await response.json()
      setRoles(result.roles || [])
    } catch (error) {
      console.error('Error fetching roles:', error)
      toast.error('Failed to load roles')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchPermissions = React.useCallback(async () => {
    try {
      const response = await fetch('/api/permissions')
      if (!response.ok) throw new Error('Failed to fetch permissions')
      
      const result = await response.json()
      setPermissions(result.permissions || [])
      setGroupedPermissions(result.grouped || {})
    } catch (error) {
      console.error('Error fetching permissions:', error)
      toast.error('Failed to load permissions')
    }
  }, [])

  React.useEffect(() => {
    fetchRoles()
    fetchPermissions()
  }, [fetchRoles, fetchPermissions])

  const handleSave = async (data: Partial<Role> & { permissions?: string[] }) => {
    try {
      const { permissions: selectedPermissions, ...roleData } = data
      const url = selectedRole ? `/api/roles/${selectedRole.id}` : '/api/roles'
      const method = selectedRole ? 'PATCH' : 'POST'

      const body: any = roleData
      if (selectedPermissions !== undefined) {
        body.permissions = selectedPermissions
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save role')
      }

      toast.success(`Role ${selectedRole ? 'updated' : 'created'} successfully`)
      fetchRoles()
      setOpenDialog(false)
      setSelectedRole(null)
    } catch (error: any) {
      console.error('Error saving role:', error)
      toast.error(error.message || 'Failed to save role')
    }
  }

  const handleDelete = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return

    try {
      const response = await fetch(`/api/roles/${roleId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete role')
      }

      toast.success('Role deleted successfully')
      fetchRoles()
    } catch (error: any) {
      console.error('Error deleting role:', error)
      toast.error(error.message || 'Failed to delete role')
    }
  }

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.display_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search roles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button onClick={() => {
          setSelectedRole(null)
          setOpenDialog(true)
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Create Role
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Users</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))
            ) : filteredRoles.length > 0 ? (
              filteredRoles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {role.is_system_role && (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      )}
                      {role.display_name}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {role.description || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{role.level}</Badge>
                  </TableCell>
                  <TableCell>
                    {role.user_count?.[0]?.count || 0}
                  </TableCell>
                  <TableCell>
                    <Badge variant={role.is_system_role ? "default" : "secondary"}>
                      {role.is_system_role ? "System" : "Custom"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {role.role_permissions?.length || 0} permissions
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedRole(role)
                            setOpenDialog(true)
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        {!role.is_system_role && (
                          <DropdownMenuItem
                            onClick={() => handleDelete(role.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No roles found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedRole ? "Edit Role" : "Create Role"}
            </DialogTitle>
            <DialogDescription>
              {selectedRole
                ? "Update role information and permissions."
                : "Create a new role and configure its permissions."}
            </DialogDescription>
          </DialogHeader>
          <RoleForm
            role={selectedRole}
            permissions={permissions}
            groupedPermissions={groupedPermissions}
            onSave={handleSave}
            onCancel={() => {
              setOpenDialog(false)
              setSelectedRole(null)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function RoleForm({
  role,
  permissions,
  groupedPermissions,
  onSave,
  onCancel,
}: {
  role: Role | null
  permissions: Permission[]
  groupedPermissions: Record<string, Record<string, Permission[]>>
  onSave: (data: Partial<Role> & { permissions?: string[] }) => void
  onCancel: () => void
}) {
  const [name, setName] = React.useState(role?.name || "")
  const [displayName, setDisplayName] = React.useState(role?.display_name || "")
  const [description, setDescription] = React.useState(role?.description || "")
  const [level, setLevel] = React.useState(role?.level?.toString() || "0")
  const [selectedPermissions, setSelectedPermissions] = React.useState<Set<string>>(
    new Set(role?.role_permissions?.map(rp => rp.permission.id) || [])
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      name,
      display_name: displayName,
      description: description || null,
      level: parseInt(level),
      permissions: Array.from(selectedPermissions),
    })
  }

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions((prev) => {
      const next = new Set(prev)
      if (next.has(permissionId)) {
        next.delete(permissionId)
      } else {
        next.add(permissionId)
      }
      return next
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="permissions">
            Permissions ({selectedPermissions.size})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={role?.is_system_role}
            />
            <p className="text-xs text-muted-foreground">
              Unique identifier (e.g., manager, viewer)
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="display_name">Display Name *</Label>
            <Input
              id="display_name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="level">Level</Label>
            <Input
              id="level"
              type="number"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              min="0"
              max="100"
            />
            <p className="text-xs text-muted-foreground">
              Higher level = more permissions (0-100)
            </p>
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4 max-h-[400px] overflow-y-auto">
          {Object.entries(groupedPermissions).map(([category, resources]) => (
            <div key={category} className="space-y-2">
              <h4 className="font-medium text-sm">{category}</h4>
              {Object.entries(resources).map(([resource, perms]) => (
                <div key={resource} className="ml-4 space-y-1 border-l-2 pl-4">
                  <h5 className="text-sm font-medium text-muted-foreground capitalize">
                    {resource}
                  </h5>
                  <div className="grid grid-cols-2 gap-2">
                    {perms.map((perm) => (
                      <div key={perm.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={perm.id}
                          checked={selectedPermissions.has(perm.id)}
                          onCheckedChange={() => togglePermission(perm.id)}
                        />
                        <Label
                          htmlFor={perm.id}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {perm.action}
                          {perm.description && (
                            <span className="text-muted-foreground ml-1">
                              - {perm.description}
                            </span>
                          )}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </TabsContent>
      </Tabs>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </DialogFooter>
    </form>
  )
}
