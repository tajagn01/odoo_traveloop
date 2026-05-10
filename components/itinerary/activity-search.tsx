"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const types = ["All", "Sightseeing", "Food", "Culture", "Outdoor", "Relax"];

type ActivityResult = {
  id: string;
  activityName: string;
  description: string;
  activityType: string;
  duration: number;
  cost: number;
  imageUrl?: string | null;
  cityName: string;
  country: string;
  cityId: string;
};

type StopOption = {
  id: string;
  cityId: string;
  cityName: string;
  country: string;
  tripName?: string;
};

type ActivitySearchProps = {
  stopId?: string;
  cityId?: string;
  stopOptions?: StopOption[];
};

export function ActivitySearch({
  stopId,
  cityId,
  stopOptions,
}: ActivitySearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("All");
  const [cost, setCost] = useState("");
  const [duration, setDuration] = useState("");
  const [results, setResults] = useState<ActivityResult[]>([]);
  const [selectedStopId, setSelectedStopId] = useState(
    stopId ?? stopOptions?.[0]?.id ?? ""
  );

  const selectedStop = useMemo(
    () => stopOptions?.find((stopOption) => stopOption.id === selectedStopId),
    [selectedStopId, stopOptions]
  );
  const selectedCityId = cityId ?? selectedStop?.cityId ?? "";

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("query", query);
    if (type && type !== "All") params.set("type", type);
    if (cost) params.set("cost", cost);
    if (duration) params.set("duration", duration);
    if (selectedCityId) params.set("cityId", selectedCityId);

    fetch(`/api/activities?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setResults(data.results ?? []))
      .catch(() => setResults([]));
  }, [query, type, cost, duration, selectedCityId]);

  const handleAdd = async (activity: ActivityResult) => {
    if (!selectedStopId) {
      toast.error("Choose a stop first.");
      return;
    }

    const response = await fetch(`/api/stops/${selectedStopId}/activities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activityId: activity.id }),
    });

    if (!response.ok) {
      toast.error("Unable to add activity.");
      return;
    }

    toast.success("Activity added to this stop.");
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 rounded-3xl border border-border bg-card p-4 md:grid-cols-4">
        <div className="md:col-span-2">
          <Label htmlFor="activitySearch">Search activities</Label>
          <Input
            id="activitySearch"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by activity"
          />
        </div>
        {stopOptions ? (
          <div>
            <Label>Stop</Label>
            <Select value={selectedStopId} onValueChange={setSelectedStopId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a stop" />
              </SelectTrigger>
              <SelectContent>
                {stopOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.cityName}, {option.country}
                    {option.tripName ? ` · ${option.tripName}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}
        <div>
          <Label>Type</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              {types.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="cost">Max cost</Label>
          <Input
            id="cost"
            type="number"
            value={cost}
            onChange={(event) => setCost(event.target.value)}
            placeholder="100"
          />
        </div>
        <div>
          <Label htmlFor="duration">Max duration (hrs)</Label>
          <Input
            id="duration"
            type="number"
            value={duration}
            onChange={(event) => setDuration(event.target.value)}
            placeholder="3"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {results.map((activity) => (
          <Card key={activity.id} className="border-border/70">
            <CardHeader className="space-y-2">
              <CardTitle className="text-base font-semibold">
                {activity.activityName}
              </CardTitle>
              <div className="text-xs text-muted-foreground">
                {activity.activityType} · {activity.duration}h · ${activity.cost}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {activity.imageUrl ? (
                <img
                  src={activity.imageUrl}
                  alt={activity.activityName}
                  className="h-28 w-full rounded-2xl border border-border object-cover"
                />
              ) : (
                <div className="h-28 w-full rounded-2xl border border-border bg-[linear-gradient(120deg,#f5e6d5,#f0cfae)]" />
              )}
              <p className="text-sm text-muted-foreground">{activity.description}</p>
              <div className="flex flex-wrap gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Quick view</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{activity.activityName}</DialogTitle>
                      <DialogDescription>
                        {activity.cityName}, {activity.country}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                      {activity.imageUrl ? (
                        <img
                          src={activity.imageUrl}
                          alt={activity.activityName}
                          className="h-48 w-full rounded-2xl object-cover"
                        />
                      ) : null}
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                      <div className="rounded-2xl border border-border bg-background px-4 py-3 text-sm">
                        {activity.activityType} · {activity.duration}h · ${activity.cost}
                      </div>
                      <Button onClick={() => handleAdd(activity)}>Add activity</Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button onClick={() => handleAdd(activity)}>Add activity</Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {!results.length ? (
          <Card className="border-dashed border-border">
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No activities match your filters.
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
