import { headers } from "next/headers";

import { CopyTripButton } from "@/components/trips/copy-trip-button";
import { ShareActions } from "@/components/trips/share-actions";
import { StopCard, type StopCardData } from "@/components/itinerary/stop-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateRange, formatCurrency } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export default async function SharedTripPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const shared = await prisma.sharedTrip.findUnique({
    where: { shareToken: token },
    include: {
      trip: {
        include: {
          stops: { include: { activities: true }, orderBy: { stopOrder: "asc" } },
          budget: true,
        },
      },
    },
  });

  if (!shared) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-2xl font-semibold">Shared trip not found</h1>
      </div>
    );
  }

  const trip = shared.trip;
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = headersList.get("x-forwarded-proto") ?? "http";
  const shareUrl = `${protocol}://${host}/share/${shared.shareToken}`;

  const stops: StopCardData[] = trip.stops.map(
    (stop: {
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
    }) => ({
      id: stop.id,
      cityName: stop.cityName,
      country: stop.country,
      arrivalDate: stop.arrivalDate.toISOString(),
      departureDate: stop.departureDate.toISOString(),
      stopOrder: stop.stopOrder,
      activities: stop.activities.map((activity) => ({
        id: activity.id,
        activityName: activity.activityName,
        description: activity.description,
        activityType: activity.activityType,
        duration: activity.duration,
        cost: activity.cost,
        imageUrl: activity.imageUrl,
      })),
    })
  );

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-6 py-16">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold">{trip.tripName}</h1>
        <p className="text-sm text-muted-foreground">
          {formatDateRange(trip.startDate, trip.endDate)} · {stops.length} stops
        </p>
      </div>

      <Card className="border-border/70">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Itinerary summary</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-background px-4 py-3">
            <p className="text-xs text-muted-foreground">Budget</p>
            <p className="text-sm font-semibold">
              {trip.budget ? formatCurrency(trip.budget.totalCost) : "Not set"}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-background px-4 py-3">
            <p className="text-xs text-muted-foreground">Share token</p>
            <p className="text-sm font-semibold">{shared.shareToken}</p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {stops.map((stop) => (
          <StopCard key={stop.id} stop={stop} />
        ))}
      </div>

      <Card className="border-border/70">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Share this trip</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ShareActions shareUrl={shareUrl} />
          <CopyTripButton token={token} />
        </CardContent>
      </Card>
    </div>
  );
}
