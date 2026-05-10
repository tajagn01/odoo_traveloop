import Link from "next/link";
import { headers } from "next/headers";
import {
  CalendarDays,
  Wallet,
  PackageCheck,
  StickyNote,
  Pencil,
  Share2,
  MapPin,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { ItineraryView } from "@/components/itinerary/itinerary-view";
import { ShareActions } from "@/components/trips/share-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { enableShareAction } from "@/lib/actions/share";
import { formatDateRange, formatCurrency } from "@/lib/format";
import { summarizeExpenses } from "@/lib/expenses";
import type { StopCardData } from "@/components/itinerary/stop-card";

type StopQueryRow = {
  id: string;
  cityName: string;
  country: string;
  arrivalDate: Date;
  departureDate: Date;
  stopOrder: number;
  activities: Array<{
    id: string;
    activityName: string;
    description: string | null;
    activityType: string;
    duration: number;
    cost: number;
    imageUrl: string | null;
  }>;
};

export default async function TripPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireAuth();
  const trip = await prisma.trip.findFirst({
    where: { id, userId: session.user.id },
    include: {
      stops: { include: { activities: true }, orderBy: { stopOrder: "asc" } },
      notes: { orderBy: { createdAt: "desc" }, take: 3 },
      packingItems: true,
      expenses: true,
    },
  });

  if (!trip) {
    return (
      <AppShell title="Trip" description="Trip not found.">
        <div />
      </AppShell>
    );
  }

  const shareUrl = trip.shareToken
    ? await (async () => {
        const headersList = await headers();
        const host = headersList.get("host") ?? "localhost:3000";
        const protocol = headersList.get("x-forwarded-proto") ?? "http";
        return `${protocol}://${host}/share/${trip.shareToken}`;
      })()
    : "";

  const stops = (trip.stops as StopQueryRow[]).map((stop) => ({
    id: stop.id,
    cityName: stop.cityName,
    country: stop.country,
    arrivalDate: stop.arrivalDate.toISOString(),
    departureDate: stop.departureDate.toISOString(),
    stopOrder: stop.stopOrder,
    activities: stop.activities.map((a) => ({
      id: a.id,
      activityName: a.activityName,
      description: a.description,
      activityType: a.activityType,
      duration: a.duration,
      cost: a.cost,
      imageUrl: a.imageUrl,
    })),
  })) as StopCardData[];

  const budget = summarizeExpenses(
    trip.expenses.map((e) => ({ category: e.category, amount: Number(e.amount) }))
  );
  const totalCost = budget.totalCost;
  const overBudget =
    trip.budgetLimit != null && totalCost != null && totalCost > Number(trip.budgetLimit);

  const packedCount = trip.packingItems.filter((i: { isPacked: boolean }) => i.isPacked).length;
  const totalItems = trip.packingItems.length;

  return (
    <AppShell
      title={trip.tripName}
      description={formatDateRange(trip.startDate, trip.endDate)}
      actions={
        <Button asChild variant="outline" size="sm">
          <Link href={`/trips/${trip.id}/edit`}>
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            Edit trip
          </Link>
        </Button>
      }
    >
      <div className="space-y-8">
        {/* ── Quick nav ── */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Builder", href: `/trips/${id}/builder`, icon: MapPin },
            { label: "Budget", href: `/trips/${id}/budget`, icon: Wallet },
            { label: "Packing", href: `/trips/${id}/packing`, icon: PackageCheck },
            { label: "Notes", href: `/trips/${id}/notes`, icon: StickyNote },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground shadow-sm transition hover:bg-muted"
            >
              <item.icon className="h-4 w-4 text-primary" />
              {item.label}
            </Link>
          ))}
        </div>

        {/* ── Snapshot row ── */}
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Budget snapshot */}
          <Link href={`/trips/${id}/budget`}>
            <Card className="border-border/70 h-full transition hover:shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <Wallet className="h-4 w-4 text-primary" />
                  Budget
                </CardTitle>
              </CardHeader>
              <CardContent>
                {totalCost > 0 ? (
                  <>
                    <p className="text-2xl font-bold text-foreground">
                      {formatCurrency(totalCost)}
                    </p>
                    {trip.budgetLimit && (
                      <p className={`mt-1 text-xs ${overBudget ? "text-red-500" : "text-emerald-600"}`}>
                        {overBudget ? "Over budget" : "On track"} / limit {formatCurrency(Number(trip.budgetLimit))}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Not set — click to add</p>
                )}
              </CardContent>
            </Card>
          </Link>

          {/* Packing snapshot */}
          <Link href={`/trips/${id}/packing`}>
            <Card className="border-border/70 h-full transition hover:shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <PackageCheck className="h-4 w-4 text-primary" />
                  Packing
                </CardTitle>
              </CardHeader>
              <CardContent>
                {totalItems > 0 ? (
                  <>
                    <p className="text-2xl font-bold text-foreground">
                      {packedCount}/{totalItems}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">items packed</p>
                    <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${Math.round((packedCount / totalItems) * 100)}%` }}
                      />
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">No items — click to add</p>
                )}
              </CardContent>
            </Card>
          </Link>

          {/* Notes snapshot */}
          <Link href={`/trips/${id}/notes`}>
            <Card className="border-border/70 h-full transition hover:shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <StickyNote className="h-4 w-4 text-primary" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {trip.notes.length > 0 ? (
                  <ul className="space-y-1">
                    {trip.notes.map((note: { id: string; noteContent: string }) => (
                      <li key={note.id} className="text-xs text-muted-foreground line-clamp-1">
                        · {note.noteContent}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No notes — click to add</p>
                )}
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* ── Itinerary view ── */}
        <ItineraryView
          stops={stops}
          startDate={trip.startDate.toISOString()}
          endDate={trip.endDate.toISOString()}
        />
      </div>
    </AppShell>
  );
}
