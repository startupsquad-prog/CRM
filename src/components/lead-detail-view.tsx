"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Lead, LeadStage } from "@/types/lead"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowLeft, 
  Calendar, 
  FileText, 
  Mail,
  Phone,
  MessageSquare,
  User,
  Star,
  Tag,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft as ArrowLeftIcon
} from "lucide-react"
import { ActivityTimeline } from "./lead-activity/activity-timeline"
import { CallForm } from "./lead-activity/call-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

interface LeadDetailViewProps {
  lead: Lead
  basePath: string
  onLeadUpdate: (lead: Lead) => void
}

export function LeadDetailView({ lead: initialLead, basePath, onLeadUpdate }: LeadDetailViewProps) {
  const router = useRouter()
  const [lead, setLead] = useState<Lead>(initialLead)
  const [allLeads, setAllLeads] = useState<Lead[]>([])
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [callConnected, setCallConnected] = useState<boolean | null>(null)
  const [showCallForm, setShowCallForm] = useState(false)

  // Fetch all leads to determine next/previous navigation
  useEffect(() => {
    const fetchAllLeads = async () => {
      try {
        const response = await fetch('/api/leads')
        if (response.ok) {
          const data = await response.json()
          const leads = data.leads || []
          setAllLeads(leads)
          
          // Find current lead index
          const index = leads.findIndex((l: Lead) => l.id === lead.id)
          setCurrentIndex(index)
        }
      } catch (error) {
        console.error('Error fetching leads:', error)
      }
    }

    fetchAllLeads()
  }, [lead.id])

  const handleLeadUpdate = (updatedLead: Lead) => {
    setLead(updatedLead)
    onLeadUpdate(updatedLead)
  }

  const navigateToLead = (direction: 'next' | 'prev') => {
    if (currentIndex === -1 || allLeads.length === 0) return

    let newIndex: number
    if (direction === 'next') {
      newIndex = currentIndex < allLeads.length - 1 ? currentIndex + 1 : 0
    } else {
      newIndex = currentIndex > 0 ? currentIndex - 1 : allLeads.length - 1
    }

    const nextLead = allLeads[newIndex]
    if (nextLead) {
      router.push(`/leads/${nextLead.id}`)
    }
  }

  const hasNext = currentIndex >= 0 && currentIndex < allLeads.length - 1
  const hasPrev = currentIndex > 0
  
  // Stage navigation with arrows
  const stages: LeadStage[] = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost']
  const currentStageIndex = stages.indexOf(lead.stage)
  const canGoPrev = currentStageIndex > 0
  const canGoNext = currentStageIndex < stages.length - 1

  const navigateStage = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && canGoPrev) {
      handleStageChange(stages[currentStageIndex - 1])
    } else if (direction === 'next' && canGoNext) {
      handleStageChange(stages[currentStageIndex + 1])
    }
  }

  const handleStageChange = async (newStage: LeadStage) => {
    if (newStage === lead.stage) return
    
    try {
      const response = await fetch(`/api/leads/${lead.id}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      })

      if (!response.ok) throw new Error('Failed to update stage')
      
      const updatedLead = { ...lead, stage: newStage }
      handleLeadUpdate(updatedLead)
      toast.success(`Stage updated to ${newStage}`)
    } catch (error) {
      console.error('Error updating stage:', error)
      toast.error('Failed to update stage')
    }
  }

  // Format expected revenue
  const expectedRevenue = lead.budget ? `₹ ${lead.budget.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '₹ 0.00'
  const probability = 96.68

  // Get initials for avatar
  const initials = lead.full_name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'L'

  const handleConnectionClick = (connected: boolean) => {
    setCallConnected(connected)
    setShowCallForm(true)
  }

  const handleActivityCreated = () => {
    if (window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('refresh-activities'))
    }
    setShowCallForm(false)
    setCallConnected(null)
  }

  const getStageLabel = (stage: LeadStage) => {
    const labels: Record<LeadStage, string> = {
      new: 'New',
      contacted: 'Contacted',
      qualified: 'Qualified',
      proposal: 'Proposal',
      negotiation: 'Negotiation',
      won: 'Won',
      lost: 'Lost'
    }
    return labels[stage] || stage
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Breadcrumbs */}
      <div className="border-b px-4 py-3">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={basePath}>Leads</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{lead.full_name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Compact Lead Header with Avatar */}
      <div className="border-b px-4 py-3 bg-card">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={lead.avatar_url} alt={lead.full_name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-lg font-semibold truncate">{lead.full_name}</h1>
              <Badge variant="outline" className="text-xs">
                {lead.lead_id}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              {lead.email && (
                <div className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  <span className="truncate">{lead.email}</span>
                </div>
              )}
              {lead.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  <span>{lead.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>Created {new Date(lead.created_at).toLocaleDateString()}</span>
              </div>
              {lead.latest_quotation_date && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Last quote {new Date(lead.latest_quotation_date).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => navigateToLead('prev')}
              disabled={!hasPrev}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground min-w-[50px] text-center">
              {currentIndex >= 0 ? `${currentIndex + 1} / ${allLeads.length}` : '—'}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => navigateToLead('next')}
              disabled={!hasNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Stage Navigation with Arrows */}
      <div className="border-b px-4 py-2 bg-muted/30">
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateStage('prev')}
            disabled={!canGoPrev}
            className="h-7 px-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 px-3">
            <Badge variant="secondary" className="font-normal">
              Stage: {getStageLabel(lead.stage)}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateStage('next')}
            disabled={!canGoNext}
            className="h-7 px-2"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content Area - 2:1 Layout */}
      <div className="flex-1 overflow-auto">
        <div className="container max-w-7xl mx-auto px-4 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left Panel: Call Logging (2/3) */}
            <div className="lg:col-span-2 space-y-4">
              {!showCallForm ? (
                /* Connection Status Buttons */
                <Card>
                  <CardContent className="pt-6 pb-6">
                    <div className="flex items-center justify-center gap-4">
                      <Button
                        size="lg"
                        onClick={() => handleConnectionClick(true)}
                        className="bg-green-600 hover:bg-green-700 text-white h-12 px-8"
                      >
                        <CheckCircle2 className="h-5 w-5 mr-2" />
                        Connected
                      </Button>
                      <Button
                        size="lg"
                        variant="destructive"
                        onClick={() => handleConnectionClick(false)}
                        className="h-12 px-8"
                      >
                        <XCircle className="h-5 w-5 mr-2" />
                        Not Connected
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                /* Call Form */
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Log Call - {callConnected ? 'Connected' : 'Not Connected'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CallForm 
                      lead={lead} 
                      onSuccess={handleActivityCreated}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Compact Lead Info Cards */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Expected Revenue</Label>
                      <p className="text-base font-semibold">{expectedRevenue}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Probability</Label>
                      <p className="text-base font-semibold">{probability.toFixed(2)}%</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Contact & Sales Info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Contact & Sales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <Label className="text-xs text-muted-foreground">Email</Label>
                      <p className="mt-0.5">{lead.email || '—'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Phone</Label>
                      <p className="mt-0.5">{lead.phone || '—'}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">T</AvatarFallback>
                    </Avatar>
                    <div>
                      <Label className="text-xs text-muted-foreground">Salesperson</Label>
                      <p className="text-sm">T Team Suprans</p>
                    </div>
                  </div>
                  {lead.tags && lead.tags.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <Label className="text-xs text-muted-foreground">Tags</Label>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {lead.tags.map((tag, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Panel: Utilities (1/3) */}
            <div className="lg:col-span-1 space-y-4">
              {/* Quick Actions */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button size="sm" className="w-full justify-start" variant="outline">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </Button>
                  <Button size="sm" className="w-full justify-start" variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send WhatsApp
                  </Button>
                  <Button size="sm" className="w-full justify-start" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Add Note
                  </Button>
                  <Button size="sm" className="w-full justify-start" variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Callback
                  </Button>
                </CardContent>
              </Card>

              {/* Activity Timeline */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Activity Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <ActivityTimeline leadId={lead.id} />
                </CardContent>
              </Card>

              {/* Additional Info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Additional Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {lead.lead_score && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Lead Score</Label>
                      <p className="mt-0.5">{lead.lead_score}</p>
                    </div>
                  )}
                  {lead.lead_type && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Lead Type</Label>
                      <p className="mt-0.5">{lead.lead_type}</p>
                    </div>
                  )}
                  {lead.source && lead.source.length > 0 && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Source</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {lead.source.map((src, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">{src}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <Label className="text-xs text-muted-foreground">Lead Age</Label>
                    <p className="mt-0.5">{lead.lead_age_days} days</p>
                  </div>
                  {lead.product_inquiry && lead.product_inquiry.length > 0 && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Product Inquiries</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {lead.product_inquiry.map((product, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">{product}</Badge>
                        ))}
                      </div>
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

