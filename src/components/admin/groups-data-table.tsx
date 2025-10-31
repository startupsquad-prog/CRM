"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Plus, Edit, Trash2, Users as UsersIcon } from "lucide-react"
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
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"

export interface Group {
  id: string
  name: string
  description: string | null
  color: string | null
  icon: string | null
  is_active: boolean
  parent_group_id: string | null
  created_at: string
  user_count?: { count: number }[]
}

export function GroupsDataTable() {
  const [groups, setGroups] = React.useState<Group[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [openDialog, setOpenDialog] = React.useState(false)
  const [selectedGroup, setSelectedGroup] = React.useState<Group | null>(null)

  const fetchGroups = React.useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchQuery) {
        params.append('search', searchQuery)
      }

      const response = await fetch(`/api/groups?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch groups')
      
      const result = await response.json()
      setGroups(result.groups || [])
    } catch (error) {
      console.error('Error fetching groups:', error)
      toast.error('Failed to load groups')
    } finally {
      setLoading(false)
    }
  }, [searchQuery])

  React.useEffect(() => {
    fetchGroups()
  }, [fetchGroups])

  const handleSave = async (data: Partial<Group>) => {
    try {
      const url = selectedGroup ? `/api/groups/${selectedGroup.id}` : '/api/groups'
      const method = selectedGroup ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to save group')

      toast.success(`Group ${selectedGroup ? 'updated' : 'created'} successfully`)
      fetchGroups()
      setOpenDialog(false)
      setSelectedGroup(null)
    } catch (error) {
      console.error('Error saving group:', error)
      toast.error('Failed to save group')
    }
  }

  const handleDelete = async (groupId: string) => {
    if (!confirm('Are you sure you want to delete this group?')) return

    try {
      const response = await fetch(`/api/groups/${groupId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete group')
      }

      toast.success('Group deleted successfully')
      fetchGroups()
    } catch (error: any) {
      console.error('Error deleting group:', error)
      toast.error(error.message || 'Failed to delete group')
    }
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button onClick={() => {
          setSelectedGroup(null)
          setOpenDialog(true)
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Create Group
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
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
                  <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))
            ) : groups.length > 0 ? (
              groups.map((group) => (
                <TableRow key={group.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {group.color && (
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: group.color }}
                        />
                      )}
                      {group.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {group.description || "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <UsersIcon className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {group.user_count?.[0]?.count || 0}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={group.is_active ? "default" : "outline"}>
                      {group.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(group.created_at).toLocaleDateString()}
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
                            setSelectedGroup(group)
                            setOpenDialog(true)
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(group.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No groups found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedGroup ? "Edit Group" : "Create Group"}
            </DialogTitle>
            <DialogDescription>
              {selectedGroup
                ? "Update group information."
                : "Create a new group to organize users."}
            </DialogDescription>
          </DialogHeader>
          <GroupForm
            group={selectedGroup}
            onSave={handleSave}
            onCancel={() => {
              setOpenDialog(false)
              setSelectedGroup(null)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function GroupForm({
  group,
  onSave,
  onCancel,
}: {
  group: Group | null
  onSave: (data: Partial<Group>) => void
  onCancel: () => void
}) {
  const [name, setName] = React.useState(group?.name || "")
  const [description, setDescription] = React.useState(group?.description || "")
  const [color, setColor] = React.useState(group?.color || "#3b82f6")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      name,
      description: description || null,
      color,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
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
        <Label htmlFor="color">Color</Label>
        <div className="flex items-center gap-2">
          <Input
            id="color"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-20 h-10"
          />
          <Input
            value={color}
            onChange={(e) => setColor(e.target.value)}
            placeholder="#3b82f6"
            className="flex-1"
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </DialogFooter>
    </form>
  )
}
