import { requireAdmin } from "@/lib/clerk-auth"
import { redirect } from "next/navigation"
import { RolesDataTable } from "@/components/admin/roles-data-table"

export default async function RolesPage() {
  const auth = await requireAdmin()
  if (!auth) {
    redirect('/employee/dashboard')
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-2 w-full max-w-full min-w-0 overflow-hidden">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 w-full max-w-full min-w-0">
        <div className="px-4 lg:px-6 w-full max-w-full min-w-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
              <p className="text-muted-foreground">
                Manage roles and configure granular permissions for access control
              </p>
            </div>
          </div>
          
          <RolesDataTable />
        </div>
      </div>
    </div>
  )
}
