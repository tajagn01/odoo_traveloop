"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp } from "lucide-react";

import { ActivitySearch } from "@/components/itinerary/activity-search";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/format";

export type BuilderActivity = {
  id: string;
  activityName: string;
  description: string | null;
  activityType: string;
  duration: number;
  cost: number;
  imageUrl: string | null;
};

export type BuilderStop = {
  id: string;
  cityId: string;
  cityName: string;
  country: string;
  arrivalDate: string;
  departureDate: string;
  stopOrder: number;
  activities: BuilderActivity[];
};

type BuilderStopsProps = {
  stops: BuilderStop[];
};

export function BuilderStops({ stops }: BuilderStopsProps) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);

  const updateStop = async (event: FormEvent<HTMLFormElement>, stopId: string) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      cityName: formData.get("cityName"),
      country: formData.get("country"),
      arrivalDate: formData.get("arrivalDate"),
      departureDate: formData.get("departureDate"),
    };

    const response = await fetch(`/api/stops/${stopId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      toast.error("Unable to update stop.");
      return;
    }

    toast.success("Stop updated.");
    setEditing(null);
    router.refresh();
  };

  const deleteStop = async (stopId: string) => {
    const response = await fetch(`/api/stops/${stopId}`, { method: "DELETE" });
    if (!response.ok) {
      toast.error("Unable to delete stop.");
      return;
    }

    toast.success("Stop deleted.");
    router.refresh();
  };

  const reorderStop = async (stopId: string, direction: "up" | "down") => {
    const response = await fetch(`/api/stops/${stopId}/reorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ direction }),
    });

    if (!response.ok) {
      toast.error("Unable to reorder stop.");
      return;
    }

    router.refresh();
  };

  const deleteActivity = async (activityId: string) => {
    const response = await fetch(`/api/activities/${activityId}`, { method: "DELETE" });
    if (!response.ok) {
      toast.error("Unable to remove activity.");
      return;
    }
    toast.success("Activity removed.");
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {stops.map((stop) => (
        <Card key={stop.id} className="border-border/70">
          <CardHeader className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle className="text-lg font-semibold">
                {stop.cityName}, {stop.country}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => reorderStop(stop.id, "up")}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => reorderStop(stop.id, "down")}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => deleteStop(stop.id)}>
                  Delete
                </Button>
                <Button size="sm" onClick={() => setEditing(stop.id)}>
                  Edit
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {formatDate(stop.arrivalDate)} to {formatDate(stop.departureDate)}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {editing === stop.id ? (
              <form className="grid gap-4 md:grid-cols-2" onSubmit={(event) => updateStop(event, stop.id)}>
                <div>
                  <Label>City</Label>
                  <Input name="cityName" defaultValue={stop.cityName} required />
                </div>
                <div>
                  <Label>Country</Label>
                  <Input name="country" defaultValue={stop.country} required />
                </div>
                <div>
                  <Label>Arrival</Label>
                  <Input name="arrivalDate" type="date" required defaultValue={stop.arrivalDate.slice(0, 10)} />
                </div>
                <div>
                  <Label>Departure</Label>
                  <Input name="departureDate" type="date" required defaultValue={stop.departureDate.slice(0, 10)} />
                </div>
                <div className="md:col-span-2 flex gap-2">
                  <Button type="submit">Save</Button>
                  <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                    Cancel
                  </Button>
                </div>
              </form>
            ) : null}

            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Activities</h3>
              {stop.activities.length ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {stop.activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="rounded-2xl border border-border bg-background px-4 py-3"
                    >
                      <p className="text-sm font-semibold">{activity.activityName}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.activityType} · Time {activity.duration}h · Cost ${activity.cost}
                      </p>
                      {activity.description ? (
                        <p className="mt-2 text-xs text-muted-foreground">{activity.description}</p>
                      ) : null}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteActivity(activity.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No activities added yet.</p>
              )}
            </div>

            <ActivitySearch stopId={stop.id} cityId={stop.cityId} />
          </CardContent>
        </Card>
      ))}
      {!stops.length ? (
        <Card className="border-dashed border-border">
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No stops yet. Add a city to start building the itinerary.
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
