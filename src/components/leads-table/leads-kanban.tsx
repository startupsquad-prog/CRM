"use client"

import React, { useState } from "react"
import { Lead, LeadStage } from "@/types/lead"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MoreHorizontal, Mail, Phone, MessageSquare } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "sonner"
import { StarRating } from "@/components/ui/star-rating"

interface LeadsKanbanProps {
  data: Lead[]
  onEdit?: (lead: Lead) => void
  onDelete?: (lead: Lead) => void
  onView?: (lead: Lead) => void
}

interface SortableLeadCardProps {
  lead: Lead
  onEdit?: (lead: Lead) => void
  onDelete?: (lead: Lead) => void
  onView?: (lead: Lead) => void
  onRatingChange?: (leadId: string, rating: number) => Promise<void>
}

interface KanbanColumn {
  id: LeadStage | 'other'
  title: string
  leads: Lead[]
  color: string
}

function SortableLeadCard({ lead, onEdit, onDelete, onView, onRatingChange }: SortableLeadCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const initials = lead.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'L'

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`bg-white shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-50' : ''
      }`}
      {...attributes}
      {...listeners}
      onClick={() => onView?.(lead)}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage src={lead.avatar_url} alt={lead.full_name} />
              <AvatarFallback className="text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">
                {lead.full_name}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                {lead.email && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground min-w-0">
                          <Mail className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{lead.email}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        {lead.email}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                {lead.phone && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground min-w-0">
                          <Phone className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{lead.phone}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        {lead.phone}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onView?.(lead)}>
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(lead)}>
                Edit Lead
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete?.(lead)}
                className="text-destructive focus:text-destructive"
              >
                Delete Lead
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {lead.source && lead.source.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {lead.source.slice(0, 2).map((src, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {src}
              </Badge>
            ))}
            {lead.source.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{lead.source.length - 2}
              </Badge>
            )}
          </div>
        )}
        
        {lead.product_inquiry && lead.product_inquiry.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {lead.product_inquiry.map((product, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {product}
              </Badge>
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between mb-2">
          <div onClick={(e) => e.stopPropagation()}>
            <StarRating
              rating={lead.rating}
              onRatingChange={onRatingChange ? (rating) => onRatingChange(lead.id, rating) : undefined}
              size="sm"
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-2 pt-2 border-t">
          <div className="flex items-center gap-2">
            {lead.whatsapp && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2"
                onClick={(e) => {
                  e.stopPropagation()
                  window.open(lead.whatsapp!, '_blank')
                }}
              >
                <MessageSquare className="h-3 w-3 mr-1" />
                WhatsApp
              </Button>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {lead.lead_age_days}d ago
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

export function LeadsKanban({ data, onEdit, onDelete, onView }: LeadsKanbanProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [localData, setLocalData] = useState<Lead[]>(data)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Update local data when props change
  React.useEffect(() => {
    setLocalData(data)
  }, [data])

  // Group leads by stage field
  const columns: KanbanColumn[] = [
    {
      id: "new",
      title: "New",
      leads: localData.filter(lead => lead.stage === 'new'),
      color: "bg-blue-50 border-blue-200"
    },
    {
      id: "contacted",
      title: "Contacted",
      leads: localData.filter(lead => lead.stage === 'contacted'),
      color: "bg-purple-50 border-purple-200"
    },
    {
      id: "qualified",
      title: "Qualified",
      leads: localData.filter(lead => lead.stage === 'qualified'),
      color: "bg-indigo-50 border-indigo-200"
    },
    {
      id: "proposal",
      title: "Proposal",
      leads: localData.filter(lead => lead.stage === 'proposal'),
      color: "bg-orange-50 border-orange-200"
    },
    {
      id: "negotiation",
      title: "Negotiation",
      leads: localData.filter(lead => lead.stage === 'negotiation'),
      color: "bg-yellow-50 border-yellow-200"
    },
    {
      id: "won",
      title: "Won",
      leads: localData.filter(lead => lead.stage === 'won'),
      color: "bg-green-50 border-green-200"
    },
    {
      id: "lost",
      title: "Lost",
      leads: localData.filter(lead => lead.stage === 'lost'),
      color: "bg-gray-50 border-gray-200"
    }
  ]

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleRatingChange = async (leadId: string, rating: number) => {
    // Optimistically update
    const currentLead = localData.find(l => l.id === leadId)
    if (!currentLead) return

    const currentRating = currentLead.rating
    
    setLocalData(prev => 
      prev.map(l => 
        l.id === leadId ? { ...l, rating } : l
      )
    )

    try {
      const response = await fetch(`/api/leads/${leadId}/rating`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating }),
      })

      if (!response.ok) {
        throw new Error('Failed to update rating')
      }

      toast.success('Rating updated')
    } catch (error) {
      console.error('Error updating rating:', error)
      // Rollback on error
      setLocalData(prev => 
        prev.map(l => 
          l.id === leadId ? { ...l, rating: currentRating } : l
        )
      )
      toast.error('Failed to update rating')
      throw error
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Find the lead being dragged
    const draggedLead = localData.find(lead => lead.id === activeId)
    if (!draggedLead) return

    // Find the target column (stage)
    const targetColumn = columns.find(col => 
      col.id === overId || 
      col.leads.some(lead => lead.id === overId)
    )
    if (!targetColumn) return

    const newStage = targetColumn.id as LeadStage

    // Optimistic update
    setLocalData(prev => 
      prev.map(lead => 
        lead.id === activeId 
          ? { ...lead, stage: newStage }
          : lead
      )
    )

    // Call API to update lead stage in database
    try {
      const response = await fetch(`/api/leads/${activeId}/stage`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stage: newStage }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        const errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`
        console.error('Failed to update lead stage:', errorMessage, errorData)
        throw new Error(errorMessage)
      }

      toast.success(`Lead moved to ${targetColumn.title}`)
    } catch (error) {
      console.error('Error updating lead stage:', error)
      // Rollback on error
      setLocalData(prev => 
        prev.map(lead => 
          lead.id === activeId 
            ? { ...lead, stage: draggedLead.stage }
            : lead
        )
      )
      const errorMessage = error instanceof Error ? error.message : 'Failed to update lead stage'
      toast.error(errorMessage)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 overflow-x-auto overflow-y-hidden h-full px-4 py-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        {columns.map((column) => (
          <div key={column.id} className="flex-shrink-0 w-80 h-full min-h-0 flex flex-col">
            <div className={`rounded-lg border-2 ${column.color} p-3 h-full min-h-0 flex flex-col max-h-full`}>
              <div className="flex items-center justify-between mb-3 flex-shrink-0">
                <h3 className="font-semibold text-sm">
                  {column.title}
                </h3>
                <Badge variant="outline" className="text-xs">
                  {column.leads.length}
                </Badge>
              </div>
              
              <SortableContext
                items={column.leads.map(lead => lead.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2 overflow-y-auto flex-1 min-h-0 pr-1">
                  {column.leads.map((lead) => (
                    <SortableLeadCard
                      key={lead.id}
                      lead={lead}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onView={onView}
                      onRatingChange={handleRatingChange}
                    />
                  ))}
                  
                  {column.leads.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="text-sm">No {column.title.toLowerCase()}</p>
                    </div>
                  )}
                </div>
              </SortableContext>
            </div>
          </div>
        ))}
      </div>
      
      <DragOverlay>
        {activeId ? (
          <SortableLeadCard
            lead={localData.find(lead => lead.id === activeId)!}
            onEdit={onEdit}
            onDelete={onDelete}
            onView={onView}
            onRatingChange={handleRatingChange}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

