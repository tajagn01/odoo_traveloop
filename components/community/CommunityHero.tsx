"use client";

import { motion } from "framer-motion";
import { Search, MapPin, Compass } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function CommunityHero() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-black mb-12">
      {/* Background Image & Gradient */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=2000&q=80"
          alt="Travel background"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
      </div>

      {/* Content */}
      <div className="relative z-10 px-6 md:px-12 py-20 md:py-32 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium mb-6"
        >
          <Compass className="h-4 w-4" />
          <span>Discover Shared Journeys</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 max-w-4xl"
        >
          Explore the world <br className="hidden md:block" />
          <span className="text-white/80 font-serif italic">together.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg text-white/80 mb-10 max-w-xl"
        >
          Find inspiration from thousands of community-crafted itineraries, copy your favorites, and customize them for your next adventure.
        </motion.p>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full max-w-2xl bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-2 flex items-center gap-2 shadow-2xl"
        >
          <div className="flex-1 flex items-center gap-2 pl-3 text-white">
            <Search className="h-5 w-5 text-white/60" />
            <Input
              placeholder="Search destinations, creators, or themes..."
              className="border-none bg-transparent text-white placeholder:text-white/60 focus-visible:ring-0 h-12 text-base"
            />
          </div>
          <Button size="lg" className="rounded-xl px-8 h-12">
            Explore
          </Button>
        </motion.div>

        {/* Trending Tags */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-2 mt-8"
        >
          <span className="text-white/60 text-sm mr-2">Trending:</span>
          {["Japan Autumn", "Amalfi Coast", "Solo Travel", "Digital Nomad"].map((tag) => (
            <button
              key={tag}
              className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 text-white text-xs transition-colors"
            >
              {tag}
            </button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
