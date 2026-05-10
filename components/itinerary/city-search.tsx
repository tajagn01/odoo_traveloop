"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getPlaceImage } from "@/lib/images";

const regions = [
  "All",
  "Europe",
  "Asia",
  "Africa",
  "North America",
  "South America",
  "Oceania",
  "Custom",
];

type CityResult = {
  id: string;
  cityName: string;
  country: string;
  region: string;
  costIndex: number;
  popularity: number;
};

type TripOption = {
  id: string;
  tripName: string;
};

export function CitySearch({
  trips,
  savedCityIds,
}: {
  trips: TripOption[];
  savedCityIds: string[];
}) {
  const router = useRouter();
  const [selectedTripId, setSelectedTripId] = useState(trips[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("All");
  const [country, setCountry] = useState("");
  const [arrivalDate, setArrivalDate] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [results, setResults] = useState<CityResult[]>([]);
  const [saved, setSaved] = useState<string[]>(savedCityIds);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("query", query);
    if (region && region !== "All") params.set("region", region);
    if (country) params.set("country", country);

    fetch(`/api/cities?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setResults(data.results ?? []))
      .catch(() => setResults([]));
  }, [query, region, country]);

  const canAdd = useMemo(
    () => Boolean(selectedTripId && arrivalDate && departureDate),
    [arrivalDate, departureDate, selectedTripId]
  );

  const handleAdd = async (city: CityResult) => {
    if (!canAdd) {
      toast.error("Choose a trip and set arrival and departure dates first.");
      return;
    }

    const response = await fetch(`/api/trips/${selectedTripId}/stops`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cityId: city.id,
        arrivalDate,
        departureDate,
      }),
    });

    if (!response.ok) {
      toast.error("Unable to add stop.");
      return;
    }

    toast.success(`${city.cityName} added to the itinerary.`);
    router.refresh();
  };

  const toggleSaved = async (cityId: string) => {
    const isSaved = saved.includes(cityId);
    const response = await fetch(`/api/saved-destinations/${cityId}`, {
      method: isSaved ? "DELETE" : "POST",
    });

    if (!response.ok) {
      toast.error("Unable to update saved destinations.");
      return;
    }

    setSaved((current) =>
      isSaved ? current.filter((id) => id !== cityId) : [...current, cityId]
    );
    toast.success(isSaved ? "Destination removed." : "Destination saved.");
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 rounded-3xl border border-border bg-card p-4 md:grid-cols-4">
        <div className="md:col-span-2">
          <Label htmlFor="citySearch">Search cities</Label>
          <Input
            id="citySearch"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by city or country"
          />
        </div>
        <div>
          <Label>Region</Label>
          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              {regions.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="country">Country filter</Label>
          <Input
            id="country"
            value={country}
            onChange={(event) => setCountry(event.target.value)}
            placeholder="Country"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {results.map((city) => {
          const isSaved = saved.includes(city.id);
          return (
            <Dialog key={city.id}>
              <Card className="border-border/70 overflow-hidden flex flex-col hover:shadow-md transition-shadow h-full">
                <div className="relative h-40 w-full bg-muted shrink-0">
                  <img
                    src={getPlaceImage(city.cityName)}
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
                  <CardTitle className="text-base font-semibold line-clamp-1 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                    {city.cityName}, {city.country}
                  </CardTitle>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground pt-1">
                    <Badge>Cost Index: {city.costIndex}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    Explore the beautiful region of {city.region} and discover why it's a famous destination.
                  </p>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 pt-0 mt-auto">
                  <div className="flex gap-2 w-full">
                    <DialogTrigger asChild>
                      <Button variant="secondary" size="sm" className="flex-1">
                        Preview
                      </Button>
                    </DialogTrigger>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => toggleSaved(city.id)}
                    >
                      {isSaved ? "Saved" : "Save"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden border-border/70 z-[60]">
                <div className="relative h-48 sm:h-64 w-full">
                  <img
                    src={getPlaceImage(city.cityName)}
                    alt={city.cityName}
                    className="w-full h-full object-cover object-center"
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
                    Explore the beautiful region of {city.region} and discover why it's a famous destination. A perfect addition to your upcoming itinerary!
                  </DialogDescription>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="col-span-2">
                      <Label className="text-xs">Select Trip</Label>
                      <Select value={selectedTripId} onValueChange={setSelectedTripId}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Choose a trip" />
                        </SelectTrigger>
                        <SelectContent>
                          {trips.map((trip) => (
                            <SelectItem key={trip.id} value={trip.id}>
                              {trip.tripName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs" htmlFor={`arr-${city.id}`}>Arrival</Label>
                      <Input
                        id={`arr-${city.id}`}
                        type="date"
                        className="h-8 text-xs"
                        value={arrivalDate}
                        onChange={(event) => setArrivalDate(event.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs" htmlFor={`dep-${city.id}`}>Departure</Label>
                      <Input
                        id={`dep-${city.id}`}
                        type="date"
                        className="h-8 text-xs"
                        value={departureDate}
                        onChange={(event) => setDepartureDate(event.target.value)}
                      />
                    </div>
                  </div>
                  <div className="pt-2 flex gap-3">
                    <Button onClick={() => {
                        handleAdd(city);
                        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
                    }} disabled={!canAdd} className="flex-1">
                      Add to Trip
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        toggleSaved(city.id);
                      }}
                    >
                      {isSaved ? "Saved" : "Save"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          );
        })}
        {!results.length ? (
          <Card className="border-dashed border-border">
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No cities match your filters.
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
