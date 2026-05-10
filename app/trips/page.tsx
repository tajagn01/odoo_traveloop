import Link from "next/link";

import { AppShell } from "@/components/layout/app-shell";
import { TripCard } from "@/components/trips/trip-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

type TripListRow = {
  id: string;
  tripName: string;
  startDate: Date;
  endDate: Date;
  stops: unknown[];
};

export default async function TripsPage() {
  const session = await requireAuth();
  const trips = (await prisma.trip.findMany({
    where: { userId: session.user.id },
    include: { stops: true },
    orderBy: { createdAt: "desc" },
  })) as TripListRow[];

  const tripCards = trips.map((trip) => ({
    id: trip.id,
    tripName: trip.tripName,
    startDate: trip.startDate.toISOString(),
    endDate: trip.endDate.toISOString(),
    stopCount: trip.stops.length,
  }));

  return (
    <AppShell
      title="My trips"
      description="Review your itineraries or start a new adventure."
      actions={
        <Button asChild>
          <Link href="/trips/new">Plan New Trip</Link>
        </Button>
      }
    >
      {tripCards.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tripCards.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No trips yet"
          description="Add your first itinerary to see it here."
          action={
            <Button asChild>
              <Link href="/trips/new">Plan a trip</Link>
            </Button>
          }
        />
      )}
    </AppShell>
  );
}
