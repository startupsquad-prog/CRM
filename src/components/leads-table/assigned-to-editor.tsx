"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

interface Employee {
  id: string
  full_name: string | null
  email: string
}

interface AssignedToEditorProps {
  leadId: string
  currentValue: string | null
  onUpdate: (userId: string | null) => void
}

export function AssignedToEditor({ leadId, currentValue, onUpdate }: AssignedToEditorProps) {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch('/api/employees')
        if (!response.ok) {
          throw new Error('Failed to fetch employees')
        }
        const data = await response.json()
        setEmployees(data.employees || [])
      } catch (error) {
        console.error('Error fetching employees:', error)
        toast.error('Failed to load employees')
      } finally {
        setLoading(false)
      }
    }

    fetchEmployees()
  }, [])

  const handleChange = async (value: string) => {
    const newValue = value === "unassigned" ? null : value
    setSaving(true)

    try {
      const response = await fetch(`/api/leads/${leadId}/assign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assigned_to: newValue }),
      })

      if (!response.ok) {
        throw new Error('Failed to update assignment')
      }

      onUpdate(newValue)
      toast.success('Lead assignment updated')
    } catch (error) {
      console.error('Error updating assignment:', error)
      toast.error('Failed to update assignment')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-muted-foreground text-sm">Loading...</span>
      </div>
    )
  }

  const currentEmployee = currentValue 
    ? employees.find(emp => emp.id === currentValue)
    : null

  return (
    <Select
      value={currentValue || "unassigned"}
      onValueChange={handleChange}
      disabled={saving}
    >
      <SelectTrigger className="w-[180px] h-8">
        <SelectValue>
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : currentEmployee ? (
            <Badge variant="outline" className="text-xs">
              {currentEmployee.full_name || currentEmployee.email}
            </Badge>
          ) : (
            <span className="text-muted-foreground text-sm">Unassigned</span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="unassigned">
          <span className="text-muted-foreground">Unassigned</span>
        </SelectItem>
        {employees.map((employee) => (
          <SelectItem key={employee.id} value={employee.id}>
            {employee.full_name || employee.email}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

