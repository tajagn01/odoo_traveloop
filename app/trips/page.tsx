import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { formatDateRange } from "@/lib/format";

type TripListRow = {
  id: string;
  tripName: string;
  description: string | null;
  startDate: Date;
  endDate: Date;
  stops: unknown[];
};

function TripRow({ trip }: { trip: TripListRow }) {
  return (
    <Link
      href={`/trips/${trip.id}`}
      className="block rounded-2xl border border-border bg-card px-5 py-4 shadow-sm transition hover:shadow-md hover:bg-muted/50"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="font-semibold text-foreground">{trip.tripName}</p>
          {trip.description && (
            <p className="text-xs text-muted-foreground line-clamp-1">{trip.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatDateRange(trip.startDate, trip.endDate)}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {(trip.stops as unknown[]).length}{" "}
              {(trip.stops as unknown[]).length === 1 ? "stop" : "stops"}
            </span>
          </div>
        </div>
        <Button asChild variant="outline" size="sm">
          <span>View</span>
        </Button>
      </div>
    </Link>
  );
}

export default async function TripsPage() {
  const session = await requireAuth();
  const trips = (await prisma.trip.findMany({
    where: { userId: session.user.id },
    include: { stops: true },
    orderBy: { startDate: "asc" },
  })) as TripListRow[];

  const now = new Date();

  const ongoing = trips.filter(
    (t) => t.startDate <= now && t.endDate >= now
  );
  const upcoming = trips.filter((t) => t.startDate > now);
  const completed = trips.filter((t) => t.endDate < now);

  const hasAny = trips.length > 0;

  return (
    <AppShell
      title="My Trips"
      description="Review your itineraries or start a new adventure."
      actions={
        <Button asChild>
          <Link href="/trips/new">Plan New Trip</Link>
        </Button>
      }
    >
      {!hasAny ? (
        <EmptyState
          title="No trips yet"
          description="Add your first itinerary to see it here."
          action={
            <Button asChild>
              <Link href="/trips/new">Plan a trip</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-10">
          {/* ── Ongoing ── */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-foreground">Ongoing</h2>
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                {ongoing.length}
              </Badge>
            </div>
            {ongoing.length ? (
              <div className="space-y-3">
                {ongoing.map((trip) => (
                  <TripRow key={trip.id} trip={trip} />
                ))}
              </div>
            ) : (
              <p className="rounded-2xl border border-dashed border-border px-5 py-4 text-sm text-muted-foreground">
                No trips currently in progress.
              </p>
            )}
          </section>

          {/* ── Upcoming ── */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-foreground">Upcoming</h2>
              <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                {upcoming.length}
              </Badge>
            </div>
            {upcoming.length ? (
              <div className="space-y-3">
                {upcoming.map((trip) => (
                  <TripRow key={trip.id} trip={trip} />
                ))}
              </div>
            ) : (
              <p className="rounded-2xl border border-dashed border-border px-5 py-4 text-sm text-muted-foreground">
                No upcoming trips. Start planning!
              </p>
            )}
          </section>

          {/* ── Completed ── */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-foreground">Completed</h2>
              <Badge className="bg-muted text-muted-foreground">{completed.length}</Badge>
            </div>
            {completed.length ? (
              <div className="space-y-3">
                {completed.map((trip) => (
                  <TripRow key={trip.id} trip={trip} />
                ))}
              </div>
            ) : (
              <p className="rounded-2xl border border-dashed border-border px-5 py-4 text-sm text-muted-foreground">
                No completed trips yet.
              </p>
            )}
          </section>
        </div>
      )}
    </AppShell>
  );
}
