"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Image, Video, FileText, Download } from "lucide-react"
import { DataTableExportMenu } from "@/components/leads-table/leads-export-menu"
import { LeadsViewToggle } from "@/components/leads-table/leads-view-toggle"

interface Asset {
  id: string
  name: string
  type: 'image' | 'video' | 'document' | 'template'
  category: string
  thumbnail?: string
  size: string
}

const sampleAssets: Asset[] = [
  { id: '1', name: 'Company Logo Pack', type: 'image', category: 'Branding', size: '5.2 MB' },
  { id: '2', name: 'Product Showcase Video', type: 'video', category: 'Marketing', size: '12.4 MB' },
  { id: '3', name: 'Email Template', type: 'template', category: 'Email', size: '1.1 MB' },
  { id: '4', name: 'Social Media Banner', type: 'image', category: 'Social Media', size: '2.3 MB' },
  { id: '5', name: 'Product Catalog', type: 'document', category: 'Sales', size: '8.7 MB' },
  { id: '6', name: 'Trade Show Presentation', type: 'document', category: 'Events', size: '15.2 MB' },
]

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'image':
      return Image
    case 'video':
      return Video
    case 'document':
      return FileText
    case 'template':
      return FileText
    default:
      return FileText
  }
}

type AssetFilter = "all" | "image" | "video" | "document" | "template"

export default function MarketingAssetsPage() {
  const [assets, setAssets] = useState(sampleAssets)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [primaryFilter, setPrimaryFilter] = useState<AssetFilter>("all")
  const [view, setView] = useState<"kanban" | "table">("kanban")

  const categories = Array.from(new Set(assets.map(a => a.category)))

  const filteredAssets = useMemo(() => {
    let result = assets

    if (primaryFilter !== "all") {
      result = result.filter(a => a.type === primaryFilter)
    }

    if (selectedCategory) {
      result = result.filter(a => a.category === selectedCategory)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(asset =>
        asset.name.toLowerCase().includes(query) ||
        asset.category.toLowerCase().includes(query)
      )
    }

    return result
  }, [assets, primaryFilter, selectedCategory, searchQuery])

  const getFilterCount = (filter: AssetFilter) => {
    if (filter === "all") return assets.length
    return assets.filter(a => a.type === filter).length
  }

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden w-full max-w-full">
      <div className="flex flex-col gap-3 px-4 lg:px-6 flex-1 min-h-0 overflow-hidden py-3 w-full max-w-full min-w-0">
        <div className="flex-shrink-0">
          <h2 className="text-2xl font-bold tracking-tight">Marketing Assets</h2>
          <p className="text-muted-foreground">
            Access marketing materials and resources
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assets.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {assets.filter(a => a.type === 'image').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Videos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {assets.filter(a => a.type === 'video').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {assets.filter(a => a.type === 'document' || a.type === 'template').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Toolbar */}
        <div className="flex-1 min-h-0 flex flex-col w-full max-w-full min-w-0">
          <div className="flex flex-col h-full min-h-0">
            <div className="flex-shrink-0 space-y-3">
              {/* Filter Tabs */}
              <div className="flex flex-col gap-3 sticky top-0 z-10 bg-background pb-2 border-b">
                <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                  <Tabs value={primaryFilter} onValueChange={(value) => setPrimaryFilter(value as AssetFilter)} className="w-full">
                    <TabsList className="inline-flex h-9 items-center justify-start rounded-lg bg-muted p-1 text-muted-foreground overflow-x-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent min-w-0">
                      <TabsTrigger value="all" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
                        All Assets
                        {getFilterCount("all") > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {getFilterCount("all")}
                          </Badge>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="image" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
                        Images
                        {getFilterCount("image") > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {getFilterCount("image")}
                          </Badge>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="video" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
                        Videos
                        {getFilterCount("video") > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {getFilterCount("video")}
                          </Badge>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="document" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
                        Documents
                        {getFilterCount("document") > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {getFilterCount("document")}
                          </Badge>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="template" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
                        Templates
                        {getFilterCount("template") > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {getFilterCount("template")}
                          </Badge>
                        )}
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* Category Filter */}
                <div className="flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent pb-1">
                  <Button
                    variant={selectedCategory === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(null)}
                  >
                    All Categories
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>

                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 w-full">
                  <div className="flex flex-1 items-center gap-2 min-w-0">
                    <Input
                      placeholder="Search assets..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-8 w-full sm:w-[250px] min-w-[150px] flex-shrink-0"
                    />
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 border-l pl-2 ml-2">
                    <LeadsViewToggle view={view} onViewChange={setView} />
                    {view === "kanban" && (
                      <>
                        <DataTableExportMenu data={filteredAssets as any} filename="marketing-assets" />
                        <Button onClick={() => {}} size="sm" className="flex-shrink-0">
                          <Plus className="mr-2 h-4 w-4" />
                          Upload Asset
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Assets Grid */}
            <div className="flex-1 min-h-0 overflow-auto">
              {view === "kanban" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredAssets.length === 0 ? (
                    <Card className="col-span-full">
                      <CardContent className="py-12 text-center text-muted-foreground">
                        No assets found
                      </CardContent>
                    </Card>
                  ) : (
                    filteredAssets.map((asset) => {
                      const Icon = getTypeIcon(asset.type)
                      return (
                        <Card key={asset.id} className="hover:shadow-md transition-shadow">
                          <CardHeader className="pb-3">
                            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-3">
                              <Icon className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <CardTitle className="text-sm line-clamp-2">{asset.name}</CardTitle>
                            <p className="text-xs text-muted-foreground mt-1">{asset.type}</p>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-between">
                              <Badge variant="outline">{asset.category}</Badge>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">{asset.size}</span>
                                <Button variant="ghost" size="sm">
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })
                  )}
                </div>
              ) : (
                <div className="flex-1 min-h-0 rounded-md border overflow-hidden">
                  <div className="p-4 text-center text-muted-foreground">
                    Table view coming soon
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}