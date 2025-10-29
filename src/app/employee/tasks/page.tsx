export default function EmployeeTasksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>
        <p className="text-muted-foreground">
          View and manage your assigned tasks
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Your tasks will appear here
        </p>
      </div>
    </div>
  )
}

