import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "@/components/profile/profile-form";
import { DeleteAccountButton } from "@/components/profile/delete-account";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage() {
  const session = await requireAuth();
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { trips: { include: { stops: true } } },
  });

  if (!user) {
    return (
      <AppShell title="Profile" description="User not found.">
        <div />
      </AppShell>
    );
  }

  const destinations: string[] = Array.from(
    new Set(
      user.trips.flatMap((trip: { stops: { cityName: string }[] }) =>
        trip.stops.map((stop) => stop.cityName)
      )
    )
  );

  return (
    <AppShell title="Profile" description="Manage your account details and preferences.">
      <div className="space-y-8">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Profile settings</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileForm
              name={user.name}
              email={user.email}
              languagePreference={user.languagePreference}
            />
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Saved destinations</CardTitle>
          </CardHeader>
          <CardContent>
            {destinations.length ? (
              <div className="flex flex-wrap gap-2">
                {destinations.map((destination) => (
                  <span
                    key={destination}
                    className="rounded-full border border-border bg-muted px-3 py-1 text-xs"
                  >
                    {destination}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No destinations saved yet.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Danger zone</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Deleting your account removes all trips and shared itineraries.
            </p>
            <div className="mt-4">
              <DeleteAccountButton />
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
