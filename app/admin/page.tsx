import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminCharts } from "@/components/admin/admin-charts";
import { requireAuth } from "@/lib/auth-guard";
import { isAdminEmail } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";
import { COMMUNITY_MOCK_COUNT } from "@/lib/community-mock";

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

  const [
    tripCount,
    userCount,
    topCities,
    users,
    upcomingCount,
    ongoingCount,
    completedCount,
    publicTripCount,
    communityPostCountDb,
    tripCopyCount,
    stopCount,
    activityCount,
    avgBudgetResult,
  ] = await Promise.all([
    prisma.trip.count(),
    prisma.user.count(),
    prisma.stop.groupBy({
      by: ["cityName"],
      _count: { cityName: true },
      orderBy: { _count: { cityName: "desc" } },
      take: 5,
    }),
    prisma.user.findMany({
      include: { _count: { select: { trips: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.trip.count({ where: { status: "upcoming" } }),
    prisma.trip.count({ where: { status: "ongoing" } }),
    prisma.trip.count({ where: { status: "completed" } }),
    prisma.trip.count({ where: { isPublic: true } }),
    prisma.communityPost.count(),
    prisma.tripCopy.count(),
    prisma.stop.count(),
    prisma.activity.count(),
    prisma.trip.aggregate({
      _avg: { budgetLimit: true },
    }),
  ]);

  const avgBudget = avgBudgetResult._avg.budgetLimit;
  const communityPostCount = communityPostCountDb || COMMUNITY_MOCK_COUNT;

  const tripStatus = [
    { name: "Upcoming", value: upcomingCount },
    { name: "Ongoing", value: ongoingCount },
    { name: "Completed", value: completedCount },
  ];

  return (
    <AppShell
      title="Admin dashboard"
      description="Monitor usage stats and manage travelers."
    >
      <div className="space-y-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Public trips</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold">{publicTripCount}</CardContent>
          </Card>
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Community posts</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold">{communityPostCount}</CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Total stops</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold">{stopCount}</CardContent>
          </Card>
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Total activities</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold">{activityCount}</CardContent>
          </Card>
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Trip copies</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold">{tripCopyCount}</CardContent>
          </Card>
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Avg. budget</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold">
              {avgBudget === null || avgBudget === undefined
                ? "-"
                : formatCurrency(avgBudget)}
            </CardContent>
          </Card>
        </div>

        <AdminCharts
          topCities={topCities.map(
            (city: { cityName: string; _count: { cityName: number } }) => ({
              name: city.cityName,
              value: city._count.cityName,
            })
          )}
          tripStatus={tripStatus}
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
