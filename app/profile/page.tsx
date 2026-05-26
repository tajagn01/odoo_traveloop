import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/profile/profile-form";
import { DeleteAccountButton } from "@/components/profile/delete-account";
import { SavedDestinations } from "@/components/profile/saved-destinations";

export default async function ProfilePage() {
  const session = await requireAuth();
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      trips: {
        include: { stops: true },
        orderBy: { startDate: "desc" },
      },
      savedDestinations: {
        include: { city: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    return <div>User not found</div>;
  }

  const now = new Date();
  const preplannedTrips = user.trips.filter((t) => t.startDate > now);
  const previousTrips = user.trips.filter((t) => t.endDate < now);
  const profileImage = user.image ?? user.profilePhoto ?? null;

  return (
    <AppShell title="Profile" description="View your profile, edit travel preferences, and review trip history">
      <div className="space-y-12">
        {/* User Profile Header */}
        <div className="rounded-2xl border border-border bg-card p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
            {/* Profile Image */}
            <div className="flex flex-shrink-0 items-center justify-center">
              <div className="h-40 w-40 rounded-full border-2 border-border bg-muted flex items-center justify-center overflow-hidden">
                {profileImage ? (
                  <img src={profileImage} alt={user.name || "User"} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-4xl font-bold text-white">
                    {(user.name || "U").charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            {/* User Details */}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">{user.name || "User"}</h1>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>

              <div className="space-y-3 rounded-lg border border-border/50 bg-muted/30 p-4">
                <p className="text-sm font-medium text-foreground">Account Details</p>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Email verified:</span> {user.emailVerified ? "✓ Yes" : "Not verified"}</p>
                  <p><span className="font-medium">Member since:</span> {user.createdAt.toLocaleDateString()}</p>
                  <p><span className="font-medium">Total trips:</span> {user.trips.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Profile Settings & Saved Destinations */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile Form */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <h2 className="text-xl font-bold text-foreground">Profile Settings</h2>
            <ProfileForm
              name={user.name}
              email={user.email}
              languagePreference={user.languagePreference}
            />
          </div>

          {/* Saved Destinations */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <h2 className="text-xl font-bold text-foreground">Saved Destinations</h2>
            <SavedDestinations
              destinations={user.savedDestinations.map((saved) => ({
                cityId: saved.cityId,
                cityName: saved.city.name,
                country: saved.city.country,
                region: saved.city.region,
              }))}
            />
          </div>
        </div>

        {/* Preplanned Trips */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Preplanned Trips</h2>
            <p className="text-sm text-muted-foreground">Upcoming adventures</p>
          </div>

          {preplannedTrips.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {preplannedTrips.map((trip) => (
                <Link
                  key={trip.id}
                  href={`/trips/${trip.id}`}
                  className="group rounded-xl border border-border bg-card p-6 transition hover:border-primary hover:shadow-md"
                >
                  <div className="space-y-3">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition">{trip.tripName}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{trip.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>📍 {trip.stops.length} stops</span>
                    </div>
                  </div>
                  <Button asChild variant="outline" size="sm" className="mt-4 w-full">
                    <span>View</span>
                  </Button>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
              <p className="text-sm text-muted-foreground">No upcoming trips planned yet.</p>
              <Button asChild className="mt-4">
                <Link href="/trips/new">Plan a Trip</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Previous Trips */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Previous Trips</h2>
            <p className="text-sm text-muted-foreground">Completed adventures</p>
          </div>

          {previousTrips.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {previousTrips.map((trip) => (
                <Link
                  key={trip.id}
                  href={`/trips/${trip.id}`}
                  className="group rounded-xl border border-border bg-card/50 p-6 transition hover:border-primary hover:shadow-md"
                >
                  <div className="space-y-3">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition">{trip.tripName}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{trip.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>📍 {trip.stops.length} stops</span>
                      <span>✓ Completed</span>
                    </div>
                  </div>
                  <Button asChild variant="outline" size="sm" className="mt-4 w-full">
                    <span>View</span>
                  </Button>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
              <p className="text-sm text-muted-foreground">No completed trips yet.</p>
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className="rounded-2xl border border-red-200/50 bg-red-50/5 dark:bg-red-950/5 p-6 border-dashed space-y-2">
          <h2 className="text-lg font-bold text-red-600 dark:text-red-500">Danger Zone</h2>
          <p className="text-sm text-muted-foreground">
            Deleting your account will permanently remove all your trips, itineraries, and settings. This action is irreversible.
          </p>
          <div className="pt-2">
            <DeleteAccountButton />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
