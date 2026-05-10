"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
          <Label>Trip</Label>
          <Select value={selectedTripId} onValueChange={setSelectedTripId}>
            <SelectTrigger>
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
        <div>
          <Label htmlFor="arrivalDate">Arrival date</Label>
          <Input
            id="arrivalDate"
            type="date"
            value={arrivalDate}
            onChange={(event) => setArrivalDate(event.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="departureDate">Departure date</Label>
          <Input
            id="departureDate"
            type="date"
            value={departureDate}
            onChange={(event) => setDepartureDate(event.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {results.map((city) => {
          const isSaved = saved.includes(city.id);
          return (
            <Card key={city.id} className="border-border/70">
              <CardHeader className="space-y-2">
                <CardTitle className="text-base font-semibold">
                  {city.cityName}, {city.country}
                </CardTitle>
                <div className="text-xs text-muted-foreground">
                  Region {city.region} · Cost {city.costIndex} · Popularity {city.popularity}
                </div>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button onClick={() => handleAdd(city)} disabled={!canAdd}>
                  Add to trip
                </Button>
                <Button
                  variant="outline"
                  onClick={() => toggleSaved(city.id)}
                >
                  {isSaved ? "Saved" : "Save destination"}
                </Button>
              </CardContent>
            </Card>
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
