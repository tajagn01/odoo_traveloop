"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarDays, MapPin, Search, Filter, ArrowDownUp, Trash2, ChevronRight } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { deleteTripAction, deleteStopAction } from "@/lib/actions/trips";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Trip = {
  id: string;
  tripName: string;
  description: string | null;
  startDate: Date;
  endDate: Date;
  stops: Stop[];
};

type Stop = {
  id: string;
  cityName: string;
  country: string;
  arrivalDate: Date;
  departureDate: Date;
  stopOrder: number;
  activities: Activity[];
};

type Activity = {
  id: string;
  activityName: string;
  description: string | null;
  activityType: string;
  duration: number;
  cost: number;
  scheduledDay: number | null;
  scheduledTime: string | null;
};

export function ItineraryClient({ trips }: { trips: Trip[] }) {
  const router = useRouter();
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [deletingTrip, setDeletingTrip] = useState<string | null>(null);
  const [deletingStop, setDeletingStop] = useState<string | null>(null);

  const handleDeleteTrip = async (tripId: string) => {
    if (!confirm("Are you sure you want to delete this trip? This action cannot be undone.")) {
      return;
    }

    setDeletingTrip(tripId);
    try {
      await deleteTripAction(tripId);
      toast.success("Trip deleted successfully");
      if (selectedTripId === tripId) {
        setSelectedTripId(null);
      }
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete trip");
    } finally {
      setDeletingTrip(null);
    }
  };

  const handleDeleteStop = async (stopId: string) => {
    if (!confirm("Are you sure you want to delete this stop?")) {
      return;
    }

    setDeletingStop(stopId);
    try {
      await deleteStopAction(stopId);
      toast.success("Stop deleted successfully");
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete stop");
    } finally {
      setDeletingStop(null);
    }
  };

  const selectedTrip = trips.find(t => t.id === selectedTripId);

  return (
    <>
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search trips..." 
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
        <Button variant="outline" className="gap-2">
          <ArrowDownUp className="h-4 w-4" />
          Sort by...
        </Button>
      </div>

      {trips.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No trips yet. Create your first trip to get started!</p>
          <Button asChild>
            <Link href="/trips/new">Create Trip</Link>
          </Button>
        </div>
      ) : !selectedTripId ? (
        /* Trip Selection Grid */
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Select a trip to view its detailed itinerary ({trips.length} {trips.length === 1 ? 'trip' : 'trips'})
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trips.map((trip) => {
              const startDate = trip.startDate.toISOString().split('T')[0];
              const endDate = trip.endDate.toISOString().split('T')[0];
              const totalActivities = trip.stops.reduce((sum, stop) => sum + stop.activities.length, 0);

              return (
                <Card 
                  key={trip.id} 
                  className="border-border/70 hover:shadow-lg transition-all cursor-pointer hover:border-primary/50"
                  onClick={() => setSelectedTripId(trip.id)}
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-lg line-clamp-2">{trip.tripName}</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTrip(trip.id);
                        }}
                        disabled={deletingTrip === trip.id}
                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10 shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {trip.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {trip.description}
                      </p>
                    )}

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CalendarDays className="h-4 w-4" />
                        <span>{startDate} to {endDate}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="line-clamp-1">
                          {trip.stops.map(s => s.cityName).join(" → ") || "No stops yet"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <Badge variant="secondary">{trip.stops.length} stops</Badge>
                      <Badge variant="outline">{totalActivities} activities</Badge>
                    </div>

                    <Button className="w-full gap-2" size="sm">
                      View Itinerary
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ) : selectedTrip ? (
        /* Detailed Itinerary View */
        <div className="space-y-6">
          {/* Back Button and Trip Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSelectedTripId(null)}
            >
              ← Back to Trips
            </Button>
          </div>

          <div className="space-y-6">
            {/* Trip Header */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">{selectedTrip.tripName}</h2>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    <span>{selectedTrip.startDate.toISOString().split('T')[0]} - {selectedTrip.endDate.toISOString().split('T')[0]}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{selectedTrip.stops.map(s => s.cityName).join(" → ")}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/trips/${selectedTrip.id}`}>View Full Trip</Link>
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDeleteTrip(selectedTrip.id)}
                  disabled={deletingTrip === selectedTrip.id}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Day-by-Day Itinerary */}
            <div className="space-y-8">
              {selectedTrip.stops.map((stop) => {
                // Group activities by day
                const activitiesByDay: { [key: number]: typeof stop.activities } = {};
                stop.activities.forEach(activity => {
                  const day = activity.scheduledDay || 1;
                  if (!activitiesByDay[day]) {
                    activitiesByDay[day] = [];
                  }
                  activitiesByDay[day].push(activity);
                });

                const stopDays = Object.keys(activitiesByDay).length || 1;

                return (
                  <div key={stop.id} className="space-y-6">
                    {/* Stop Header */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="text-base px-4 py-1">
                          {stop.cityName}, {stop.country}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {stopDays} {stopDays === 1 ? 'day' : 'days'}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteStop(stop.id)}
                        disabled={deletingStop === stop.id}
                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Days */}
                    {Object.entries(activitiesByDay).map(([dayNum, activities]) => (
                      <div key={dayNum} className="flex gap-6">
                        {/* Day Label */}
                        <div className="w-24 shrink-0">
                          <div className="sticky top-6">
                            <div className="inline-flex items-center justify-center rounded-xl border-2 border-border bg-background px-4 py-2 font-semibold">
                              Day {dayNum}
                            </div>
                          </div>
                        </div>

                        {/* Activities Column */}
                        <div className="flex-1 space-y-4">
                          <div className="grid grid-cols-1 lg:grid-cols-[1fr_200px] gap-4">
                            {/* Physical Activities */}
                            <div className="space-y-3">
                              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                Physical Activity
                              </h4>
                              {activities.length > 0 ? (
                                activities.map((activity, idx) => (
                                  <div key={activity.id} className="relative">
                                    <Card className="border-border/70 hover:shadow-md transition-shadow">
                                      <CardContent className="p-4">
                                        <div className="flex items-start justify-between gap-3">
                                          <div className="flex-1">
                                            <h5 className="font-semibold mb-1">{activity.activityName}</h5>
                                            {activity.description && (
                                              <p className="text-sm text-muted-foreground line-clamp-2">
                                                {activity.description}
                                              </p>
                                            )}
                                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                              {activity.scheduledTime && (
                                                <span>{activity.scheduledTime}</span>
                                              )}
                                              {activity.duration && (
                                                <span>{activity.duration} min</span>
                                              )}
                                              {activity.activityType && (
                                                <Badge variant="outline" className="text-xs">
                                                  {activity.activityType}
                                                </Badge>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                    {/* Arrow connector */}
                                    {idx < activities.length - 1 && (
                                      <div className="flex justify-center py-2">
                                        <div className="w-0.5 h-6 bg-border"></div>
                                        <div className="absolute left-1/2 -translate-x-1/2 mt-4">
                                          <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-border"></div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))
                              ) : (
                                <Card className="border-dashed border-border/70">
                                  <CardContent className="p-4 text-center text-sm text-muted-foreground">
                                    No activities scheduled
                                  </CardContent>
                                </Card>
                              )}
                            </div>

                            {/* Expenses Column */}
                            <div className="space-y-3">
                              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                Expense
                              </h4>
                              {activities.map((activity) => (
                                <Card key={activity.id} className="border-border/70 bg-muted/30">
                                  <CardContent className="p-4">
                                    <div className="text-center">
                                      <div className="text-lg font-bold">
                                        {formatCurrency(activity.cost)}
                                      </div>
                                      <div className="text-xs text-muted-foreground mt-1">
                                        Activity fee
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
