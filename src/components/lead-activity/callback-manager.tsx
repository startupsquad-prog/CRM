"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar, Plus, Check, X, Clock } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

interface Callback {
  id: string
  callback_date: string
  notes: string | null
  priority: string
  status: string
  completed_at: string | null
  created_at: string
}

interface CallbackManagerProps {
  leadId: string
}

export function CallbackManager({ leadId }: CallbackManagerProps) {
  const [callbacks, setCallbacks] = useState<Callback[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    callback_date: '',
    notes: '',
    priority: 'medium',
  })

  useEffect(() => {
    fetchCallbacks()
  }, [leadId])

  const fetchCallbacks = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/leads/${leadId}/callbacks`)
      if (response.ok) {
        const data = await response.json()
        setCallbacks(data.callbacks || [])
      }
    } catch (error) {
      console.error('Error fetching callbacks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(`/api/leads/${leadId}/callbacks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to create callback')
      }

      toast.success('Callback scheduled successfully')
      setFormData({ callback_date: '', notes: '', priority: 'medium' })
      setShowForm(false)
      fetchCallbacks()
    } catch (error) {
      console.error('Error creating callback:', error)
      toast.error('Failed to schedule callback')
    }
  }

  const handleStatusChange = async (callbackId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/leads/${leadId}/callbacks`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callback_id: callbackId,
          status: newStatus,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update callback')
      }

      toast.success('Callback updated')
      fetchCallbacks()
    } catch (error) {
      console.error('Error updating callback:', error)
      toast.error('Failed to update callback')
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500'
      case 'high':
        return 'bg-orange-500'
      case 'medium':
        return 'bg-yellow-500'
      default:
        return 'bg-blue-500'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500'
      case 'missed':
        return 'bg-red-500'
      case 'cancelled':
        return 'bg-gray-500'
      default:
        return 'bg-blue-500'
    }
  }

  const upcomingCallbacks = callbacks.filter(c => 
    c.status === 'scheduled' && new Date(c.callback_date) >= new Date()
  ).sort((a, b) => 
    new Date(a.callback_date).getTime() - new Date(b.callback_date).getTime()
  )

  const pastCallbacks = callbacks.filter(c => 
    c.status !== 'scheduled' || new Date(c.callback_date) < new Date()
  ).sort((a, b) => 
    new Date(b.callback_date).getTime() - new Date(a.callback_date).getTime()
  )

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Callback Management</CardTitle>
              <CardDescription>
                Schedule and manage follow-up callbacks for this lead
              </CardDescription>
            </div>
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Callback
            </Button>
          </div>
        </CardHeader>
        {showForm && (
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="callback_date">Callback Date & Time</Label>
                  <Input
                    id="callback_date"
                    type="datetime-local"
                    value={formData.callback_date}
                    onChange={(e) => setFormData({ ...formData, callback_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add notes about this callback..."
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Schedule Callback</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      {upcomingCallbacks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Callbacks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingCallbacks.map((callback) => (
                <div
                  key={callback.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {format(new Date(callback.callback_date), 'MMM d, yyyy h:mm a')}
                      </span>
                      <Badge className={`${getPriorityColor(callback.priority)} text-white text-xs`}>
                        {callback.priority}
                      </Badge>
                      <Badge className={`${getStatusColor(callback.status)} text-white text-xs`}>
                        {callback.status}
                      </Badge>
                    </div>
                    {callback.notes && (
                      <p className="text-sm text-muted-foreground">{callback.notes}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {callback.status === 'scheduled' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(callback.id, 'completed')}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Complete
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(callback.id, 'cancelled')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {pastCallbacks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Past Callbacks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pastCallbacks.map((callback) => (
                <div
                  key={callback.id}
                  className="flex items-center justify-between p-4 border rounded-lg opacity-75"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {format(new Date(callback.callback_date), 'MMM d, yyyy h:mm a')}
                      </span>
                      <Badge className={`${getStatusColor(callback.status)} text-white text-xs`}>
                        {callback.status}
                      </Badge>
                    </div>
                    {callback.notes && (
                      <p className="text-sm text-muted-foreground">{callback.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {callbacks.length === 0 && !loading && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No callbacks scheduled yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

