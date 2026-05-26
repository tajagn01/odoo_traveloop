import { AppShell } from "@/components/layout/app-shell";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { requireAuth } from "@/lib/auth-guard";

export default async function DashboardPage() {
  const session = await requireAuth();
  const firstName = session.user.name?.split(" ")[0] ?? "Traveler";

  return (
    <AppShell>
      <DashboardClient firstName={firstName} />
    </AppShell>
  );
}
