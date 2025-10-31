"use client"

import { useState } from "react"
import { Lead } from "@/types/lead"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CallForm } from "./call-form"
import { EmailForm } from "./email-form"
import { NoteForm } from "./note-form"
import { Phone, Mail, FileText } from "lucide-react"

interface ActivityFormProps {
  lead: Lead
  onActivityCreated: () => void
}

export function ActivityForm({ lead, onActivityCreated }: ActivityFormProps) {
  const [activeTab, setActiveTab] = useState("call")

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="call" className="flex items-center gap-2">
          <Phone className="h-4 w-4" />
          Log Call
        </TabsTrigger>
        <TabsTrigger value="email" className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Send Email
        </TabsTrigger>
        <TabsTrigger value="note" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Add Note
        </TabsTrigger>
      </TabsList>

      <TabsContent value="call" className="mt-4">
        <CallForm lead={lead} onSuccess={onActivityCreated} />
      </TabsContent>

      <TabsContent value="email" className="mt-4">
        <EmailForm lead={lead} onSuccess={onActivityCreated} />
      </TabsContent>

      <TabsContent value="note" className="mt-4">
        <NoteForm lead={lead} onSuccess={onActivityCreated} />
      </TabsContent>
    </Tabs>
  )
}

