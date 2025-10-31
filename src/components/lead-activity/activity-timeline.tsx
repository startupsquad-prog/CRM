"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Phone, Mail, FileText, Calendar, TrendingUp, Clock } from "lucide-react"
import { format } from "date-fns"

interface Activity {
  id: string
  activity_type: string
  created_at: string
  created_by: string
  description: string
  metadata: any
  note?: any
  call?: any
  email?: any
  callback?: any
}

interface ActivityTimelineProps {
  leadId: string
}

export function ActivityTimeline({ leadId }: ActivityTimelineProps) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/leads/${leadId}/activities`)
      if (response.ok) {
        const data = await response.json()
        setActivities(data.activities || [])
      }
    } catch (error) {
      console.error('Error fetching activities:', error)
    } finally {
      setLoading(false)
    }
  }, [leadId])

  useEffect(() => {
    fetchActivities()
    
    // Listen for refresh events
    const handleRefresh = () => {
      fetchActivities()
    }
    
    window.addEventListener('refresh-activities', handleRefresh)
    
    return () => {
      window.removeEventListener('refresh-activities', handleRefresh)
    }
  }, [fetchActivities])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call':
        return <Phone className="h-4 w-4" />
      case 'email':
        return <Mail className="h-4 w-4" />
      case 'note':
        return <FileText className="h-4 w-4" />
      case 'callback':
        return <Calendar className="h-4 w-4" />
      case 'stage_change':
        return <TrendingUp className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'call':
        return 'bg-blue-500'
      case 'email':
        return 'bg-green-500'
      case 'note':
        return 'bg-yellow-500'
      case 'callback':
        return 'bg-purple-500'
      case 'stage_change':
        return 'bg-orange-500'
      default:
        return 'bg-gray-500'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
          <CardDescription>
            Complete history of all interactions with this lead
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="relative pl-10">
                  <Skeleton className="absolute left-0 top-1 h-8 w-8 rounded-full" />
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Timeline</CardTitle>
        <CardDescription>
          Complete history of all interactions with this lead
        </CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No activities yet. Log a call, send an email, or add a note to get started.</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
            <div className="space-y-6">
              {activities.map((activity, index) => (
                <div key={activity.id} className="relative pl-10">
                  <div className={`absolute left-0 top-1 w-8 h-8 rounded-full ${getActivityColor(activity.activity_type)} flex items-center justify-center text-white`}>
                    {getActivityIcon(activity.activity_type)}
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {activity.activity_type.replace('_', ' ')}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(activity.created_at), 'MMM d, yyyy h:mm a')}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm font-medium">{activity.description}</p>
                    
                    {/* Show additional details based on activity type */}
                    {activity.activity_type === 'call' && activity.call && (
                      <div className="text-sm text-muted-foreground space-y-1">
                        {activity.call.duration_seconds > 0 && (
                          <p>Duration: {activity.call.duration_seconds}s</p>
                        )}
                        {activity.call.outcome && (
                          <p>Outcome: {activity.call.outcome}</p>
                        )}
                        {activity.call.notes && (
                          <p className="mt-2 p-2 bg-background rounded border">
                            {activity.call.notes}
                          </p>
                        )}
                      </div>
                    )}
                    
                    {activity.activity_type === 'email' && activity.email && (
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p><strong>Subject:</strong> {activity.email.subject}</p>
                        {activity.email.body && (
                          <div className="mt-2 p-2 bg-background rounded border max-h-32 overflow-y-auto">
                            <p className="text-xs whitespace-pre-wrap">{activity.email.body.substring(0, 200)}{activity.email.body.length > 200 ? '...' : ''}</p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {activity.activity_type === 'note' && activity.note && (
                      <div className="mt-2 p-2 bg-background rounded border">
                        <p className="text-sm whitespace-pre-wrap">{activity.note.content}</p>
                        {activity.note.is_private && (
                          <Badge variant="secondary" className="mt-2 text-xs">
                            Private
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

