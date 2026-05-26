import Link from "next/link";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { updateTripAction } from "@/lib/actions/trips";

export default async function EditTripPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireAuth();
  const today = new Date().toLocaleDateString('en-CA');

  const trip = await prisma.trip.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!trip) {
    return (
      <AppShell title="Edit trip" description="Trip not found.">
        <div />
      </AppShell>
    );
  }

  return (
    <AppShell
      title={`Edit: ${trip.tripName}`}
      description="Update your trip details below."
      actions={
        <Button asChild variant="outline" size="sm">
          <Link href={`/trips/${trip.id}`}>Cancel</Link>
        </Button>
      }
    >
      <Card className="border-border/70 max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Trip details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateTripAction} className="space-y-5">
            <input type="hidden" name="tripId" value={trip.id} />
            <div className="space-y-1">
              <Label htmlFor="tripName">Trip name</Label>
              <Input
                id="tripName"
                name="tripName"
                defaultValue={trip.tripName}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={trip.description ?? ""}
                placeholder="Short overview of your trip"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="startDate">Start date</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  min={today}
                  defaultValue={trip.startDate.toISOString().slice(0, 10)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="endDate">End date</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  min={today}
                  defaultValue={trip.endDate.toISOString().slice(0, 10)}
                  required
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="coverPhoto">Cover photo</Label>
              <Input
                id="coverPhoto"
                name="coverPhoto"
                type="file"
                accept="image/*"
              />
              {trip.coverPhoto && (
                <p className="text-xs text-muted-foreground mt-1">
                  Leave empty to keep current photo.
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <Button type="submit">Save changes</Button>
              <Button asChild variant="outline">
                <Link href={`/trips/${trip.id}`}>Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </AppShell>
  );
}
