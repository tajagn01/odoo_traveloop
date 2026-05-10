"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateRange } from "@/lib/format";
import { getPlaceImage } from "@/lib/images";

export type TripCardData = {
  id: string;
  tripName: string;
  startDate: string;
  endDate: string;
  stopCount: number;
  coverPhoto?: string | null;
  description?: string | null;
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

  const defaultImage = getPlaceImage(trip.tripName);

  return (
    <Card className="border-border/70 overflow-hidden flex flex-col hover:shadow-md transition-shadow h-full">
      <div className="relative h-40 w-full bg-muted shrink-0">
        <img
          src={trip.coverPhoto || defaultImage}
          alt={trip.tripName}
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute top-3 right-3">
          <Badge className="bg-background/80 text-foreground backdrop-blur-sm border-none shadow-sm">
            {trip.stopCount} stops
          </Badge>
        </div>
      </div>
      <CardHeader className="space-y-1.5 pb-3 flex-1">
        <CardTitle className="text-lg font-semibold line-clamp-1">{trip.tripName}</CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground pb-1">
          <CalendarDays className="h-3.5 w-3.5" />
          {formatDateRange(trip.startDate, trip.endDate)}
        </div>
        {trip.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
            {trip.description}
          </p>
        )}
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2 pt-0 mt-auto">
        <Button asChild size="sm" className="flex-1">
          <Link href={`/trips/${trip.id}`}>View</Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="px-3">
          <Link href={`/trips/${trip.id}/builder`}>
            <Pencil className="h-4 w-4" />
          </Link>
        </Button>
        <Button size="sm" variant="ghost" onClick={onDelete} className="px-3 text-red-500 hover:text-red-600 hover:bg-red-500/10">
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
