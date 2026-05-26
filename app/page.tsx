import Link from "next/link";
import { ArrowRight, Check, Compass, Gauge, LayoutGrid, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LandingNavbar } from "@/components/layout/landing-navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Footer } from "@/components/layout/footer";

const featureTiles = [
  {
    title: "Live itinerary",
    description: "Shift days, drag activities, and keep every stop aligned.",
    icon: LayoutGrid,
  },
  {
    title: "Budget control",
    description: "Track spend by category with automatic alerts.",
    icon: Gauge,
  },
  {
    title: "Smart discovery",
    description: "Pick cities by region, season, and popularity signals.",
    icon: Compass,
  },
  {
    title: "Secure sharing",
    description: "Send a polished itinerary with privacy-first controls.",
    icon: ShieldCheck,
  },
];

const quickSteps = [
  "Create a new trip in seconds",
  "Drop in cities, stays, and key plans",
  "Invite your crew with a shareable link",
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <main className="mx-auto flex w-full max-w-[1400px] flex-col gap-16 px-0 pb-16 pt-0">
        <section className="relative overflow-hidden rounded-4xl border border-[#E2D6C4] bg-[#F4EFE6] text-[#1F1B16] shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#FBE8D0,transparent_60%)]" />
          <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-[#E1C7A3]/40 blur-3xl" />
          <div className="absolute -bottom-32 right-10 h-72 w-72 rounded-full bg-[#C07A4B]/30 blur-3xl" />
          <div className="pointer-events-none absolute inset-0">
            <svg
              className="absolute right-0 top-0 h-full w-full opacity-60"
              viewBox="0 0 900 520"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M90 360C190 260 290 220 390 250C470 275 560 210 650 180C730 150 790 170 860 120"
                stroke="#C07A4B"
                strokeOpacity="0.45"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="10 12"
              />
              <path
                d="M120 420C220 330 310 300 420 330C500 350 600 300 700 260"
                stroke="#1F1B16"
                strokeOpacity="0.18"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="90" cy="360" r="8" fill="#C07A4B" fillOpacity="0.45" />
              <circle cx="390" cy="250" r="7" fill="#C07A4B" fillOpacity="0.55" />
              <circle cx="650" cy="180" r="9" fill="#1F1B16" fillOpacity="0.35" />
              <rect x="610" y="60" width="190" height="190" rx="36" fill="#F1E3CF" fillOpacity="0.9" />
            </svg>
          </div>

          <div className="relative border-b border-[#E2D6C4] px-6 py-5 sm:flex sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#1F1B16] text-xs font-bold uppercase tracking-[0.3em] text-[#F4EFE6]">
                TL
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-[#6A5E4C]">Travel planning</p>
                <h1 className="text-2xl font-semibold tracking-tight font-display">Traveloop</h1>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm sm:mt-0">
              <Link href="/trips" className="text-[#6A5E4C] transition hover:text-[#1F1B16]">
                Trips
              </Link>
              <Link href="/cities" className="text-[#6A5E4C] transition hover:text-[#1F1B16]">
                Cities
              </Link>
              <Link href="/community" className="text-[#6A5E4C] transition hover:text-[#1F1B16]">
                Community
              </Link>
              <Button asChild size="sm" className="rounded-full bg-black px-5 text-white hover:bg-black/90">
                <Link href="/signup" className="text-white">
                  Start planning
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative grid gap-10 p-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:p-12">
            <div className="space-y-6">
              <Badge className="bg-[#1F1B16]/10 text-[#1F1B16]">Route-first planning</Badge>
              <h2 className="text-4xl font-semibold leading-tight sm:text-5xl">
                Design a trip flow that feels like a studio session, not a spreadsheet.
              </h2>
              <p className="max-w-xl text-lg text-[#5C5246]">
                Map cities, manage budgets, and share a single view your crew understands. Traveloop keeps every detail staged, timed, and ready.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg" className="rounded-full bg-white text-[#1F1B16] hover:bg-white/90">
                  <Link href="/signup">
                    Start the plan <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full border-[#1F1B16]/30 text-[#1F1B16] hover:bg-[#1F1B16]/5">
                  <Link href="/login">See the workspace</Link>
                </Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { label: "Timeline", value: "Drag-ready" },
                  { label: "Budget", value: "Live margins" },
                  { label: "Crew", value: "One link" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-[#1F1B16]/15 bg-[#FBF7F0] px-4 py-3"
                  >
                    <p className="text-xs uppercase tracking-wide text-[#6A5E4C]">{item.label}</p>
                    <p className="text-sm font-semibold text-[#1F1B16]">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-[#C07A4B]/20 via-transparent to-[#1F1B16]/10 blur-2xl" />
              <div className="relative overflow-hidden rounded-3xl border border-[#1F1B16]/15 bg-[#FBF7F0] p-6 shadow-lg backdrop-blur-sm">
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span>Studio board</span>
                  <span className="text-[#6A5E4C]">12 days</span>
                </div>
                <div className="mt-4 rounded-2xl border border-[#1F1B16]/15 bg-[#F6ECDD] p-4">
                  <div className="flex items-center justify-between text-xs text-[#6A5E4C]">
                    <span>Route arc</span>
                    <span>Atlantic slow burn</span>
                  </div>
                  <svg
                    className="mt-4 h-28 w-full"
                    viewBox="0 0 320 120"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20 80C70 20 140 20 180 45C220 70 260 75 300 30"
                      stroke="#C07A4B"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeDasharray="6 10"
                    />
                    <circle cx="20" cy="80" r="6" fill="#C07A4B" fillOpacity="0.6" />
                    <circle cx="180" cy="45" r="6" fill="#C07A4B" fillOpacity="0.6" />
                    <circle cx="300" cy="30" r="7" fill="#1F1B16" fillOpacity="0.5" />
                  </svg>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-[#6A5E4C]">
                    <div>
                      <p className="text-[11px] uppercase tracking-wide">Stops</p>
                      <p className="text-sm font-semibold text-[#1F1B16]">3 cities</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wide">Stay</p>
                      <p className="text-sm font-semibold text-[#1F1B16]">4 nights avg</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wide">Focus</p>
                      <p className="text-sm font-semibold text-[#1F1B16]">Food + Coast</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-[#1F1B16]/15 bg-[#FBF7F0] px-4 py-3">
                    <p className="text-xs uppercase tracking-wide text-[#6A5E4C]">Budget lane</p>
                    <p className="mt-2 text-sm font-semibold text-[#1F1B16]">₹3,070 / ₹3,200</p>
                  </div>
                  <div className="rounded-2xl border border-[#1F1B16]/15 bg-[#FBF7F0] px-4 py-3">
                    <p className="text-xs uppercase tracking-wide text-[#6A5E4C]">Pack list</p>
                    <p className="mt-2 text-sm font-semibold text-[#1F1B16]">18 essentials ready</p>
                  </div>
                </div>
                <div className="mt-4 grid gap-3">
                  {[
                    { city: "Lisbon", dates: "Jun 2-5", tag: "Culture" },
                    { city: "Barcelona", dates: "Jun 5-9", tag: "Food" },
                  ].map((stop) => (
                    <div
                      key={stop.city}
                      className="flex items-center justify-between rounded-2xl border border-[#1F1B16]/15 bg-[#FBF7F0] px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-semibold">{stop.city}</p>
                        <p className="text-xs text-[#6A5E4C]">{stop.dates}</p>
                      </div>
                      <Badge className="bg-[#1F1B16]/10 text-[#1F1B16]">{stop.tag}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Everything you need to plan fast</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              A clean feature set focused on flow, clarity, and shareability.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featureTiles.map((feature) => (
              <Card key={feature.title} className="border-border/70">
                <CardHeader className="space-y-3">
                  <feature.icon className="h-6 w-6 text-primary" />
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent />
              </Card>
            ))}
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-4xl border border-border bg-card px-6 py-10">
            <h3 className="text-3xl font-semibold">A polished workflow, end to end.</h3>
            <p className="mt-3 text-muted-foreground">
              Build a trip with structure, then share a single view your crew can trust.
            </p>
            <div className="mt-6 grid gap-3">
              {quickSteps.map((step) => (
                <div key={step} className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/80 px-4 py-3">
                  <Check className="h-4 w-4 text-primary" />
                  <p className="text-sm font-semibold text-foreground">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-4xl border border-border bg-card px-6 py-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Performance</p>
                <h3 className="mt-2 text-2xl font-semibold">Travel teams stay in sync</h3>
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                { label: "Trip readiness", value: "98%" },
                { label: "Budget accuracy", value: "95%" },
                { label: "Share adoption", value: "3.2x" },
                { label: "Planning time", value: "-42%" },
              ].map((metric) => (
                <div key={metric.label} className="rounded-2xl border border-border/70 bg-background/80 px-4 py-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{metric.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">{metric.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-4xl border border-border bg-card px-6 py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-3xl font-semibold">Ready to build your next trip?</h2>
              <p className="mt-2 max-w-xl text-muted-foreground">
                Start from a blank canvas and keep every detail in one product-grade workspace.
              </p>
            </div>
            <Button asChild size="lg">
              <Link href="/signup">Create your account</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
