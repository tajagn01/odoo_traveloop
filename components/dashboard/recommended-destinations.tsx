import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";

type DestinationCard = {
  id: string;
  cityName: string;
  country: string;
  region: string;
  costIndex: number;
  popularity: number;
};

export function RecommendedDestinations({
  destinations,
}: {
  destinations: DestinationCard[];
}) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
      {destinations.map((city) => (
        <Card key={city.id} className="min-w-[280px] sm:min-w-[320px] flex-shrink-0 snap-center border-border/70 hover:shadow-md transition">
          <CardHeader className="space-y-2 pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              {city.cityName}, {city.country}
            </CardTitle>
            <div className="flex flex-wrap gap-2 pt-1">
              <Badge variant="secondary" className="text-xs">Cost Index: {city.costIndex}</Badge>
              <Badge variant="secondary" className="text-xs">Pop: {city.popularity}</Badge>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground pt-0">
            <span className="font-medium">Region:</span> {city.region}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
