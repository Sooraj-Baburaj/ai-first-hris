import { PageHeader } from "@/app/components/molecules/PageHeader";
import { Toolbar } from "@/app/components/molecules/Toolbar";
import { EmployeeList } from "@/app/components/organisms/EmployeeList";
import { RecruiterShell } from "@/app/components/templates/RecruiterShell";
import { apiGet } from "@/app/lib/api";
import type { EmployeeListResponseDto } from "@closed-ai/types";

async function getEmployees() {
  try {
    const response = await apiGet<EmployeeListResponseDto>("/api/v1/recruiter/employees");
    return { items: response.items, error: null as string | null };
  } catch {
    return { items: [], error: "Could not load employees right now." };
  }
}

export default async function RecruiterEmployeesPage() {
  const { items, error } = await getEmployees();

  return (
    <RecruiterShell active="Employees">
      <div className="grid gap-6">
        <PageHeader
          description="Track onboarding, support, learning progress, and suggested HR follow-ups for the internal workforce."
          eyebrow="Workforce lifecycle"
          title="Employee directory"
        />
        <Toolbar primaryFilter="All statuses" secondaryFilter="Updated today" />
        {error ? (
          <p className="rounded-2xl bg-[var(--rose-soft)] px-4 py-3 text-sm text-[var(--rose)]">{error}</p>
        ) : null}
        <EmployeeList employees={items} />
      </div>
    </RecruiterShell>
  );
}
