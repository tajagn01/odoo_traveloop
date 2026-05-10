import { AppShell } from "@/components/layout/app-shell";
import { ActivitySearch } from "@/components/itinerary/activity-search";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

export default async function ActivitiesPage() {
  const session = await requireAuth();

  const stops = await prisma.stop.findMany({
    where: { trip: { userId: session.user.id } },
    include: { trip: { select: { tripName: true } } },
    orderBy: [{ updatedAt: "desc" }],
  });

  return (
    <AppShell
      title="Activity Search"
      description="Browse activities by type, cost, and duration. Add them to any stop in your itinerary."
    >
      {/* Sort / filter tab bar */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mr-2">
          Sort by
        </span>
        {["Activity", "Map", "Stats"].map((tab) => (
          <span
            key={tab}
            className="rounded-full border border-border bg-card px-4 py-1.5 text-xs font-semibold text-foreground cursor-pointer hover:bg-muted transition first-of-type:bg-primary first-of-type:text-primary-foreground first-of-type:border-primary"
          >
            {tab}
          </span>
        ))}
      </div>

      {!stops.length ? (
        <div className="rounded-2xl border-2 border-dashed border-border py-16 text-center">
          <p className="text-sm font-semibold text-foreground">No stops yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Add a city stop to a trip first, then assign activities.
          </p>
        </div>
      ) : (
        <ActivitySearch
          stopOptions={stops.map((stop) => ({
            id: stop.id,
            cityId: stop.cityId,
            cityName: stop.cityName,
            country: stop.country,
            tripName: stop.trip.tripName,
          }))}
        />
      )}
    </AppShell>
  );
}
