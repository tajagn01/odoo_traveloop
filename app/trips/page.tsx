import Link from "next/link";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { TripRowWithStatus } from "@/components/trips/trip-row-with-status";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

type TripListRow = Prisma.TripGetPayload<{
  include: {
    stops: true;
    tripCopiesAsNew: {
      select: { id: true };
    };
  };
}>;

export default async function TripsPage() {
  const session = await requireAuth();
  const trips: TripListRow[] = await prisma.trip.findMany({
    where: { userId: session.user.id },
    include: { stops: true, tripCopiesAsNew: { select: { id: true } } },
    orderBy: { startDate: "asc" },
  });

  const savedTrips = trips.filter((trip) => Boolean(trip.tripCopiesAsNew));
  const regularTrips = trips.filter((trip) => !trip.tripCopiesAsNew);

  // Filter by the actual status field from database
  const ongoing = regularTrips.filter((t) => t.status === "ongoing");
  const upcoming = regularTrips.filter((t) => t.status === "upcoming");
  const completed = regularTrips.filter((t) => t.status === "completed");

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
          {/* ── Saved ── */}
          <section id="saved-trips" className="space-y-4 scroll-mt-24">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-foreground">Saved trips</h2>
              <Badge className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                {savedTrips.length}
              </Badge>
            </div>
            {savedTrips.length ? (
              <div className="space-y-3">
                {savedTrips.map((trip) => (
                  <TripRowWithStatus
                    key={trip.id}
                    trip={trip}
                    sourceLabel="Saved from community"
                    showDeleteButton
                  />
                ))}
              </div>
            ) : (
              <p className="rounded-2xl border border-dashed border-border px-5 py-4 text-sm text-muted-foreground">
                Save a trip from the Community tab to see it here.
              </p>
            )}
          </section>

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
                  <TripRowWithStatus key={trip.id} trip={trip} />
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
                  <TripRowWithStatus key={trip.id} trip={trip} />
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
                  <TripRowWithStatus key={trip.id} trip={trip} />
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
