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
  status: "upcoming" | "ongoing" | "completed";
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
      status: trip.status,
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
      status: trip.status,
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
    <AppShell>
      <div className="space-y-12">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 px-2">
          <div>
            <h1 className="text-5xl md:text-6xl font-display text-foreground mb-4 leading-tight">
              Welcome back, <span className="text-[#0D7A73]">{session.user.name?.split(' ')[0] ?? "Traveler"}</span>
            </h1>
            <p className="text-muted-foreground text-xl max-w-xl font-medium">
              Here is a quick snapshot of your upcoming travel plans.
            </p>
          </div>
          <Button asChild size="lg" className="rounded-full px-10 bg-[#0D7A73] hover:bg-[#0A625C] text-white font-bold shadow-xl shadow-teal-900/20 transition-all hover:-translate-y-1 active:scale-95">
            <Link href="/trips/new">Plan New Trip</Link>
          </Button>
        </div>

        {/* Hero Banner */}
        <div className="relative h-[380px] w-full overflow-hidden rounded-[48px] shadow-2xl group bg-gradient-to-br from-[#0D7A73] to-[#064E4B]">
          <img 
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2070" 
            alt="Majestic Mountains"
            className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end p-10 md:p-16 text-white">
            <h2 className="text-5xl md:text-7xl font-display mb-6 tracking-tight drop-shadow-lg">Where to next?</h2>
            <p className="max-w-2xl text-xl md:text-2xl leading-relaxed opacity-95 font-medium drop-shadow-md">
              Discover new destinations, plan your itineraries, and keep track of your travel memories.
            </p>
          </div>
        </div>

        {/* Recent Trips Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-border/40 pb-4">
            <h3 className="text-2xl font-display text-foreground">Recent trips</h3>
            <p className="text-sm text-muted-foreground">Pick up where you left off.</p>
          </div>
          
          {recentTrips.length ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {recentTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-card rounded-[32px] border border-border/40">
              <p className="text-xl font-display text-foreground mb-2">No trips yet</p>
              <p className="text-muted-foreground mb-6">Start planning your first itinerary.</p>
              <Button asChild className="rounded-full px-8 bg-[#0D7A73] hover:bg-[#0A625C]">
                <Link href="/trips/new">Plan a trip</Link>
              </Button>
            </div>
          )}
        </section>

        {/* Upcoming Section */}
        {upcomingTrips.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
              <h3 className="text-2xl font-display text-foreground">Upcoming trips</h3>
              <p className="text-sm text-muted-foreground">Trips starting soon.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {upcomingTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          </section>
        )}

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
