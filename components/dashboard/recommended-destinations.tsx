import { mockCities } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function RecommendedDestinations() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {mockCities.slice(0, 3).map((city) => (
        <Card key={city.cityName} className="border-border/70">
          <CardHeader className="space-y-2">
            <CardTitle className="text-base font-semibold">
              {city.cityName}, {city.country}
            </CardTitle>
            <div className="flex gap-2">
              <Badge>Cost {city.costIndex}</Badge>
              <Badge>Popularity {city.popularity}</Badge>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Region: {city.region}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
