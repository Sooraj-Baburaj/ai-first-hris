import { PageHeader } from "@/app/components/molecules/PageHeader";
import { Toolbar } from "@/app/components/molecules/Toolbar";
import { EmployeeList } from "@/app/components/organisms/EmployeeList";
import { RecruiterShell } from "@/app/components/templates/RecruiterShell";
import { employees } from "@/app/lib/recruiter-data";

export default function RecruiterEmployeesPage() {
  return (
    <RecruiterShell active="Employees">
      <div className="grid gap-6">
        <PageHeader
          description="Track onboarding, support, learning progress, and suggested HR follow-ups for the internal workforce."
          eyebrow="Workforce lifecycle"
          title="Employee directory"
        />
        <Toolbar primaryFilter="All statuses" secondaryFilter="Updated today" />
        <EmployeeList employees={employees} />
      </div>
    </RecruiterShell>
  );
}
