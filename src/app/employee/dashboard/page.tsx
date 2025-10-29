import { requireAuth } from "@/lib/clerk-auth"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { SectionCards } from "@/components/section-cards"

// Simplified data for employee dashboard
const employeeData = [
  {
    id: 1,
    header: "Task Review",
    type: "Task",
    status: "In Process",
    target: "5",
    limit: "3",
    reviewer: "Manager",
  },
  {
    id: 2,
    header: "Report Submission",
    type: "Report",
    status: "Done",
    target: "10",
    limit: "8",
    reviewer: "Supervisor",
  },
  {
    id: 3,
    header: "Training Module",
    type: "Training",
    status: "In Process",
    target: "15",
    limit: "12",
    reviewer: "HR",
  },
]

export default async function EmployeeDashboardPage() {
  await requireAuth()

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards role="employee" />
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive />
          </div>
          <div className="px-4 lg:px-6">
            <div className="rounded-lg border bg-card p-6">
              <h2 className="text-lg font-semibold mb-4">My Recent Tasks</h2>
              <div className="space-y-2">
                {employeeData.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div>
                      <p className="font-medium">{task.header}</p>
                      <p className="text-sm text-muted-foreground">
                        {task.type} • {task.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
