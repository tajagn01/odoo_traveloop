import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { MapPin } from "lucide-react";
import { getPlaceImage } from "@/lib/images";

export type ActivityCardData = {
  id: string;
  activityName: string;
  description: string | null;
  activityType: string;
  duration: number;
  cost: number;
  imageUrl: string | null;
};

export function ActivityCard({ activity }: { activity: ActivityCardData }) {
  const fallbackImage = getPlaceImage(activity.activityName, 'activity');

  return (
    <Card className="border-border/70 overflow-hidden flex flex-col hover:shadow-md transition-shadow h-full">
      <div className="relative h-40 w-full bg-muted shrink-0">
        <img
          src={activity.imageUrl || fallbackImage}
          alt={activity.activityName}
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute top-3 right-3">
          <Badge className="bg-background/80 text-foreground backdrop-blur-sm border-none shadow-sm">
            {activity.activityType}
          </Badge>
        </div>
      </div>
      <CardHeader className="space-y-1.5 pb-3 flex-1">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base font-semibold line-clamp-1">
            {activity.activityName}
          </CardTitle>
        </div>
        <div className="text-xs text-muted-foreground flex gap-2">
          <span>Time: {activity.duration}h</span>
          <span>·</span>
          <span>Cost: {formatCurrency(activity.cost)}</span>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
          {activity.description || `Enjoy a wonderful experience doing ${activity.activityName}.`}
        </p>
      </CardHeader>
    </Card>
  );
}
