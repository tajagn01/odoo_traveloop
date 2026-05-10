import { AppShell } from "@/components/layout/app-shell";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";
import { AdminCharts } from "@/components/admin/admin-charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { summarizeExpenses } from "@/lib/expenses";

export default async function AdminTripsPage() {
  const session = await requireAuth();

  if (!isAdminEmail(session.user.email)) {
    return (
      <AppShell title="Admin — Trips" description="Access denied.">
        <div />
      </AppShell>
    );
  }

  const [topCities, tripStats, recentTrips] = await Promise.all([
    prisma.stop.groupBy({
      by: ["cityName"],
      _count: { cityName: true },
      orderBy: { _count: { cityName: "desc" } },
      take: 8,
    }),
    prisma.trip.aggregate({
      _count: { id: true },
    }),
    prisma.trip.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        user: { select: { name: true, email: true } },
        _count: { select: { stops: true } },
        expenses: true,
      },
    }),
  ]);

  return (
    <AppShell
      title="Trips Analytics"
      description="Popular destinations, activity trends, and recent trip data."
    >
      <div className="space-y-8">
        <AdminCharts
          topCities={topCities.map((c) => ({ name: c.cityName, value: c._count.cityName }))}
        />

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Recent trips ({tripStats._count.id} total)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentTrips.map((trip) => {
              const totalCost = summarizeExpenses(
                trip.expenses.map((e) => ({ category: e.category, amount: Number(e.amount) }))
              ).totalCost;
              return (
                <div
                  key={trip.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-background px-4 py-3 text-sm"
                >
                  <div>
                    <p className="font-semibold">{trip.tripName}</p>
                    <p className="text-xs text-muted-foreground">
                      by {trip.user.name ?? trip.user.email} · {trip._count.stops} stops
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {totalCost > 0 ? formatCurrency(totalCost) : "No budget"}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
