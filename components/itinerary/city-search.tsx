"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const regions = ["All", "Europe", "Asia", "Africa", "North America", "South America", "Oceania"];

type CityResult = {
  cityName: string;
  country: string;
  region: string;
  costIndex: number;
  popularity: number;
};

export function CitySearch({ tripId }: { tripId: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("All");
  const [country, setCountry] = useState("");
  const [arrivalDate, setArrivalDate] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [results, setResults] = useState<CityResult[]>([]);

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

  const canAdd = useMemo(() => arrivalDate && departureDate, [arrivalDate, departureDate]);

  const handleAdd = async (city: CityResult) => {
    if (!canAdd) {
      toast.error("Add arrival and departure dates first.");
      return;
    }

    const response = await fetch(`/api/trips/${tripId}/stops`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cityName: city.cityName,
        country: city.country,
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
        {results.map((city) => (
          <Card key={`${city.cityName}-${city.country}`} className="border-border/70">
            <CardHeader className="space-y-2">
              <CardTitle className="text-base font-semibold">
                {city.cityName}, {city.country}
              </CardTitle>
              <div className="text-xs text-muted-foreground">
                Region {city.region} · Cost {city.costIndex} · Popularity {city.popularity}
              </div>
            </CardHeader>
            <CardContent>
              <Button onClick={() => handleAdd(city)} disabled={!canAdd}>
                Add to trip
              </Button>
            </CardContent>
          </Card>
        ))}
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
