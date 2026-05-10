import Link from "next/link";
import { ArrowRight, CalendarDays, Compass, Layers, Star, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const popularAttractions = [
  {
    name: "Colosseum",
    location: "Rome, Italy",
    tag: "History",
    rating: 4.9,
    color: "from-amber-500/20 to-orange-500/10",
    emoji: "🏛️",
  },
  {
    name: "Santorini Caldera",
    location: "Santorini, Greece",
    tag: "Coast",
    rating: 4.8,
    color: "from-blue-500/20 to-cyan-500/10",
    emoji: "🌊",
  },
  {
    name: "Eiffel Tower",
    location: "Paris, France",
    tag: "Iconic",
    rating: 4.7,
    color: "from-violet-500/20 to-purple-500/10",
    emoji: "🗼",
  },
  {
    name: "Amalfi Coast",
    location: "Naples, Italy",
    tag: "Scenic",
    rating: 4.9,
    color: "from-emerald-500/20 to-teal-500/10",
    emoji: "🌅",
  },
  {
    name: "Sagrada Família",
    location: "Barcelona, Spain",
    tag: "Architecture",
    rating: 4.8,
    color: "from-rose-500/20 to-pink-500/10",
    emoji: "⛪",
  },
  {
    name: "Acropolis",
    location: "Athens, Greece",
    tag: "Culture",
    rating: 4.7,
    color: "from-yellow-500/20 to-amber-500/10",
    emoji: "🏺",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-16">

        {/* ── Hero / Banner Section ── */}
        <section className="relative overflow-hidden rounded-4xl border border-border bg-card shadow-xl">
          {/* Gradient blobs */}
          <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />

          <div className="relative grid gap-10 p-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:p-12">
            <div className="space-y-6">
              <Badge className="bg-accent/40 text-foreground">New season planning</Badge>
              <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
                Shape multi-city journeys with a calm, detailed travel cockpit.
              </h1>
              <p className="max-w-xl text-lg text-muted-foreground">
                Traveloop keeps your itinerary, budget, activities, packing, and notes in
                one view. Build faster, share confidently, and keep every stop aligned.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/signup">
                    Get started <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/login">Sign in</Link>
                </Button>
              </div>
            </div>

            {/* Mini itinerary preview card */}
            <div className="relative overflow-hidden rounded-3xl border border-border bg-background/80 p-6 shadow-lg backdrop-blur-sm">
              <div className="space-y-5">
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span>Upcoming Loop</span>
                  <span className="text-muted-foreground">12 days</span>
                </div>
                <div className="grid gap-3">
                  {[
                    { city: "Lisbon", dates: "Jun 2–5", tag: "Culture" },
                    { city: "Barcelona", dates: "Jun 5–9", tag: "Food" },
                    { city: "Nice", dates: "Jun 9–14", tag: "Coast" },
                  ].map((stop) => (
                    <div
                      key={stop.city}
                      className="flex items-center justify-between rounded-2xl border border-border bg-card/80 px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-semibold">{stop.city}</p>
                        <p className="text-xs text-muted-foreground">{stop.dates}</p>
                      </div>
                      <Badge className="bg-secondary/70 text-foreground">{stop.tag}</Badge>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-muted px-4 py-3 text-sm font-semibold">
                  <span>Budget watch</span>
                  <span className="text-foreground">$3,070 / $3,200</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Top Popular Attractions ── */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Top Popular Attractions</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Handpicked destinations travelers love. Add any to your next trip.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {popularAttractions.map((place) => (
              <Card
                key={place.name}
                className={`border-border/70 bg-gradient-to-br ${place.color} transition hover:shadow-md`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <span className="text-3xl">{place.emoji}</span>
                    <Badge className="bg-background/70 text-foreground text-xs">{place.tag}</Badge>
                  </div>
                  <CardTitle className="text-base">{place.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1 text-xs">
                    <MapPin className="h-3 w-3" />
                    {place.location}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-foreground">{place.rating}</span>
                    <span>/ 5.0 rating</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ── Feature Cards ── */}
        <section className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Itinerary layers",
              description:
                "Stops, activities, and notes stay connected so each day has a clear flow.",
              icon: Layers,
            },
            {
              title: "Budget signals",
              description:
                "Track travel, stay, meals, and activity costs with instant overages.",
              icon: CalendarDays,
            },
            {
              title: "City discovery",
              description:
                "Find destinations by region, cost, and popularity before you add them.",
              icon: Compass,
            },
          ].map((item) => (
            <Card key={item.title} className="border-border/70">
              <CardHeader className="space-y-3">
                <item.icon className="h-6 w-6 text-primary" />
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent />
            </Card>
          ))}
        </section>

        {/* ── CTA ── */}
        <section className="rounded-4xl border border-border bg-card px-6 py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-3xl font-semibold">Start planning in minutes</h2>
              <p className="mt-2 max-w-xl text-muted-foreground">
                Create a trip, add cities, and share a public itinerary when you are ready.
              </p>
            </div>
            <Button asChild size="lg">
              <Link href="/signup">Create your account</Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
