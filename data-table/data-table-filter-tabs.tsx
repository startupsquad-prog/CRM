"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface DataTableFilterTabsProps {
  activeFilter: string
  onFilterChange: (filter: string) => void
}

export function DataTableFilterTabs({ activeFilter, onFilterChange }: DataTableFilterTabsProps) {
  const getTabColor = (value: string) => {
    switch (value) {
      case 'free': return 'data-[state=active]:bg-gray-100 data-[state=active]:text-gray-800'
      case 'pro': return 'data-[state=active]:bg-purple-100 data-[state=active]:text-purple-800'
      case 'enterprise': return 'data-[state=active]:bg-orange-100 data-[state=active]:text-orange-800'
      case 'admins': return 'data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800'
      default: return ''
    }
  }

  return (
    <Tabs value={activeFilter} onValueChange={onFilterChange} className="inline-flex">
      <TabsList className="inline-flex">
        <TabsTrigger value="all">All Users</TabsTrigger>
        <TabsTrigger value="free" className={getTabColor('free')}>Free Plan</TabsTrigger>
        <TabsTrigger value="pro" className={getTabColor('pro')}>Pro Plan</TabsTrigger>
        <TabsTrigger value="enterprise" className={getTabColor('enterprise')}>Enterprise</TabsTrigger>
        <TabsTrigger value="admins" className={getTabColor('admins')}>Admins</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
