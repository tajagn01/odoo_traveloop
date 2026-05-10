import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { ItinerarySectionBuilder } from "@/components/itinerary/itinerary-section-builder";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import type { ItinerarySection } from "@/components/itinerary/itinerary-section-builder";

type StopQueryRow = {
  id: string;
  cityName: string;
  country: string;
  arrivalDate: Date;
  departureDate: Date;
  stopOrder: number;
  activities: Array<{
    id: string;
    activityName: string;
    description: string | null;
    activityType: string;
    duration: number;
    cost: number;
    imageUrl: string | null;
  }>;
};

export default async function ItineraryBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireAuth();

  const trip = await prisma.trip.findFirst({
    where: { id, userId: session.user.id },
    include: {
      stops: { include: { activities: true }, orderBy: { stopOrder: "asc" } },
    },
  });

  if (!trip) {
    return (
      <AppShell title="Itinerary builder" description="Trip not found.">
        <div />
      </AppShell>
    );
  }

  const sections = (trip.stops as StopQueryRow[]).map((stop) => ({
    id: stop.id,
    cityName: stop.cityName,
    country: stop.country,
    arrivalDate: stop.arrivalDate.toISOString(),
    departureDate: stop.departureDate.toISOString(),
    stopOrder: stop.stopOrder,
    activities: stop.activities.map((a) => ({
      id: a.id,
      activityName: a.activityName,
      description: a.description,
      activityType: a.activityType,
      duration: a.duration,
      cost: a.cost,
      imageUrl: a.imageUrl,
    })),
  })) as ItinerarySection[];

  const tripDates =
    trip.startDate && trip.endDate
      ? `${trip.startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${trip.endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
      : null;

  return (
    <div className="min-h-screen bg-background pb-16 lg:pb-0">
      {/* ── top nav ── */}
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-4xl items-center gap-3 px-6">
          <Link
            href={`/trips/${trip.id}`}
            className="flex items-center gap-1.5 rounded-xl p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <span className="text-sm font-bold tracking-tight text-foreground">Traveloop</span>
          <span className="mx-1 text-border/60">·</span>
          <span className="truncate text-sm font-medium text-muted-foreground">
            Build Itinerary
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        {/* ── page heading ── */}
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <MapPin className="h-4 w-4" />
              </span>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                {trip.tripName}
              </h1>
            </div>
            {tripDates && (
              <p className="ml-10 text-sm text-muted-foreground">{tripDates}</p>
            )}
          </div>

          <Link
            href={`/trips/${trip.id}`}
            className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition hover:bg-muted"
          >
            View trip
          </Link>
        </div>

        {/* ── section count summary ── */}
        {sections.length > 0 && (
          <div className="mb-6 grid grid-cols-3 gap-3 rounded-2xl border border-border bg-card p-4">
            <div className="text-center">
              <p className="text-xl font-bold text-foreground">{sections.length}</p>
              <p className="text-xs text-muted-foreground">
                {sections.length === 1 ? "Section" : "Sections"}
              </p>
            </div>
            <div className="text-center border-x border-border/60">
              <p className="text-xl font-bold text-foreground">
                {sections.reduce((s, sec) => s + sec.activities.length, 0)}
              </p>
              <p className="text-xs text-muted-foreground">Activities</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-foreground">
                ${sections
                  .flatMap((sec) => sec.activities)
                  .reduce((s, a) => s + a.cost, 0)
                  .toFixed(0)}
              </p>
              <p className="text-xs text-muted-foreground">Total cost</p>
            </div>
          </div>
        )}

        {/* ── section builder ── */}
        <ItinerarySectionBuilder tripId={trip.id} sections={sections} />
      </main>
    </div>
  );
}
