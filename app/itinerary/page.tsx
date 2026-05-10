import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { ItineraryClient } from "./itinerary-client";

export default async function ItineraryPage() {
  const session = await requireAuth();

  const trips = await prisma.trip.findMany({
    where: { userId: session.user.id },
    include: { 
      stops: {
        orderBy: { stopOrder: "asc" },
        include: {
          activities: {
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
    orderBy: { startDate: "desc" },
  });

  return (
    <AppShell
      title="Itinerary for Selected Places"
      description="View day-by-day activities and expenses for your trips"
    >
      <ItineraryClient trips={trips} />
    </AppShell>
  );
}
