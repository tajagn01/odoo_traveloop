import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { ItineraryViewWithBudget } from "@/components/itinerary/itinerary-view-with-budget";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default async function ItineraryDetailPage({
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
        orderBy: { date: "asc" },
      },
      packingItems: {
        orderBy: { category: "asc" },
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
      actions={
        <Button asChild variant="outline" size="sm">
          <Link href="/itinerary" className="flex items-center gap-2">
            <ChevronLeft className="h-4 w-4" />
            Back to Itineraries
          </Link>
        </Button>
      }
    >
      <ItineraryViewWithBudget trip={trip} />
    </AppShell>
  );
}
