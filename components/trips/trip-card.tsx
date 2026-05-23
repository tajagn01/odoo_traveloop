"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, Pencil, Trash2, Clock, Play, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

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
  status: "upcoming" | "ongoing" | "completed";
  coverPhoto?: string | null;
  description?: string | null;
};

const statusConfig = {
  upcoming: {
    label: "Upcoming",
    variant: "secondary" as const,
    icon: Clock,
    color: "text-blue-600",
  },
  ongoing: {
    label: "Ongoing",
    variant: "secondary" as const,
    icon: Play,
    color: "text-green-600",
  },
  completed: {
    label: "Completed",
    variant: "secondary" as const,
    icon: CheckCircle,
    color: "text-gray-600",
  },
};

export function TripCard({ trip }: { trip: TripCardData }) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const config = statusConfig[trip.status] || statusConfig.upcoming;
  const StatusIcon = config.icon;

  const onDelete = async () => {
    const response = await fetch(`/api/trips/${trip.id}`, { method: "DELETE" });
    if (!response.ok) {
      toast.error("Unable to delete trip.");
      return;
    }
    toast.success("Trip removed.");
    router.refresh();
  };

  const updateStatus = async (newStatus: "upcoming" | "ongoing" | "completed") => {
    if (newStatus === trip.status) return;
    
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/trips/${trip.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        toast.error("Failed to update trip status");
        return;
      }

      toast.success(`Trip marked as ${newStatus}`);
      router.refresh();
    } catch (error) {
      toast.error("Error updating trip status");
    } finally {
      setIsUpdating(false);
    }
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
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg font-semibold line-clamp-1">{trip.tripName}</CardTitle>
          <Badge variant={config.variant} className="flex items-center gap-1 text-xs whitespace-nowrap shrink-0">
            <StatusIcon className={`h-3 w-3 ${config.color}`} />
            {config.label}
          </Badge>
        </div>
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
<<<<<<< HEAD
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
      <CardContent className="space-y-3">
        {/* Status Update Section */}
=======
      <CardContent className="space-y-3 pt-0 mt-auto">
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" className="flex-1">
            <Link href={`/trips/${trip.id}`}>View</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="px-3">
            <Link href={`/trips/${trip.id}/builder`}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onDelete}
            className="px-3 text-red-500 hover:text-red-600 hover:bg-red-500/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
>>>>>>> defd7af6b5f821aa868535d190a977e490363853
        <div className="border-t pt-3">
          <p className="text-xs font-semibold text-muted-foreground mb-2">Trip Status</p>
          <div className="flex flex-wrap gap-2">
            {(["upcoming", "ongoing", "completed"] as const).map((status) => {
              const isCurrentStatus = trip.status === status;
              const statusConf = statusConfig[status];
              const StatusIconComponent = statusConf.icon;
              return (
                <Button
                  key={status}
                  size="sm"
                  variant={isCurrentStatus ? "default" : "outline"}
                  onClick={() => updateStatus(status)}
                  disabled={isUpdating}
                  className={`capitalize ${isCurrentStatus ? "shadow-md" : ""}`}
                >
                  <StatusIconComponent className="h-3 w-3 mr-1" />
                  {status}
                </Button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
