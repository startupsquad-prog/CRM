"use client"

import { Lead } from "@/types/lead"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Mail, Phone, MessageSquare, Calendar } from "lucide-react"

interface LeadInfoCardProps {
  lead: Lead
}

export function LeadInfoCard({ lead }: LeadInfoCardProps) {
  const initials = lead.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'L'

  const getStageColor = (stage: string): string => {
    switch (stage) {
      case 'won':
        return 'bg-green-50 border-green-200 text-green-700 dark:bg-green-950 dark:border-green-800 dark:text-green-300'
      case 'lost':
        return 'bg-red-50 border-red-200 text-red-700 dark:bg-red-950 dark:border-red-800 dark:text-red-300'
      case 'negotiation':
      case 'proposal':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-300'
      default:
        return 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300'
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-6">
          <Avatar className="h-16 w-16">
            <AvatarImage src={lead.avatar_url} alt={lead.full_name} />
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold">{lead.full_name}</h2>
                <p className="text-muted-foreground font-mono text-sm mt-1">
                  {lead.lead_id}
                </p>
              </div>
              <Badge className={getStageColor(lead.stage)}>
                {lead.stage.toUpperCase()}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {lead.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${lead.email}`} className="hover:text-primary">
                    {lead.email}
                  </a>
                </div>
              )}
              
              {lead.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${lead.phone}`} className="hover:text-primary">
                    {lead.phone}
                  </a>
                </div>
              )}
              
              {lead.whatsapp && (
                <div className="flex items-center gap-2 text-sm">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <a href={lead.whatsapp} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                    WhatsApp
                  </a>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Created {new Date(lead.created_at).toLocaleDateString()}</span>
              </div>
              <div>
                <span>Lead Age: {lead.lead_age_days} days</span>
              </div>
            </div>

            {lead.source && lead.source.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {lead.source.map((src, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {src.replace('-', ' ')}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

