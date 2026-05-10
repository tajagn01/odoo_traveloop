"use client";

import { createTripAction } from "@/lib/actions/trips";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function NewTripForm() {
  return (
    <form action={createTripAction} className="space-y-6">
      {/* Trip Name */}
      <div className="space-y-2">
        <Label htmlFor="tripName">Trip Name</Label>
        <Input id="tripName" name="tripName" placeholder="Summer in the Aegean" required />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Add a quick overview of your trip."
          rows={3}
        />
      </div>

      {/* Dates row */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input id="startDate" name="startDate" type="date" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <Input id="endDate" name="endDate" type="date" required />
        </div>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label htmlFor="location">Location / Starting City</Label>
        <Input id="location" name="location" placeholder="e.g. Athens, Greece" />
      </div>

      {/* Cover Photo */}
      <div className="space-y-2">
        <Label htmlFor="coverPhoto">Cover Photo</Label>
        <Input id="coverPhoto" name="coverPhoto" type="file" accept="image/*" />
      </div>

      <Button type="submit" className="w-full sm:w-auto">
        Create Trip &amp; Build Itinerary
      </Button>
    </form>
  );
}
