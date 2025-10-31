"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { LeadStage } from "@/types/lead"

export type PrimaryFilter = LeadStage | "all"

interface LeadsFilterTabsProps {
  activeFilter: PrimaryFilter
  onFilterChange: (filter: PrimaryFilter) => void
  counts?: {
    all?: number
    new?: number
    contacted?: number
    qualified?: number
    proposal?: number
    negotiation?: number
    won?: number
    lost?: number
  }
}

export function LeadsFilterTabs({ 
  activeFilter, 
  onFilterChange,
  counts 
}: LeadsFilterTabsProps) {
  return (
    <Tabs value={activeFilter} onValueChange={(value) => onFilterChange(value as PrimaryFilter)} className="w-full">
      <TabsList className="inline-flex h-9 items-center justify-start rounded-lg bg-muted p-1 text-muted-foreground overflow-x-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent min-w-0">
        <TabsTrigger value="all" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
          All Leads
          {counts?.all !== undefined && (
            <Badge variant="secondary" className="ml-2">
              {counts.all}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="new" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
          New
          {counts?.new !== undefined && (
            <Badge variant="secondary" className="ml-2">
              {counts.new}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="contacted" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
          Contacted
          {counts?.contacted !== undefined && (
            <Badge variant="secondary" className="ml-2">
              {counts.contacted}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="qualified" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
          Qualified
          {counts?.qualified !== undefined && (
            <Badge variant="secondary" className="ml-2">
              {counts.qualified}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="proposal" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
          Proposal
          {counts?.proposal !== undefined && (
            <Badge variant="secondary" className="ml-2">
              {counts.proposal}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="negotiation" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
          Negotiation
          {counts?.negotiation !== undefined && (
            <Badge variant="secondary" className="ml-2">
              {counts.negotiation}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="won" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
          Won
          {counts?.won !== undefined && (
            <Badge variant="secondary" className="ml-2">
              {counts.won}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="lost" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
          Lost
          {counts?.lost !== undefined && (
            <Badge variant="secondary" className="ml-2">
              {counts.lost}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}

