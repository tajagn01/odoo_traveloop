"use client";

import { motion } from "framer-motion";
import { MapPin, Plane, Users, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CreatorCardProps {
  creator: {
    id: string;
    name: string;
    image: string;
    isVerified: boolean;
    bio: string;
    stats: {
      trips: number;
      followers: string;
      countries: number;
    };
    recentDestinations: string[];
  };
}

export function CreatorCard({ creator }: CreatorCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="bg-card rounded-2xl border border-border/60 overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/20 transition-all p-5 flex flex-col"
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-primary/20 relative shrink-0">
          <img src={creator.image} alt={creator.name} className="h-full w-full object-cover" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold flex items-center gap-1.5 leading-tight">
            {creator.name}
            {creator.isVerified && <CheckCircle2 className="h-4 w-4 text-blue-500" />}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{creator.bio}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-5 py-3 border-y border-border/60 text-center">
        <div>
          <p className="text-lg font-bold text-foreground">{creator.stats.trips}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Trips</p>
        </div>
        <div className="border-x border-border/60">
          <p className="text-lg font-bold text-foreground">{creator.stats.followers}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Followers</p>
        </div>
        <div>
          <p className="text-lg font-bold text-foreground">{creator.stats.countries}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Countries</p>
        </div>
      </div>

      <div className="mb-5">
        <p className="text-xs text-muted-foreground font-semibold mb-2 flex items-center gap-1">
          <Plane className="h-3.5 w-3.5" /> Recent Travel
        </p>
        <div className="flex flex-wrap gap-1.5">
          {creator.recentDestinations.map(dest => (
            <span key={dest} className="px-2 py-1 rounded-md bg-muted text-[10px] font-medium text-foreground">
              {dest}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-auto">
        <Button className="w-full font-semibold rounded-xl" variant="default">
          Follow
        </Button>
      </div>
    </motion.div>
  );
}
