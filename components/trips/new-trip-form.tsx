"use client";

import { createTripAction } from "@/lib/actions/trips";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";

const PREDEFINED_SUGGESTIONS = [
  { id: "Paris, France", title: "Paris", desc: "Eiffel Tower & Louvre", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80" },
  { id: "Tokyo, Japan", title: "Tokyo", desc: "Shinjuku & Mt. Fuji", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80" },
  { id: "Rome, Italy", title: "Rome", desc: "Colosseum & Vatican", image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80" },
  { id: "New York, USA", title: "New York", desc: "Central Park & Broadway", image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80" },
  { id: "Bali, Indonesia", title: "Bali", desc: "Beaches & Temples", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80" },
  { id: "London, UK", title: "London", desc: "Big Ben & London Eye", image: "https://images.unsplash.com/photo-1513635269975-5969336cb1f3?auto=format&fit=crop&w=1200&q=80" },
];

export function NewTripForm() {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionInput, setSuggestionInput] = useState("");

  const addSuggestion = () => {
    const trimmed = suggestionInput.trim();
    if (trimmed) {
      if (!suggestions.includes(trimmed)) {
        setSuggestions((prev) => [...prev, trimmed]);
      }
      setSuggestionInput("");
    }
  };

  const toggleSuggestion = (id: string) => {
    if (suggestions.includes(id)) {
      setSuggestions((prev) => prev.filter((item) => item !== id));
    } else {
      setSuggestions((prev) => [...prev, id]);
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

      {/* Suggestions for Places / Activities */}
      <div className="space-y-4 pt-2">
        <div>
          <Label className="text-base font-semibold">
            Suggestion for Places to Visit / Activities
          </Label>
          <p className="text-xs text-muted-foreground mt-1">
            Select popular destinations below or add your own ideas to explore while building your itinerary.
          </p>
        </div>

        {/* 3x2 Grid of Image Cards matching Screen 4 wireframe */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {PREDEFINED_SUGGESTIONS.map((s) => {
            const isSelected = suggestions.includes(s.id);
            return (
              <Dialog key={s.id}>
                <Card
                  onClick={() => toggleSuggestion(s.id)}
                  className={`relative h-32 md:h-40 overflow-hidden cursor-pointer group transition-all duration-300 border-2 ${
                    isSelected ? "border-primary ring-2 ring-primary/30" : "border-transparent hover:border-primary/50"
                  }`}
                >
                  <img
                    src={s.image}
                    alt={s.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  
                  <div className="absolute inset-0 p-3 flex flex-col justify-between z-10 pointer-events-none">
                    <div className="flex justify-end">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors pointer-events-auto ${
                        isSelected ? "bg-primary text-primary-foreground" : "bg-black/40 text-white/70 backdrop-blur-sm group-hover:bg-black/60"
                      }`}>
                        {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-white font-medium text-sm md:text-base leading-tight">
                        {s.title}
                      </h4>
                      <p className="text-white/70 text-[10px] md:text-xs mt-0.5 line-clamp-1 mb-1.5">
                        {s.desc}
                      </p>
                      <div className="pointer-events-auto">
                        <DialogTrigger asChild>
                          <Button variant="secondary" size="sm" className="h-6 text-[10px] px-2 bg-white/20 hover:bg-white/40 text-white border-none backdrop-blur-md" onClick={(e) => {
                            e.stopPropagation();
                          }}>
                            Preview
                          </Button>
                        </DialogTrigger>
                      </div>
                    </div>
                  </div>
                </Card>

                <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden border-border/70 z-[60]">
                  <div className="relative h-48 sm:h-64 w-full">
                    <img
                      src={s.image}
                      alt={s.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <DialogTitle className="text-2xl font-bold">{s.title}</DialogTitle>
                    </div>
                  </div>
                  <div className="p-6 pt-2 space-y-4">
                    <DialogDescription className="text-sm">
                      {s.desc}. A fantastic destination to consider for your next itinerary!
                    </DialogDescription>
                    <div className="pt-2">
                      <Button className="w-full" onClick={() => {
                        if (!isSelected) toggleSuggestion(s.id);
                        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
                      }}>
                        {isSelected ? "Already Added" : "Add Idea to Trip"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            );
          })}
        </div>

        {/* Existing / Custom suggestions */}
        <div className="space-y-3 rounded-xl border border-border bg-muted/20 p-4 mt-2">
          {suggestions.filter(s => !PREDEFINED_SUGGESTIONS.find(ps => ps.id === s)).length > 0 && (
            <ul className="space-y-1.5 mb-3">
              {suggestions.filter(s => !PREDEFINED_SUGGESTIONS.find(ps => ps.id === s)).map((s, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm"
                >
                  <span>{s}</span>
                  <button
                    type="button"
                    onClick={() => setSuggestions((prev) => prev.filter((item) => item !== s))}
                    className="text-muted-foreground hover:text-red-500 transition text-xs ml-2 font-medium"
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
              placeholder="Type a custom place or activity name…"
              className="flex-1 bg-background"
            />
            <Button type="button" variant="secondary" onClick={addSuggestion}>
              Add Idea
            </Button>
          </div>
        </div>

        {/* Hidden input to submit suggestions as JSON */}
        <input
          type="hidden"
          name="suggestions"
          value={JSON.stringify(suggestions)}
        />
      </div>

      <div className="pt-2">
        <Button type="submit" className="w-full sm:w-auto" size="lg">
          Create Trip &amp; Build Itinerary
        </Button>
      </div>
    </form>
  );
}
