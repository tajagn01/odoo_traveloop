import Link from "next/link";
import { ArrowRight, CalendarDays, Compass, Layers } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="min-h-screen">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-16">
        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
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
          <div className="relative overflow-hidden rounded-4xl border border-border bg-card p-6 shadow-lg">
            <div className="absolute -top-10 right-6 h-40 w-40 rounded-full bg-accent/40 blur-3xl" />
            <div className="absolute -bottom-16 left-6 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
            <div className="relative space-y-5">
              <div className="flex items-center justify-between text-sm font-semibold">
                <span>Upcoming Loop</span>
                <span className="text-muted-foreground">12 days</span>
              </div>
              <div className="grid gap-4">
                {[
                  { city: "Lisbon", dates: "Jun 2-5", tag: "Culture" },
                  { city: "Barcelona", dates: "Jun 5-9", tag: "Food" },
                  { city: "Nice", dates: "Jun 9-14", tag: "Coast" },
                ].map((stop) => (
                  <div
                    key={stop.city}
                    className="flex items-center justify-between rounded-2xl border border-border bg-background/80 px-4 py-3"
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
        </section>

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
