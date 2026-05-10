"use client";

import { createTripAction } from "@/lib/actions/trips";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export function NewTripForm() {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionInput, setSuggestionInput] = useState("");

  const addSuggestion = () => {
    const trimmed = suggestionInput.trim();
    if (trimmed) {
      setSuggestions((prev) => [...prev, trimmed]);
      setSuggestionInput("");
    }
  };

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

      {/* Location + Height of Location */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="location">Location / Starting City</Label>
          <Input id="location" name="location" placeholder="e.g. Athens, Greece" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="heightOfLocation">Height of Location (m)</Label>
          <Input
            id="heightOfLocation"
            name="heightOfLocation"
            type="number"
            min="0"
            placeholder="e.g. 156"
          />
        </div>
      </div>

      {/* Cover Photo */}
      <div className="space-y-2">
        <Label htmlFor="coverPhoto">Cover Photo</Label>
        <Input id="coverPhoto" name="coverPhoto" type="file" accept="image/*" />
      </div>

      {/* Suggestions for Places / Activities */}
      <div className="space-y-3 rounded-2xl border border-border bg-muted/30 p-4">
        <div>
          <p className="text-sm font-semibold text-foreground">
            Suggestions for Places to Visit / Activities
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Add ideas to explore while building your itinerary.
          </p>
        </div>

        {/* Existing suggestions */}
        {suggestions.length > 0 && (
          <ul className="space-y-1.5">
            {suggestions.map((s, idx) => (
              <li
                key={idx}
                className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2 text-sm"
              >
                <span>{s}</span>
                <button
                  type="button"
                  onClick={() => setSuggestions((prev) => prev.filter((_, i) => i !== idx))}
                  className="text-muted-foreground hover:text-red-500 transition text-xs ml-2"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Add suggestion input */}
        <div className="flex gap-2">
          <Input
            value={suggestionInput}
            onChange={(e) => setSuggestionInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSuggestion();
              }
            }}
            placeholder="Type a place or activity name…"
            className="flex-1"
          />
          <Button type="button" variant="outline" onClick={addSuggestion}>
            Add
          </Button>
        </div>

        {/* Hidden input to submit suggestions as JSON */}
        <input
          type="hidden"
          name="suggestions"
          value={JSON.stringify(suggestions)}
        />
      </div>

      <Button type="submit" className="w-full sm:w-auto">
        Create Trip &amp; Build Itinerary
      </Button>
    </form>
  );
}
