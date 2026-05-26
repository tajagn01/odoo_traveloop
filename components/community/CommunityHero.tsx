"use client";

import { motion } from "framer-motion";
import { Search, Compass, Map, Users, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CommunityHeroProps {
  searchQuery?: string;
}

export function CommunityHero({ searchQuery = "" }: CommunityHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-card border border-border/60 mb-12 shadow-sm">
      {/* Background Image & Clean Ambient Mask */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=2000&q=80"
          alt="Travel background"
          className="w-full h-full object-cover opacity-20 scale-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 px-6 md:px-12 py-16 md:py-20 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider mb-6"
        >
          <Compass className="h-3.5 w-3.5 text-primary animate-spin-slow" />
          <span>Discover Shared Journeys</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-6 max-w-4xl leading-tight"
        >
          Explore the world <br className="hidden md:block" />
          <span className="text-primary italic font-serif font-normal">together.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-base text-muted-foreground mb-8 max-w-xl font-medium leading-relaxed"
        >
          Find inspiration from thousands of community-crafted itineraries, save your favorites, and customize them for your next adventure.
        </motion.p>

        {/* Dynamic Search Bar Form */}
        <motion.form
          action="/community"
          method="GET"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-full max-w-2xl bg-card border border-border/80 rounded-2xl p-1.5 flex items-center gap-2 shadow-sm focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/15 transition-all duration-300"
        >
          <div className="flex-1 flex items-center gap-2.5 pl-3">
            <Search className="h-5 w-5 text-muted-foreground shrink-0" />
            <Input
              name="query"
              placeholder="Search destinations, creators, or themes..."
              defaultValue={searchQuery}
              className="border-none bg-transparent text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-0 h-11 text-base p-0"
            />
          </div>
          <Button type="submit" size="lg" className="rounded-xl px-7 h-11 bg-primary text-white font-semibold hover:bg-primary/90 shadow-sm transition-all cursor-pointer">
            Explore
          </Button>
        </motion.form>

        {/* Trending Tags */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-2 mt-6"
        >
          <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mr-1">Trending:</span>
          {["Japan", "Amalfi", "Iceland", "Bali"].map((tag) => (
            <a
              key={tag}
              href={`/community?query=${tag}`}
              className="px-3.5 py-1 rounded-full bg-muted hover:bg-primary/10 border border-border/60 hover:border-primary/30 text-muted-foreground hover:text-primary text-xs font-medium transition-all duration-200"
            >
              #{tag}
            </a>
          ))}
        </motion.div>

        {/* Travel Stats Metrics Row */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="grid grid-cols-3 gap-4 md:gap-8 w-full max-w-2xl mt-10 pt-8 border-t border-border/60"
        >
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 text-primary font-semibold mb-1 text-xs md:text-sm uppercase tracking-wider">
              <Map className="h-4 w-4 shrink-0" />
              <span>Itineraries</span>
            </div>
            <span className="text-2xl md:text-3xl font-extrabold text-foreground">1,250+</span>
          </div>
          <div className="flex flex-col items-center border-x border-border/60 px-2">
            <div className="flex items-center gap-2 text-primary font-semibold mb-1 text-xs md:text-sm uppercase tracking-wider">
              <Globe className="h-4 w-4 shrink-0" />
              <span>Countries</span>
            </div>
            <span className="text-2xl md:text-3xl font-extrabold text-foreground">84+</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 text-primary font-semibold mb-1 text-xs md:text-sm uppercase tracking-wider">
              <Users className="h-4 w-4 shrink-0" />
              <span>Explorers</span>
            </div>
            <span className="text-2xl md:text-3xl font-extrabold text-foreground">12,400+</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
