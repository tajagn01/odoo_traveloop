import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateRange } from "@/lib/format";
import { ActivityCard, type ActivityCardData } from "@/components/itinerary/activity-card";

export type StopCardData = {
  id: string;
  cityName: string;
  country: string;
  arrivalDate: string;
  departureDate: string;
  stopOrder: number;
  activities: ActivityCardData[];
};

export function StopCard({ stop }: { stop: StopCardData }) {
  return (
    <Card className="border-border/70">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            {stop.cityName}, {stop.country}
          </CardTitle>
          <Badge>Stop {stop.stopOrder}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {formatDateRange(stop.arrivalDate, stop.departureDate)}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {stop.activities.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {stop.activities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No activities added yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
