"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight } from "lucide-react"
import { Switch } from "@/components/ui/switch"

interface Rule {
  id: string
  name: string
  description: string
  criteria: string
  action: string
  priority: number
  isActive: boolean
}

const rules: Rule[] = [
  {
    id: '1',
    name: 'Auto-assign by Geography',
    description: 'Assign leads from specific regions to regional sales reps',
    criteria: 'Location = "North America"',
    action: 'Assign to: John Doe',
    priority: 1,
    isActive: true
  },
  {
    id: '2',
    name: 'Round Robin Assignment',
    description: 'Distribute leads evenly across team members',
    criteria: 'All new leads',
    action: 'Round robin to: Sales Team',
    priority: 2,
    isActive: true
  },
  {
    id: '3',
    name: 'VIP Lead Escalation',
    description: 'Assign high-value leads to senior sales team',
    criteria: 'Deal Value > $50,000',
    action: 'Assign to: Senior Sales Team',
    priority: 1,
    isActive: false
  },
]

export default function AssignmentRulesPage() {
  const [rulesList, setRulesList] = useState(rules)

  const toggleRule = (id: string) => {
    setRulesList(prev =>
      prev.map(rule =>
        rule.id === id ? { ...rule, isActive: !rule.isActive } : rule
      )
    )
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-2 w-full max-w-full min-w-0 overflow-hidden">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 w-full max-w-full min-w-0">
        <div className="px-4 lg:px-6 w-full max-w-full min-w-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Assignment Rules</h2>
              <p className="text-muted-foreground">
                Configure automatic lead assignment rules
              </p>
            </div>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Create Rule
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Active Rules</CardTitle>
              <CardDescription>
                Rules are evaluated in priority order (lower number = higher priority)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="table-responsive-wrapper">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rule Name</TableHead>
                    <TableHead>Criteria</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rulesList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No rules configured. Create one to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    rulesList
                      .sort((a, b) => a.priority - b.priority)
                      .map((rule) => (
                        <TableRow key={rule.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{rule.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {rule.description}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {rule.criteria}
                            </code>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{rule.action}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{rule.priority}</Badge>
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={rule.isActive}
                              onCheckedChange={() => toggleRule(rule.id)}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
