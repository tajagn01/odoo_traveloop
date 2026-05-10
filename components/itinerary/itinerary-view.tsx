"use client";

import { eachDayOfInterval, format, parseISO } from "date-fns";

import { StopCard, type StopCardData } from "@/components/itinerary/stop-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ItineraryView({
  stops,
  startDate,
  endDate,
}: {
  stops: StopCardData[];
  startDate: string;
  endDate: string;
}) {
  const days = eachDayOfInterval({
    start: parseISO(startDate),
    end: parseISO(endDate),
  });

  return (
    <Tabs defaultValue="list">
      <TabsList>
        <TabsTrigger value="list">List view</TabsTrigger>
        <TabsTrigger value="calendar">Calendar view</TabsTrigger>
      </TabsList>
      <TabsContent value="list">
        <div className="space-y-6">
          {stops.length ? (
            stops.map((stop) => <StopCard key={stop.id} stop={stop} />)
          ) : (
            <Card className="border-dashed border-border">
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                No stops added yet.
              </CardContent>
            </Card>
          )}
        </div>
      </TabsContent>
      <TabsContent value="calendar">
        <div className="grid gap-4 md:grid-cols-2">
          {days.map((day) => {
            const activeStops = stops.filter((stop) => {
              const arrival = parseISO(stop.arrivalDate);
              const departure = parseISO(stop.departureDate);
              return day >= arrival && day <= departure;
            });

            return (
              <Card key={day.toISOString()} className="border-border/70">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">
                    {format(day, "EEE, MMM d")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {activeStops.length ? (
                    activeStops.map((stop) => (
                      <div key={stop.id} className="rounded-2xl border border-border bg-background p-3">
                        <p className="text-sm font-semibold">
                          {stop.cityName}, {stop.country}
                        </p>
                        {stop.activities.length ? (
                          <div className="mt-2 space-y-2">
                            {stop.activities.map((activity) => (
                              <div key={activity.id} className="text-xs text-muted-foreground">
                                {activity.activityName} · Time {activity.duration}h · Cost ${activity.cost}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-2 text-xs text-muted-foreground">No activities planned.</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No stops scheduled.</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </TabsContent>
    </Tabs>
  );
}
