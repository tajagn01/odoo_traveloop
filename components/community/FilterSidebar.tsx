"use client";

import { motion } from "framer-motion";
import { Search, Map, Calendar, DollarSign, Users, ChevronDown, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

export function FilterSidebar() {
  return (
    <div className="w-full bg-card rounded-2xl border border-border/60 p-5 sticky top-24 shadow-sm">
      <div className="flex items-center gap-2 mb-6 font-semibold text-lg pb-4 border-b border-border/60">
        <Filter className="h-5 w-5 text-primary" />
        Filters
      </div>

      <div className="space-y-6">
        {/* Destination Search */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <Map className="h-4 w-4 text-muted-foreground" /> Destination
          </Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9 h-9 text-sm" placeholder="Country or city..." />
          </div>
        </div>

        {/* Budget Slider */}
        <div className="space-y-4">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" /> Max Budget
          </Label>
          <div className="px-2">
            <Slider defaultValue={[2000]} max={10000} step={100} className="my-4" />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>$0</span>
            <span className="font-medium text-foreground">$2,000</span>
          </div>
        </div>

        {/* Duration */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" /> Duration
          </Label>
          <div className="space-y-2">
            {["Weekend Trip (1-3 days)", "Short Trip (4-7 days)", "Extended (1-2 weeks)", "Nomad (2+ weeks)"].map((duration) => (
              <div key={duration} className="flex items-center space-x-2">
                <Checkbox id={duration} />
                <label
                  htmlFor={duration}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  {duration}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Travel Type */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" /> Travel Group
          </Label>
          <div className="space-y-2">
            {["Solo Traveler", "Couples", "Family", "Friends Group"].map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox id={type} />
                <label
                  htmlFor={type}
                  className="text-sm font-medium leading-none text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  {type}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Button className="w-full mt-2">Apply Filters</Button>
      </div>
    </div>
  );
}
