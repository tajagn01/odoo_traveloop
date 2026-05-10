import { AppShell } from "@/components/layout/app-shell";
import { NewTripForm } from "@/components/trips/new-trip-form";
import { requireAuth } from "@/lib/auth-guard";

export default async function NewTripPage() {
  await requireAuth();

  return (
    <AppShell
      title="Create a new trip"
      description="Add the basics now and refine the itinerary later."
    >
      <div className="max-w-2xl">
        <NewTripForm />
      </div>
    </AppShell>
  );
}
