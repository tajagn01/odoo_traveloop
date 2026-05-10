import { AppShell } from "@/components/layout/app-shell";
import { CitySearch } from "@/components/itinerary/city-search";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

const activityFilters = [
  "Physical Activity",
  "Cultural",
  "Food & Dining",
  "Nature",
  "Nightlife",
  "Shopping",
  "Adventure",
  "Wellness",
];

export default async function CitiesPage() {
  const session = await requireAuth();
  const [trips, savedDestinations] = await Promise.all([
    prisma.trip.findMany({
      where: { userId: session.user.id },
      select: { id: true, tripName: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.savedDestination.findMany({
      where: { userId: session.user.id },
      select: { cityId: true },
    }),
  ]);

  return (
    <AppShell
      title="City Search"
      description="Discover destinations by region, cost, or popularity and add them directly to a trip."
    >


      {trips.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border py-16 text-center">
          <p className="text-sm font-semibold text-foreground">No trips yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Create a trip first, then use city search to add destinations.
          </p>
        </div>
      ) : (
        <CitySearch
          trips={trips}
          savedCityIds={savedDestinations.map((saved) => saved.cityId)}
        />
      )}
    </AppShell>
  );
}
