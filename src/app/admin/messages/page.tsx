"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, MessageSquare, Filter, Plus } from "lucide-react"

interface MessageThread {
  id: string
  leadName: string
  employeeName: string
  lastMessage: string
  unreadCount: number
  timestamp: string
  status: 'active' | 'resolved'
}

const threads: MessageThread[] = [
  {
    id: '1',
    leadName: 'John Doe',
    employeeName: 'Sarah Smith',
    lastMessage: 'Thank you for the quotation!',
    unreadCount: 2,
    timestamp: '2 hours ago',
    status: 'active'
  },
  {
    id: '2',
    leadName: 'Jane Smith',
    employeeName: 'Mike Johnson',
    lastMessage: 'Can we schedule a call?',
    unreadCount: 0,
    timestamp: '5 hours ago',
    status: 'active'
  },
]

export default function MessagesPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredThreads = threads.filter(thread =>
    thread.leadName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    thread.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    thread.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="@container/main flex flex-1 flex-col gap-2 w-full max-w-full min-w-0 overflow-hidden">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 w-full max-w-full min-w-0">
        <div className="px-4 lg:px-6 w-full max-w-full min-w-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Messages</h2>
              <p className="text-muted-foreground">
                Monitor and manage all message communications
              </p>
            </div>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              New Message
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Message Threads</CardTitle>
                  <CardDescription>
                    {filteredThreads.length} active conversation{filteredThreads.length !== 1 ? 's' : ''}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-initial">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search messages..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 w-full sm:w-[250px]"
                    />
                  </div>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="table-responsive-wrapper">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lead</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Last Message</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Unread</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredThreads.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No messages found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredThreads.map((thread) => (
                      <TableRow key={thread.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="font-medium">{thread.leadName}</TableCell>
                        <TableCell>{thread.employeeName}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{thread.lastMessage}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={thread.status === 'active' ? 'default' : 'secondary'}>
                            {thread.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {thread.unreadCount > 0 ? (
                            <Badge variant="default">{thread.unreadCount}</Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {thread.timestamp}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
