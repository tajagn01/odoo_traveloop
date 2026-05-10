import Link from "next/link";

import { AppShell } from "@/components/layout/app-shell";
import { SectionHeading } from "@/components/layout/section-heading";
import { TripCard } from "@/components/trips/trip-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { BudgetHighlights } from "@/components/dashboard/budget-highlights";
import { RecommendedDestinations } from "@/components/dashboard/recommended-destinations";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

type TripWithStopsBudget = {
  id: string;
  tripName: string;
  startDate: Date;
  endDate: Date;
  stops: unknown[];
  budget: { totalCost: number; budgetLimit: number | null } | null;
};

export default async function DashboardPage() {
  const session = await requireAuth();
  const trips = (await prisma.trip.findMany({
    where: { userId: session.user.id },
    include: { stops: true, budget: true },
    orderBy: { updatedAt: "desc" },
  })) as TripWithStopsBudget[];

  const recentTrips = trips.slice(0, 3).map((trip) => ({
    id: trip.id,
    tripName: trip.tripName,
    startDate: trip.startDate.toISOString(),
    endDate: trip.endDate.toISOString(),
    stopCount: trip.stops.length,
  }));

  const upcomingTrips = trips
    .filter((trip) => trip.startDate >= new Date())
    .slice(0, 3)
    .map((trip) => ({
      id: trip.id,
      tripName: trip.tripName,
      startDate: trip.startDate.toISOString(),
      endDate: trip.endDate.toISOString(),
      stopCount: trip.stops.length,
    }));

  const budgetHighlights = trips
    .filter((trip) => trip.budget)
    .slice(0, 4)
    .map((trip) => ({
      id: trip.id,
      tripName: trip.tripName,
      totalCost: trip.budget?.totalCost ?? 0,
      budgetLimit: trip.budget?.budgetLimit ?? null,
    }));

  return (
    <AppShell
      title={`Welcome back, ${session.user.name ?? "Traveler"}`}
      description="Here is a quick snapshot of your upcoming travel plans."
      actions={
        <Button asChild>
          <Link href="/trips/new">Plan New Trip</Link>
        </Button>
      }
    >
      <div className="space-y-10">
        <section className="space-y-4">
          <SectionHeading title="Recent trips" description="Pick up where you left off." />
          {recentTrips.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {recentTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No trips yet"
              description="Start planning your first itinerary."
              action={
                <Button asChild>
                  <Link href="/trips/new">Plan a trip</Link>
                </Button>
              }
            />
          )}
        </section>

        <section className="space-y-4">
          <SectionHeading
            title="Upcoming trips"
            description="Trips starting soon across your calendar."
          />
          {upcomingTrips.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {upcomingTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No upcoming trips"
              description="Lock in dates to see them here."
            />
          )}
        </section>

        <section className="space-y-4">
          <SectionHeading
            title="Recommended destinations"
            description="Shortlist new cities based on popularity and cost."
          />
          <RecommendedDestinations />
        </section>

        <section className="space-y-4">
          <SectionHeading title="Budget highlights" description="Monitor spending signals." />
          {budgetHighlights.length ? (
            <BudgetHighlights budgets={budgetHighlights} />
          ) : (
            <EmptyState
              title="No budgets yet"
              description="Add budgets to your trips to see highlights."
            />
          )}
        </section>
      </div>
    </AppShell>
  );
}
