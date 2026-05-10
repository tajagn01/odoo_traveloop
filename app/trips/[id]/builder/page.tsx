import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { BuilderClient } from "./BuilderClient";
import Link from "next/link";
import { ChevronRight, Home, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function BuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireAuth();

  const trip = await prisma.trip.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
    include: {
      stops: {
        orderBy: { stopOrder: "asc" },
        include: {
          activities: {
            orderBy: { createdAt: "asc" },
          },
        },
      },
      transportSegments: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!trip) {
    return (
      <AppShell title="Itinerary Builder" description="Trip not found.">
        <div />
      </AppShell>
    );
  }

  // Convert Date objects to strings for serialization to Client Components
  const serializedTrip = {
    ...trip,
    startDate: trip.startDate.toISOString(),
    endDate: trip.endDate.toISOString(),
    stops: trip.stops.map(stop => ({
      ...stop,
      arrivalDate: stop.arrivalDate.toISOString(),
      departureDate: stop.departureDate.toISOString(),
    })),
    transportSegments: trip.transportSegments.map(ts => ({
      ...ts,
      departureTime: ts.departureTime?.toISOString() || null,
      arrivalTime: ts.arrivalTime?.toISOString() || null,
    }))
  };

  return (
    <AppShell
      title="Itinerary Builder"
      description="Plan your day-by-day journey, activities, and transport."
      actions={
        <Button asChild variant="outline" size="sm">
          <Link href={`/trips/${trip.id}`}>
            Save & Exit
          </Link>
        </Button>
      }
    >
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/dashboard" className="hover:text-foreground transition-colors flex items-center gap-1">
          <Home className="h-4 w-4" /> Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href={`/trips/${trip.id}`} className="hover:text-foreground transition-colors truncate max-w-[150px]">
          {trip.tripName}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium flex items-center gap-1">
          <MapPin className="h-4 w-4" /> Builder
        </span>
      </div>

      <BuilderClient initialData={serializedTrip} />
    </AppShell>
  );
}
