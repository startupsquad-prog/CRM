import { requireAdmin } from "@/lib/clerk-auth"
import { redirect } from "next/navigation"
import { UsersDataTable } from "@/components/admin/users-data-table"

export default async function UsersPage() {
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
              <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
              <p className="text-muted-foreground">
                Manage and monitor all users in your system
              </p>
            </div>
          </div>
          
          <UsersDataTable />
        </div>
      </div>
    </div>
  )
}
