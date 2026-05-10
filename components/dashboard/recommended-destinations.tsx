"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { getPlaceImage } from "@/lib/images";

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
    <div className="flex gap-4 overflow-x-auto pb-4 snap-x scroll-smooth">
      {destinations.map((city) => {
        const imageUrl = getPlaceImage(city.cityName);
        const description = `Explore the beautiful region of ${city.region} and enjoy its unique culture, famous landmarks, and places.`;
        
        return (
          <Dialog key={city.id}>
            <Card className="w-[280px] sm:w-[320px] flex-shrink-0 snap-center border-border/70 hover:shadow-md transition overflow-hidden flex flex-col h-full">
              <div className="relative h-40 w-full bg-muted shrink-0">
                <img
                  src={imageUrl}
                  alt={city.cityName}
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute top-3 right-3">
                  <Badge className="bg-background/80 text-foreground backdrop-blur-sm border-none shadow-sm">
                    Pop: {city.popularity}
                  </Badge>
                </div>
              </div>
              <CardHeader className="space-y-1.5 pb-3 flex-1">
                <CardTitle className="text-base font-semibold flex items-center gap-2 line-clamp-1">
                  <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                  {city.cityName}, {city.country}
                </CardTitle>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Badge className="text-xs">Cost Index: {city.costIndex}</Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                  {description}
                </p>
              </CardHeader>
              <CardContent className="flex gap-2 pt-0 mt-auto">
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full">
                    Preview Destination
                  </Button>
                </DialogTrigger>
              </CardContent>
            </Card>

            <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden border-border/70">
              <div className="relative h-48 sm:h-64 w-full">
                <img
                  src={imageUrl}
                  alt={city.cityName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="h-5 w-5 text-primary" />
                    <DialogTitle className="text-2xl font-bold">{city.cityName}</DialogTitle>
                  </div>
                  <p className="text-white/80">{city.country}</p>
                </div>
              </div>
              <div className="p-6 pt-2 space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge>Region: {city.region}</Badge>
                  <Badge>Cost Index: {city.costIndex}</Badge>
                  <Badge>Popularity: {city.popularity}</Badge>
                </div>
                <DialogDescription className="text-sm">
                  {description}
                </DialogDescription>
                <div className="pt-2 flex gap-3">
                  <Button className="w-full">Plan Trip Here</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        );
      })}
    </div>
  );
}
