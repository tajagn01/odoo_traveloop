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
import { summarizeExpenses } from "@/lib/expenses";

type TripWithStopsExpenses = {
  id: string;
  tripName: string;
  description: string | null;
  coverPhoto: string | null;
  startDate: Date;
  endDate: Date;
  budgetLimit: number | null;
  stops: unknown[];
  expenses: Array<{ category: "transport" | "stay" | "activities" | "meals"; amount: number }>;
};

export default async function DashboardPage() {
  const session = await requireAuth();
  const [trips, recommendedDestinations] = await Promise.all([
    prisma.trip.findMany({
      where: { userId: session.user.id },
      include: { stops: true, expenses: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.city.findMany({
      orderBy: [{ popularityScore: "desc" }, { costIndex: "asc" }],
      take: 6,
    }),
  ]);

  const typedTrips = trips as TripWithStopsExpenses[];

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const upcomingTrips = typedTrips
    .filter((trip) => {
      const start = new Date(trip.startDate);
      start.setHours(0, 0, 0, 0);
      return start >= now;
    })
    .slice(0, 3)
    .map((trip) => ({
      id: trip.id,
      tripName: trip.tripName,
      startDate: trip.startDate.toISOString(),
      endDate: trip.endDate.toISOString(),
      stopCount: trip.stops.length,
      coverPhoto: trip.coverPhoto,
      description: trip.description,
    }));

  const upcomingIds = new Set(upcomingTrips.map(t => t.id));

  // Recent trips are recently updated trips that aren't already shown in upcoming
  const recentTrips = typedTrips
    .filter((trip) => !upcomingIds.has(trip.id))
    .slice(0, 3)
    .map((trip) => ({
      id: trip.id,
      tripName: trip.tripName,
      startDate: trip.startDate.toISOString(),
      endDate: trip.endDate.toISOString(),
      stopCount: trip.stops.length,
      coverPhoto: trip.coverPhoto,
      description: trip.description,
    }));

  const budgetHighlights = typedTrips
    .filter((trip) => trip.expenses.length)
    .slice(0, 4)
    .map((trip) => ({
      id: trip.id,
      tripName: trip.tripName,
      totalCost: summarizeExpenses(trip.expenses).totalCost,
      budgetLimit: trip.budgetLimit ?? null,
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
        <section className="relative h-64 rounded-xl overflow-hidden mb-8">
          <img 
            src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
            alt="Travel Hero Banner" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex flex-col justify-center px-4 md:px-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Where to next?</h1>
            <p className="text-sm md:text-base text-white/80 max-w-md">Discover new destinations, plan your itineraries, and keep track of your travel memories.</p>
          </div>
        </section>

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
          <RecommendedDestinations
            destinations={recommendedDestinations.map((city) => ({
              id: city.id,
              cityName: city.name,
              country: city.country,
              region: city.region,
              costIndex: city.costIndex,
              popularity: city.popularityScore,
            }))}
          />
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
