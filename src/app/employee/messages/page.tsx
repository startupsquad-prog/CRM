"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, MessageSquare, Send, Plus } from "lucide-react"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

interface Message {
  id: string
  sender: string
  senderAvatar: string
  content: string
  timestamp: string
  unread: boolean
}

interface Conversation {
  id: string
  participant: string
  participantAvatar: string
  lastMessage: string
  timestamp: string
  unreadCount: number
}

const conversations: Conversation[] = [
  {
    id: '1',
    participant: 'John Doe',
    participantAvatar: '',
    lastMessage: 'Thank you for the quotation!',
    timestamp: '2 hours ago',
    unreadCount: 2
  },
  {
    id: '2',
    participant: 'Sarah Smith',
    participantAvatar: '',
    lastMessage: 'Can we schedule a call?',
    timestamp: '5 hours ago',
    unreadCount: 0
  },
]

const messages: Message[] = [
  {
    id: '1',
    sender: 'You',
    senderAvatar: '',
    content: 'Hello, I wanted to follow up on our discussion.',
    timestamp: '10:30 AM',
    unread: false
  },
  {
    id: '2',
    sender: 'John Doe',
    senderAvatar: '',
    content: 'Thank you for the quotation!',
    timestamp: '11:45 AM',
    unread: true
  },
]

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>('1')
  const [message, setMessage] = useState("")

  return (
    <div className="@container/main flex flex-1 flex-col gap-2 w-full max-w-full min-w-0 overflow-hidden">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 w-full max-w-full min-w-0">
        <div className="px-4 lg:px-6 w-full max-w-full min-w-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Messages</h2>
              <p className="text-muted-foreground">
                Communicate with leads and team members
              </p>
            </div>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              New Message
            </Button>
          </div>

          <div className="grid gap-6 grid-cols-1 lg:grid-cols-3 h-[calc(100vh-200px)] min-h-[600px]">
            {/* Conversations List */}
            <Card className="lg:col-span-1 flex flex-col w-full max-w-full min-w-0">
              <CardHeader className="pb-3">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    className="pl-8"
                  />
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-0">
                <ScrollArea className="h-full">
                  <div className="space-y-1 p-2">
                    {conversations.map((conv) => (
                      <div
                        key={conv.id}
                        onClick={() => setSelectedConversation(conv.id)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedConversation === conv.id
                            ? 'bg-muted'
                            : 'hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={conv.participantAvatar} />
                            <AvatarFallback>
                              {conv.participant[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-sm truncate">
                                {conv.participant}
                              </span>
                              {conv.unreadCount > 0 && (
                                <Badge variant="default" className="text-xs">
                                  {conv.unreadCount}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground truncate">
                                {conv.lastMessage}
                              </span>
                              <span className="text-xs text-muted-foreground ml-2">
                                {conv.timestamp}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Messages Area */}
            <Card className="lg:col-span-2 flex flex-col w-full max-w-full min-w-0">
              <CardHeader className="border-b">
                {selectedConversation && (
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {conversations.find(c => c.id === selectedConversation)?.participant[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">
                        {conversations.find(c => c.id === selectedConversation)?.participant}
                      </CardTitle>
                      <CardDescription className="text-xs">Active now</CardDescription>
                    </div>
                  </div>
                )}
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            msg.sender === 'You'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              msg.sender === 'You'
                                ? 'text-primary-foreground/70'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {msg.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="border-t p-4">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          // Send message
                          setMessage("")
                        }
                      }}
                    />
                    <Button>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
