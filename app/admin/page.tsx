import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminCharts } from "@/components/admin/admin-charts";
import { requireAuth } from "@/lib/auth-guard";
import { isAdminEmail } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const session = await requireAuth();

  if (!isAdminEmail(session.user.email)) {
    return (
      <AppShell
        title="Admin"
        description="You do not have access to the admin dashboard."
      >
        <div />
      </AppShell>
    );
  }

  const [tripCount, userCount, topCities, topActivities, users] =
    await Promise.all([
      prisma.trip.count(),
      prisma.user.count(),
      prisma.stop.groupBy({
        by: ["cityName"],
        _count: { cityName: true },
        orderBy: { _count: { cityName: "desc" } },
        take: 5,
      }),
      prisma.activity.groupBy({
        by: ["activityName"],
        _count: { activityName: true },
        orderBy: { _count: { activityName: "desc" } },
        take: 5,
      }),
      prisma.user.findMany({
        include: { _count: { select: { trips: true } } },
        orderBy: { createdAt: "desc" },
      }),
    ]);

  return (
    <AppShell
      title="Admin dashboard"
      description="Monitor usage stats and manage travelers."
    >
      <div className="space-y-8">
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Trips created</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold">{tripCount}</CardContent>
          </Card>
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Users</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold">{userCount}</CardContent>
          </Card>
        </div>

        <AdminCharts
          topCities={topCities.map(
            (city: { cityName: string; _count: { cityName: number } }) => ({
              name: city.cityName,
              value: city._count.cityName,
            })
          )}
          topActivities={topActivities.map(
            (activity: {
              activityName: string;
              _count: { activityName: number };
            }) => ({
              name: activity.activityName,
              value: activity._count.activityName,
            })
          )}
        />

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-base font-semibold">User management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {users.map(
              (user: {
                id: string;
                name: string | null;
                email: string | null;
                _count: { trips: number };
              }) => (
              <div
                key={user.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-background px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <div className="text-xs text-muted-foreground">
                  Trips: {user._count.trips}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
