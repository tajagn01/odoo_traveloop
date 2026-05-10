import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { ItineraryViewWithBudget } from "@/components/itinerary/itinerary-view-with-budget";
import { notFound } from "next/navigation";

export default async function ItineraryViewPage({
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
      expenses: {
        orderBy: { date: "desc" },
      },
    },
  });

  if (!trip) {
    notFound();
  }

  return (
    <AppShell
      title={`${trip.tripName} - Itinerary`}
      description="View your complete itinerary with activities and budget breakdown"
    >
      <ItineraryViewWithBudget trip={trip} />
    </AppShell>
  );
}
