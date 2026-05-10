import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { CalendarDays, MapPin, Backpack } from "lucide-react";
import { formatDateRange } from "@/lib/format";

export default async function PackingPage() {
  const session = await requireAuth();

  const trips = await prisma.trip.findMany({
    where: { userId: session.user.id },
    include: { stops: true },
    orderBy: { startDate: "desc" },
  });

  if (!trips.length) {
    return (
      <AppShell
        title="Packing Checklist"
        description="Organize what to pack for your trips"
      >
        <EmptyState
          title="No trips found"
          description="Create a trip first to start planning your packing list."
          action={
            <Button asChild>
              <Link href="/trips/new">Plan a Trip</Link>
            </Button>
          }
        />
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Packing Checklist"
      description="Select a trip to manage your packing list"
    >
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => (
            <Link
              key={trip.id}
              href={`/packing/${trip.id}`}
              className="group"
            >
              <Card className="h-full border-2 border-border transition hover:border-primary hover:shadow-md">
                <div className="flex h-full flex-col gap-4 p-6">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition line-clamp-1">
                      {trip.tripName}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {trip.description || "No description"}
                    </p>
                  </div>

                  <div className="space-y-2 text-xs text-muted-foreground flex-1">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {formatDateRange(trip.startDate, trip.endDate)}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5" />
                      {trip.stops.length} {trip.stops.length === 1 ? "stop" : "stops"}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                    <Backpack className="h-4 w-4 text-primary" />
                    <span className="text-xs font-medium text-foreground">
                      View Packing List
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
