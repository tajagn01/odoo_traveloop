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
      {/* Sort / filter tab bar */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mr-2">
          Sort by
        </span>
        {["Activity", "Map", "Stats"].map((tab) => (
          <span
            key={tab}
            className="rounded-full border border-border bg-card px-4 py-1.5 text-xs font-semibold text-foreground cursor-pointer hover:bg-muted transition"
          >
            {tab}
          </span>
        ))}
      </div>

      {/* Physical Activity filter tags */}
      <div className="mb-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Physical Activity &amp; Interest Filters
        </p>
        <div className="flex flex-wrap gap-2">
          {activityFilters.map((filter) => (
            <span
              key={filter}
              className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground cursor-pointer hover:bg-primary hover:text-primary-foreground hover:border-primary transition"
            >
              {filter}
            </span>
          ))}
        </div>
      </div>

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
