import Image from "next/image";
import Link from "next/link";
import { User, CalendarDays, MapPin } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "@/components/profile/profile-form";
import { DeleteAccountButton } from "@/components/profile/delete-account";
import { SavedDestinations } from "@/components/profile/saved-destinations";
import { Badge } from "@/components/ui/badge";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { formatDateRange } from "@/lib/format";

type TripRow = {
  id: string;
  tripName: string;
  startDate: Date;
  endDate: Date;
  stops: { id: string }[];
};

export default async function SettingsPage() {
  const session = await requireAuth();
  const now = new Date();

  const [user, trips] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        savedDestinations: {
          include: { city: true },
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    prisma.trip.findMany({
      where: { userId: session.user.id },
      include: { stops: { select: { id: true } } },
      orderBy: { startDate: "asc" },
    }),
  ]);

  if (!user) {
    return (
      <AppShell title="Settings" description="User not found.">
        <div />
      </AppShell>
    );
  }

  const typedTrips = trips as TripRow[];
  const registeredTrips = typedTrips.filter((t) => t.startDate >= now);
  const previousTrips = typedTrips.filter((t) => t.endDate < now);

  return (
    <AppShell title="Settings" description="Manage your account details and travel preferences.">
      <div className="space-y-8">

        {/* ── User Profile Header ── */}
        <Card className="border-border/70">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              {/* Avatar */}
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-border bg-muted">
                {user.profilePhoto ? (
                  <Image
                    src={user.profilePhoto}
                    alt={user.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <User className="h-10 w-10 text-muted-foreground" />
                )}
              </div>
              {/* Info */}
              <div className="text-center sm:text-left">
                <h2 className="text-xl font-semibold text-foreground">{user.name}</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
                  <Badge className="bg-muted text-foreground text-xs">
                    {trips.length} {trips.length === 1 ? "Trip" : "Trips"}
                  </Badge>
                  {user.languagePreference && (
                    <Badge className="bg-muted text-foreground text-xs">
                      Lang: {user.languagePreference.toUpperCase()}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Registered / Upcoming Trips ── */}
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Registered Trips</CardTitle>
          </CardHeader>
          <CardContent>
            {registeredTrips.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming trips.</p>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {registeredTrips.map((trip) => (
                  <Link
                    key={trip.id}
                    href={`/trips/${trip.id}`}
                    className="flex-shrink-0 w-44 rounded-2xl border border-border bg-muted/40 p-4 transition hover:bg-muted hover:shadow-sm"
                  >
                    <p className="text-sm font-semibold text-foreground line-clamp-1">
                      {trip.tripName}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <CalendarDays className="h-3 w-3" />
                      {formatDateRange(trip.startDate, trip.endDate)}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {trip.stops.length} {trip.stops.length === 1 ? "stop" : "stops"}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Previous Trips ── */}
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Previous Trips</CardTitle>
          </CardHeader>
          <CardContent>
            {previousTrips.length === 0 ? (
              <p className="text-sm text-muted-foreground">No completed trips yet.</p>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {previousTrips.map((trip) => (
                  <Link
                    key={trip.id}
                    href={`/trips/${trip.id}`}
                    className="flex-shrink-0 w-44 rounded-2xl border border-border bg-muted/20 p-4 opacity-80 transition hover:opacity-100 hover:shadow-sm"
                  >
                    <p className="text-sm font-semibold text-foreground line-clamp-1">
                      {trip.tripName}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <CalendarDays className="h-3 w-3" />
                      {formatDateRange(trip.startDate, trip.endDate)}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {trip.stops.length} {trip.stops.length === 1 ? "stop" : "stops"}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Profile Form ── */}
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Profile Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileForm
              name={user.name}
              email={user.email}
              languagePreference={user.languagePreference}
            />
          </CardContent>
        </Card>

        {/* ── Saved Destinations ── */}
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Saved Destinations</CardTitle>
          </CardHeader>
          <CardContent>
            <SavedDestinations
              destinations={user.savedDestinations.map((saved) => ({
                cityId: saved.cityId,
                cityName: saved.city.name,
                country: saved.city.country,
                region: saved.city.region,
              }))}
            />
          </CardContent>
        </Card>

        {/* ── Danger Zone ── */}
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Danger Zone</CardTitle>
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
