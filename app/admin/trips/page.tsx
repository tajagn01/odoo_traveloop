import { AppShell } from "@/components/layout/app-shell";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";
import { AdminCharts } from "@/components/admin/admin-charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";
import { summarizeExpenses } from "@/lib/expenses";

type TopCityRow = {
  cityName: string;
  _count: {
    cityName: number;
  };
};

const statusConfig = {
  upcoming: { label: "Upcoming", className: "bg-blue-100 text-blue-700 border-blue-200" },
  ongoing: { label: "Ongoing", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  completed: { label: "Completed", className: "bg-slate-100 text-slate-700 border-slate-200" },
} as const;

export default async function AdminTripsPage() {
  const session = await requireAuth();

  if (!isAdminEmail(session.user.email)) {
    return (
      <AppShell title="Admin — Trips" description="Access denied.">
        <div />
      </AppShell>
    );
  }

  const [rawTopCities, tripStats, recentTrips, upcomingCount, ongoingCount, completedCount] = await Promise.all([
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
    prisma.trip.count({ where: { status: "upcoming" } }),
    prisma.trip.count({ where: { status: "ongoing" } }),
    prisma.trip.count({ where: { status: "completed" } }),
  ]);

  const topCities = rawTopCities as TopCityRow[];

  const tripStatus = [
    { name: "Upcoming", value: upcomingCount },
    { name: "Ongoing", value: ongoingCount },
    { name: "Completed", value: completedCount },
  ];

  return (
    <AppShell
      title="Trips Analytics"
      description="Popular destinations, activity trends, and recent trip data."
    >
      <div className="space-y-8">
        <AdminCharts
          topCities={topCities.map((c) => ({ name: c.cityName, value: c._count.cityName }))}
          tripStatus={tripStatus}
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
              const statusKey = (trip.status ?? "upcoming") as keyof typeof statusConfig;
              const statusInfo = statusConfig[statusKey] ?? statusConfig.upcoming;
              return (
                <div
                  key={trip.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-background px-4 py-3 text-sm"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{trip.tripName}</p>
                      <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
                    </div>
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
