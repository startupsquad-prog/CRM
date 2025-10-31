"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Plus, Calendar as CalendarIcon, Clock, Users } from "lucide-react"
import { format } from "date-fns"

interface Event {
  id: string
  title: string
  date: Date
  time: string
  type: 'call' | 'meeting' | 'task' | 'reminder'
  participants: string[]
}

const sampleEvents: Event[] = [
  {
    id: '1',
    title: 'Team Meeting',
    date: new Date(),
    time: '10:00 AM',
    type: 'meeting',
    participants: ['John Doe', 'Sarah Smith']
  },
  {
    id: '2',
    title: 'Client Call - ABC Corp',
    date: new Date(Date.now() + 86400000),
    time: '2:00 PM',
    type: 'call',
    participants: ['Mike Johnson']
  },
]

export default function AdminCalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  const eventsForDate = selectedDate
    ? sampleEvents.filter(e => format(e.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd'))
    : []

  return (
    <div className="@container/main flex flex-1 flex-col gap-2 w-full max-w-full min-w-0 overflow-hidden">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 w-full max-w-full min-w-0">
        <div className="px-4 lg:px-6 w-full max-w-full min-w-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Calendar</h2>
              <p className="text-muted-foreground">
                View all team events and schedules
              </p>
            </div>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Event
            </Button>
          </div>

          <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Calendar View</CardTitle>
                  <CardDescription>
                    Click on a date to view events
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                  />
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    {selectedDate ? format(selectedDate, 'MMMM dd, yyyy') : 'No date selected'}
                  </CardTitle>
                  <CardDescription>
                    Events for selected date
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {eventsForDate.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No events scheduled for this date
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {eventsForDate.map((event) => (
                        <div
                          key={event.id}
                          className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="font-medium text-sm mb-2">{event.title}</div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                            <Clock className="h-3 w-3" />
                            <span>{event.time}</span>
                          </div>
                          {event.participants.length > 0 && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Users className="h-3 w-3" />
                              <span>{event.participants.length} participant{event.participants.length !== 1 ? 's' : ''}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
