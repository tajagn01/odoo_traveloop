import { headers } from "next/headers";

import { AppShell } from "@/components/layout/app-shell";
import { ItineraryView } from "@/components/itinerary/itinerary-view";
import { ShareActions } from "@/components/trips/share-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { enableShareAction } from "@/lib/actions/share";
import type { StopCardData } from "@/components/itinerary/stop-card";

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

export default async function TripPage({
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
      sharedTrips: true,
    },
  });

  if (!trip) {
    return (
      <AppShell title="Trip" description="Trip not found.">
        <div />
      </AppShell>
    );
  }

  const shareToken = trip.sharedTrips[0]?.shareToken ?? trip.shareToken;
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = headersList.get("x-forwarded-proto") ?? "http";
  const shareUrl = shareToken ? `${protocol}://${host}/share/${shareToken}` : "";

  const stops = (trip.stops as StopQueryRow[]).map((stop) => ({
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
  })) as StopCardData[];

  return (
    <AppShell
      title={trip.tripName}
      description="Switch between list and calendar views for your itinerary."
    >
      <div className="space-y-8">
        <ItineraryView
          stops={stops}
          startDate={trip.startDate.toISOString()}
          endDate={trip.endDate.toISOString()}
        />

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Share this itinerary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {trip.isPublic && shareUrl ? (
              <ShareActions shareUrl={shareUrl} />
            ) : (
              <form action={enableShareAction} className="flex flex-wrap gap-3">
                <input type="hidden" name="tripId" value={trip.id} />
                <Button type="submit">Enable public share link</Button>
                <p className="text-sm text-muted-foreground">
                  Create a read-only public view of this itinerary.
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
