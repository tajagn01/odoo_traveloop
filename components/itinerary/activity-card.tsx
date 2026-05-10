import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";

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
  return (
    <Card className="border-border/70">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base font-semibold">
            {activity.activityName}
          </CardTitle>
          <Badge>{activity.activityType}</Badge>
        </div>
        <div className="text-xs text-muted-foreground">
          Time: {activity.duration}h · Cost: {formatCurrency(activity.cost)}
        </div>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        {activity.description ?? "No description added."}
      </CardContent>
    </Card>
  );
}
