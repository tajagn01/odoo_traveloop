"use client";

import { CalendarDays, MapPin, Clock, Play, CheckCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateRange } from "@/lib/format";

type TripRowWithStatusProps = {
  id: string;
  tripName: string;
  description: string | null;
  startDate: Date;
  endDate: Date;
  stops: unknown[];
  status: "upcoming" | "ongoing" | "completed";
};

const statusConfig = {
  upcoming: {
    label: "Upcoming",
    icon: Clock,
    color: "text-blue-600",
  },
  ongoing: {
    label: "Ongoing",
    icon: Play,
    color: "text-green-600",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle,
    color: "text-gray-600",
  },
};

export function TripRowWithStatus({
  trip,
  sourceLabel,
  showDeleteButton = false,
}: {
  trip: TripRowWithStatusProps;
  sourceLabel?: string;
  showDeleteButton?: boolean;
}) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(trip.status || "upcoming");
  const config = statusConfig[currentStatus as keyof typeof statusConfig] || statusConfig.upcoming;
  const StatusIcon = config.icon;

  const updateStatus = async (newStatus: "upcoming" | "ongoing" | "completed") => {
    if (newStatus === currentStatus) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/trips/${trip.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Status update error:", error);
        toast.error("Failed to update trip status");
        setIsUpdating(false);
        return;
      }

      setCurrentStatus(newStatus);
      toast.success(`Trip marked as ${newStatus}`);
      router.refresh();
    } catch (error) {
      console.error("Error updating trip status:", error);
      toast.error("Error updating trip status");
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteTrip = async () => {
    const confirmed = window.confirm(`Delete ${trip.tripName}? This cannot be undone.`);
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/trips/${trip.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        console.error("Delete trip error:", error);
        toast.error("Failed to delete trip");
        return;
      }

      toast.success("Trip deleted");
      router.refresh();
    } catch (error) {
      console.error("Error deleting trip:", error);
      toast.error("Error deleting trip");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="block rounded-2xl border border-border bg-card px-5 py-4 shadow-sm transition hover:shadow-md hover:bg-muted/50 cursor-pointer"
      onClick={(e) => {
        const target = e.target as HTMLElement;
        // Only navigate if clicking on the card itself or description, not on buttons
        if (!target.closest('button')) {
          e.preventDefault();
          window.location.href = `/trips/${trip.id}`;
        }
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-foreground">{trip.tripName}</p>
            <Badge variant="secondary" className="flex items-center gap-1 text-xs">
              <StatusIcon className={`h-3 w-3 ${config.color}`} />
              {config.label}
            </Badge>
            {sourceLabel ? (
              <Badge variant="outline" className="text-xs text-violet-700 border-violet-200 bg-violet-50 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-900/60">
                {sourceLabel}
              </Badge>
            ) : null}
          </div>
          {trip.description && (
            <p className="text-xs text-muted-foreground line-clamp-1">{trip.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatDateRange(trip.startDate, trip.endDate)}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {(trip.stops as unknown[]).length}{" "}
              {(trip.stops as unknown[]).length === 1 ? "stop" : "stops"}
            </span>
          </div>

          {/* Status Buttons */}
          <div className="flex flex-wrap gap-2 pt-2">
            {(["upcoming", "ongoing", "completed"] as const).map((status) => {
              const isCurrentStatus = currentStatus === status;
              const statusConf = statusConfig[status];
              const StatusIconComponent = statusConf.icon;
              return (
                <Button
                  key={status}
                  size="sm"
                  variant={isCurrentStatus ? "default" : "outline"}
                  onClick={(e) => {
                    e.stopPropagation();
                    updateStatus(status);
                  }}
                  disabled={isUpdating}
                  className={`capitalize text-xs ${isCurrentStatus ? "shadow-md" : ""}`}
                >
                  <StatusIconComponent className="h-3 w-3 mr-1" />
                  {status}
                </Button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {showDeleteButton ? (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                deleteTrip();
              }}
              disabled={isDeleting || isUpdating}
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Delete
            </Button>
          ) : null}
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = `/trips/${trip.id}`}
          >
            View
          </Button>
        </div>
      </div>
    </div>
  );
}
