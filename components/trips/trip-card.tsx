"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateRange } from "@/lib/format";

export type TripCardData = {
  id: string;
  tripName: string;
  startDate: string;
  endDate: string;
  stopCount: number;
};

export function TripCard({ trip }: { trip: TripCardData }) {
  const router = useRouter();

  const onDelete = async () => {
    const response = await fetch(`/api/trips/${trip.id}`, { method: "DELETE" });
    if (!response.ok) {
      toast.error("Unable to delete trip.");
      return;
    }
    toast.success("Trip removed.");
    router.refresh();
  };

  return (
    <Card className="border-border/70">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{trip.tripName}</CardTitle>
          <Badge>{trip.stopCount} stops</Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4" />
          {formatDateRange(trip.startDate, trip.endDate)}
        </div>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Button asChild size="sm">
          <Link href={`/trips/${trip.id}`}>View</Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href={`/trips/${trip.id}/builder`}>
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
        </Button>
        <Button size="sm" variant="ghost" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </CardContent>
    </Card>
  );
}
