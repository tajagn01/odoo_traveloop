"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AddStopForm({ tripId }: { tripId: string }) {
  const today = new Date().toLocaleDateString('en-CA');
  const router = useRouter();
  const [cityName, setCityName] = useState("");
  const [country, setCountry] = useState("");
  const [arrivalDate, setArrivalDate] = useState("");
  const [departureDate, setDepartureDate] = useState("");

  const submit = async () => {
    if (!cityName || !country || !arrivalDate || !departureDate) {
      toast.error("Fill in all stop details.");
      return;
    }

    const response = await fetch(`/api/trips/${tripId}/stops`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cityName, country, arrivalDate, departureDate }),
    });

    if (!response.ok) {
      toast.error("Unable to add stop.");
      return;
    }

    toast.success("Stop added.");
    setCityName("");
    setCountry("");
    setArrivalDate("");
    setDepartureDate("");
    router.refresh();
  };

  return (
    <Card className="border-border/70">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Add a stop</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="cityName">City</Label>
          <Input
            id="cityName"
            value={cityName}
            onChange={(event) => setCityName(event.target.value)}
            placeholder="City name"
          />
        </div>
        <div>
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            value={country}
            onChange={(event) => setCountry(event.target.value)}
            placeholder="Country"
          />
        </div>
        <div>
          <Label htmlFor="arrival">Arrival</Label>
          <Input
            id="arrival"
            type="date"
            min={today}
            value={arrivalDate}
            onChange={(event) => setArrivalDate(event.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="departure">Departure</Label>
          <Input
            id="departure"
            type="date"
            min={today}
            value={departureDate}
            onChange={(event) => setDepartureDate(event.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <Button onClick={submit}>Add stop</Button>
        </div>
      </CardContent>
    </Card>
  );
}
