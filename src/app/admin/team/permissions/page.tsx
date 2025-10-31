"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Shield, Plus, CheckCircle2, XCircle } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

interface Permission {
  id: string
  resource: string
  admin: boolean
  employee: boolean
  description: string
}

const permissions: Permission[] = [
  { id: '1', resource: 'Leads', admin: true, employee: true, description: 'View and manage leads' },
  { id: '2', resource: 'Leads - Create', admin: true, employee: true, description: 'Create new leads' },
  { id: '3', resource: 'Leads - Delete', admin: true, employee: false, description: 'Delete leads' },
  { id: '4', resource: 'Team Management', admin: true, employee: false, description: 'Manage team members' },
  { id: '5', resource: 'Companies', admin: true, employee: true, description: 'View companies' },
  { id: '6', resource: 'Companies - Create', admin: true, employee: false, description: 'Create companies' },
  { id: '7', resource: 'Quotations', admin: true, employee: true, description: 'View quotations' },
  { id: '8', resource: 'Quotations - Create', admin: true, employee: true, description: 'Create quotations' },
  { id: '9', resource: 'Quotations - Approve', admin: true, employee: false, description: 'Approve quotations' },
  { id: '10', resource: 'Analytics', admin: true, employee: false, description: 'View analytics and reports' },
  { id: '11', resource: 'Settings', admin: true, employee: false, description: 'Manage system settings' },
]

export default function PermissionsPage() {
  return (
    <div className="@container/main flex flex-1 flex-col gap-2 w-full max-w-full min-w-0 overflow-hidden">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 w-full max-w-full min-w-0">
        <div className="px-4 lg:px-6 w-full max-w-full min-w-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Roles & Permissions</h2>
              <p className="text-muted-foreground">
                Configure what each role can access and do
              </p>
            </div>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Custom Role
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Permission Matrix</CardTitle>
              <CardDescription>
                Define access control for different roles in your organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="table-responsive-wrapper">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Resource</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-center">Admin</TableHead>
                    <TableHead className="text-center">Employee</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permissions.map((perm) => (
                    <TableRow key={perm.id}>
                      <TableCell className="font-medium">{perm.resource}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {perm.description}
                      </TableCell>
                      <TableCell className="text-center">
                        {perm.admin ? (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Allowed
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1">
                            <XCircle className="h-3 w-3" />
                            Denied
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {perm.employee ? (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Allowed
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1">
                            <XCircle className="h-3 w-3" />
                            Denied
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
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
