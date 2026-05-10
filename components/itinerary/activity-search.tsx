"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const types = ["All", "Sightseeing", "Food", "Culture", "Outdoor", "Relax"];

type ActivityResult = {
  activityName: string;
  description: string;
  activityType: string;
  duration: number;
  cost: number;
};

export function ActivitySearch({ stopId }: { stopId: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("All");
  const [cost, setCost] = useState("");
  const [duration, setDuration] = useState("");
  const [results, setResults] = useState<ActivityResult[]>([]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("query", query);
    if (type && type !== "All") params.set("type", type);
    if (cost) params.set("cost", cost);
    if (duration) params.set("duration", duration);

    fetch(`/api/activities?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setResults(data.results ?? []))
      .catch(() => setResults([]));
  }, [query, type, cost, duration]);

  const handleAdd = async (activity: ActivityResult) => {
    const response = await fetch(`/api/stops/${stopId}/activities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(activity),
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
          <Card key={activity.activityName} className="border-border/70">
            <CardHeader className="space-y-2">
              <CardTitle className="text-base font-semibold">
                {activity.activityName}
              </CardTitle>
              <div className="text-xs text-muted-foreground">
                {activity.activityType} · {activity.duration}h · ${activity.cost}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="h-24 w-full rounded-2xl border border-border bg-[linear-gradient(120deg,#f5e6d5,#f0cfae)]" />
              <p className="text-sm text-muted-foreground">{activity.description}</p>
              <Button onClick={() => handleAdd(activity)}>Add activity</Button>
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
