"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Lead, LeadStage } from "@/types/lead"
import {
  Mail,
  Phone,
  MessageSquare,
  Edit,
  Calendar,
  Tag,
  Package,
  User,
  FileText,
  MapPin,
  TrendingUp,
  ExternalLink,
} from "lucide-react"

interface LeadDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lead: Lead | null
  onEdit?: () => void
}

const getStageVariant = (stage: LeadStage): "default" | "secondary" | "outline" | "destructive" => {
  switch (stage) {
    case 'won':
      return 'default'
    case 'lost':
      return 'destructive'
    case 'negotiation':
    case 'proposal':
      return 'secondary'
    default:
      return 'outline'
  }
}

const getStageColor = (stage: LeadStage): string => {
  switch (stage) {
    case 'new':
      return 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300'
    case 'contacted':
      return 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-950 dark:border-purple-800 dark:text-purple-300'
    case 'qualified':
      return 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950 dark:border-indigo-800 dark:text-indigo-300'
    case 'proposal':
      return 'bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-950 dark:border-orange-800 dark:text-orange-300'
    case 'negotiation':
      return 'bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-300'
    case 'won':
      return 'bg-green-50 border-green-200 text-green-700 dark:bg-green-950 dark:border-green-800 dark:text-green-300'
    case 'lost':
      return 'bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-950 dark:border-gray-800 dark:text-gray-300'
    default:
      return 'bg-muted border-border text-foreground'
  }
}

export function LeadDetailsModal({
  open,
  onOpenChange,
  lead,
  onEdit,
}: LeadDetailsModalProps) {
  if (!lead) return null

  const initials = lead.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'L'

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatDateTime = (date: Date | string) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={lead.avatar_url} alt={lead.full_name} />
                <AvatarFallback className="text-sm font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="flex items-center gap-2">
                  {lead.full_name}
                  <Badge variant={getStageVariant(lead.stage)} className="ml-2">
                    {lead.stage}
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  {lead.lead_id} • Created {formatDate(lead.created_at)}
                </DialogDescription>
              </div>
            </div>
            {onEdit && (
              <Button onClick={onEdit} size="sm" variant="outline">
                <Edit className="size-4 mr-2" />
                Edit Lead
              </Button>
            )}
          </div>
        </DialogHeader>
        
        <Tabs defaultValue="overview" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm">Basic Information</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <User className="size-4 text-muted-foreground mt-0.5" />
                    <div>
                      <span className="text-muted-foreground">Name:</span>
                      <p className="font-medium">{lead.full_name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Tag className="size-4 text-muted-foreground mt-0.5" />
                    <div>
                      <span className="text-muted-foreground">Lead ID:</span>
                      <p className="font-medium font-mono">{lead.lead_id}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <TrendingUp className="size-4 text-muted-foreground mt-0.5" />
                    <div>
                      <span className="text-muted-foreground">Stage:</span>
                      <div className="mt-1">
                        <Badge 
                          variant={getStageVariant(lead.stage)}
                          className={getStageColor(lead.stage)}
                        >
                          {lead.stage}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Calendar className="size-4 text-muted-foreground mt-0.5" />
                    <div>
                      <span className="text-muted-foreground">Created:</span>
                      <p className="font-medium">{formatDateTime(lead.created_at)}</p>
                    </div>
                  </div>
                  
                  {lead.lead_age_days !== undefined && (
                    <div className="flex items-start gap-3">
                      <Calendar className="size-4 text-muted-foreground mt-0.5" />
                      <div>
                        <span className="text-muted-foreground">Lead Age:</span>
                        <p className="font-medium">{lead.lead_age_days} days</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Source & Tags */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm">Source & Tags</h4>
                <div className="space-y-3 text-sm">
                  {lead.source && lead.source.length > 0 && (
                    <div>
                      <span className="text-muted-foreground text-sm">Source:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {lead.source.map((src, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {src.replace('-', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {lead.tags && lead.tags.length > 0 && (
                    <div>
                      <span className="text-muted-foreground text-sm">Tags:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {lead.tags.map((tag, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {lead.assigned_to && (
                    <div className="flex items-start gap-3">
                      <User className="size-4 text-muted-foreground mt-0.5" />
                      <div>
                        <span className="text-muted-foreground">Assigned To:</span>
                        <p className="font-medium">User ID: {lead.assigned_to}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Notes */}
            {lead.notes && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Notes</h4>
                <div className="p-4 border rounded-lg bg-muted/50">
                  <p className="text-sm whitespace-pre-wrap">{lead.notes}</p>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="contact" className="space-y-6 mt-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">Contact Information</h4>
              <div className="space-y-3">
                {lead.email && (
                  <div className="flex items-center gap-3 p-3 rounded-lg border">
                    <Mail className="size-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Email</p>
                      <a 
                        href={`mailto:${lead.email}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {lead.email}
                      </a>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`mailto:${lead.email}`, '_blank')}
                    >
                      <ExternalLink className="size-4" />
                    </Button>
                  </div>
                )}
                
                {lead.phone && (
                  <div className="flex items-center gap-3 p-3 rounded-lg border">
                    <Phone className="size-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Phone</p>
                      <a 
                        href={`tel:${lead.phone}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {lead.phone}
                      </a>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`tel:${lead.phone}`, '_blank')}
                    >
                      <ExternalLink className="size-4" />
                    </Button>
                  </div>
                )}
                
                {lead.whatsapp && (
                  <div className="flex items-center gap-3 p-3 rounded-lg border">
                    <MessageSquare className="size-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">WhatsApp</p>
                      <p className="text-sm text-muted-foreground">
                        {lead.whatsapp_number || lead.phone || 'Available'}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(lead.whatsapp, '_blank')}
                    >
                      <ExternalLink className="size-4" />
                    </Button>
                  </div>
                )}
                
                {!lead.email && !lead.phone && !lead.whatsapp && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No contact information available</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="products" className="space-y-6 mt-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">Product Inquiries</h4>
              {lead.product_inquiry && lead.product_inquiry.length > 0 ? (
                <div className="space-y-3">
                  {lead.product_inquiry.map((product, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-lg border">
                      <Package className="size-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{product}</p>
                      </div>
                    </div>
                  ))}
                  
                  {lead.quantity !== null && (
                    <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
                      <Package className="size-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Requested Quantity</p>
                        <p className="text-sm text-muted-foreground">{lead.quantity} units</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No product inquiries</p>
                </div>
              )}
              
              {lead.product_id && (
                <div className="mt-4 p-3 rounded-lg border bg-muted/50">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Linked Product ID:</span>{' '}
                    <span className="font-medium">{lead.product_id}</span>
                  </p>
                </div>
              )}
              
              {lead.quotation_ids && lead.quotation_ids.length > 0 && (
                <div className="mt-4">
                  <h5 className="font-medium text-sm mb-2">Related Quotations</h5>
                  <div className="flex flex-wrap gap-2">
                    {lead.quotation_ids.map((quotationId, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {quotationId}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="activity" className="space-y-6 mt-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">Activity Timeline</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg border">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Lead Created</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(lead.created_at)}
                    </p>
                  </div>
                </div>
                
                {lead.latest_quotation_date && (
                  <div className="flex items-start gap-3 p-3 rounded-lg border">
                    <div className="w-2 h-2 rounded-full bg-secondary mt-2" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Latest Quotation Date</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(lead.latest_quotation_date)}
                      </p>
                    </div>
                  </div>
                )}
                
                {lead.welcome_message_status && (
                  <div className="flex items-start gap-3 p-3 rounded-lg border">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      lead.welcome_message_status === 'sent' 
                        ? 'bg-green-500' 
                        : 'bg-muted-foreground'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Welcome Message</p>
                      <p className="text-xs text-muted-foreground">
                        Status: {lead.welcome_message_status === 'sent' ? 'Sent' : 'Not Sent'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {lead.messages && (
              <div className="mt-6 space-y-2">
                <h4 className="font-semibold text-sm">Messages</h4>
                <div className="p-4 border rounded-lg bg-muted/50">
                  <p className="text-sm whitespace-pre-wrap">{lead.messages}</p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

