import { AppShell } from "@/components/layout/app-shell";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AdminUsersPage() {
  const session = await requireAuth();

  if (!isAdminEmail(session.user.email)) {
    return (
      <AppShell title="Admin — Users" description="Access denied.">
        <div />
      </AppShell>
    );
  }

  const users = await prisma.user.findMany({
    include: {
      _count: { select: { trips: true } },
      trips: {
        select: {
          id: true,
          tripName: true,
          startDate: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 3,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AppShell
      title="User Management"
      description="All registered users and their activity."
    >
      <div className="space-y-4">
        {users.map((user) => (
          <Card key={user.id} className="border-border/70">
            <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
              <div>
                <CardTitle className="text-base font-semibold">{user.name}</CardTitle>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <Badge>{user._count.trips} trips</Badge>
            </CardHeader>
            <CardContent>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Recent trips
              </p>
              {user.trips.length > 0 ? (
                <div className="grid gap-2 sm:grid-cols-3">
                  {user.trips.map((trip) => (
                    <div
                      key={trip.id}
                      className="rounded-xl border border-border bg-background/60 px-3 py-2"
                    >
                      <p className="text-sm font-medium truncate">{trip.tripName}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(trip.startDate).toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No trips yet.</p>
              )}
              <p className="mt-3 text-xs text-muted-foreground">
                Joined {new Date(user.createdAt).toLocaleDateString("en-US", { dateStyle: "medium" })}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
