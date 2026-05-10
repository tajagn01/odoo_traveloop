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

export type TripCardData = {
  id: string;
  tripName: string;
  startDate: string;
  endDate: string;
  stopCount: number;
  status: "upcoming" | "ongoing" | "completed";
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
  const config = statusConfig[trip.status];
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

  return (
    <Card className="border-border/70">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-semibold">{trip.tripName}</CardTitle>
            <Badge variant={config.variant} className="flex items-center gap-1 text-xs">
              <StatusIcon className={`h-3 w-3 ${config.color}`} />
              {config.label}
            </Badge>
          </div>
          <Badge>{trip.stopCount} stops</Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4" />
          {formatDateRange(trip.startDate, trip.endDate)}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Status buttons */}
        <div className="flex flex-wrap gap-2">
          {(["upcoming", "ongoing", "completed"] as const).map((status) => (
            <Button
              key={status}
              size="sm"
              variant={trip.status === status ? "default" : "outline"}
              onClick={() => updateStatus(status)}
              disabled={isUpdating}
              className="capitalize"
            >
              {status}
            </Button>
          ))}
        </div>
        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
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
        </div>
      </CardContent>
    </Card>
  );
}
