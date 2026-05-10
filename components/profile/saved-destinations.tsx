"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

type SavedDestination = {
  cityId: string;
  cityName: string;
  country: string;
  region: string;
};

export function SavedDestinations({
  destinations,
}: {
  destinations: SavedDestination[];
}) {
  const router = useRouter();

  const removeDestination = async (cityId: string) => {
    const response = await fetch(`/api/saved-destinations/${cityId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      toast.error("Unable to remove destination.");
      return;
    }

    toast.success("Destination removed.");
    router.refresh();
  };

  if (!destinations.length) {
    return <p className="text-sm text-muted-foreground">No destinations saved yet.</p>;
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {destinations.map((destination) => (
        <div
          key={destination.cityId}
          className="flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-3"
        >
          <div>
            <p className="text-sm font-semibold text-foreground">
              {destination.cityName}, {destination.country}
            </p>
            <p className="text-xs text-muted-foreground">{destination.region}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeDestination(destination.cityId)}
          >
            Remove
          </Button>
        </div>
      ))}
    </div>
  );
}
