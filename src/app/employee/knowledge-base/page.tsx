"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, BookOpen, ChevronRight, HelpCircle } from "lucide-react"

interface Article {
  id: string
  title: string
  category: string
  description: string
  tags: string[]
}

const articles: Article[] = [
  {
    id: '1',
    title: 'How to Create a New Lead',
    category: 'Getting Started',
    description: 'Step-by-step guide to creating and managing leads in the CRM system.',
    tags: ['leads', 'basics', 'tutorial']
  },
  {
    id: '2',
    title: 'Understanding Lead Stages',
    category: 'Sales Process',
    description: 'Learn about the different stages in the lead lifecycle and when to move leads.',
    tags: ['leads', 'stages', 'process']
  },
  {
    id: '3',
    title: 'Creating Quotations',
    category: 'Sales Process',
    description: 'Complete guide to creating professional quotations for your clients.',
    tags: ['quotations', 'pricing', 'sales']
  },
  {
    id: '4',
    title: 'Call Logging Best Practices',
    category: 'Communication',
    description: 'Tips and best practices for logging calls and tracking communication.',
    tags: ['calls', 'communication', 'tracking']
  },
  {
    id: '5',
    title: 'Using Messaging Templates',
    category: 'Communication',
    description: 'How to create and use messaging templates for efficient communication.',
    tags: ['templates', 'messages', 'communication']
  },
]

const categories = Array.from(new Set(articles.map(a => a.category)))

type CategoryFilter = "all" | string

export default function KnowledgeBasePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [primaryFilter, setPrimaryFilter] = useState<CategoryFilter>("all")

  const filteredArticles = useMemo(() => {
    let result = articles

    if (primaryFilter !== "all") {
      result = result.filter(a => a.category === primaryFilter)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(article =>
        article.title.toLowerCase().includes(query) ||
        article.description.toLowerCase().includes(query) ||
        article.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    return result
  }, [primaryFilter, searchQuery])

  const getCategoryCount = (category: string) => {
    return articles.filter(a => a.category === category).length
  }

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden w-full max-w-full">
      <div className="flex flex-col gap-3 px-4 lg:px-6 flex-1 min-h-0 overflow-hidden py-3 w-full max-w-full min-w-0">
        <div className="flex-shrink-0">
          <h2 className="text-2xl font-bold tracking-tight">Knowledge Base</h2>
          <p className="text-muted-foreground">
            Find answers and learn how to use the CRM system
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{articles.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Getting Started</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {articles.filter(a => a.category === 'Getting Started').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sales Process</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {articles.filter(a => a.category === 'Sales Process').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Communication</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {articles.filter(a => a.category === 'Communication').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Articles Section */}
        <div className="flex-1 min-h-0 flex flex-col w-full max-w-full min-w-0">
          <div className="flex flex-col h-full min-h-0">
            <div className="flex-shrink-0 space-y-3">
              {/* Filter Tabs */}
              <div className="flex flex-col gap-3 sticky top-0 z-10 bg-background pb-2 border-b">
                <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                  <Tabs value={primaryFilter} onValueChange={(value) => setPrimaryFilter(value as CategoryFilter)} className="w-full">
                    <TabsList className="inline-flex h-9 items-center justify-start rounded-lg bg-muted p-1 text-muted-foreground overflow-x-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent min-w-0">
                      <TabsTrigger value="all" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
                        All Categories
                        {articles.length > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {articles.length}
                          </Badge>
                        )}
                      </TabsTrigger>
                      {categories.map((category) => (
                        <TabsTrigger key={category} value={category} className="data-[state=active]:bg-background data-[state=active]:text-foreground">
                          {category}
                          {getCategoryCount(category) > 0 && (
                            <Badge variant="secondary" className="ml-2">
                              {getCategoryCount(category)}
                            </Badge>
                          )}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>

                {/* Search */}
                <div className="flex items-center gap-2 w-full">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search articles, guides, and tutorials..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-8"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Articles Grid */}
            <div className="flex-1 min-h-0 overflow-auto">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {filteredArticles.length === 0 ? (
                  <Card className="col-span-full">
                    <CardContent className="py-12 text-center text-muted-foreground">
                      No articles found matching your search.
                    </CardContent>
                  </Card>
                ) : (
                  filteredArticles.map((article) => (
                    <Card key={article.id} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-2">{article.title}</CardTitle>
                            <CardDescription className="text-sm mb-3">
                              {article.description}
                            </CardDescription>
                            <div className="flex flex-wrap gap-1">
                              {article.tags.map((tag, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-2" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm">
                          <Badge variant="secondary">{article.category}</Badge>
                          <Button variant="ghost" size="sm">
                            Read More
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}