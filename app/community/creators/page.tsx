import { AppShell } from "@/components/layout/app-shell";
import { CreatorCard } from "@/components/community/CreatorCard";
import Link from "next/link";
import { requireAuth } from "@/lib/auth-guard";

// Mock data since we don't have enough seeded creators yet
const MOCK_CREATORS = [
  {
    id: "1",
    name: "Elena Rodriguez",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80",
    isVerified: true,
    bio: "Digital nomad capturing the essence of South America and Europe. Food lover and architecture enthusiast.",
    stats: { trips: 24, followers: "12.4K", countries: 18 },
    recentDestinations: ["Peru", "Colombia", "Spain", "Italy"],
  },
  {
    id: "2",
    name: "Marcus Chen",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
    isVerified: true,
    bio: "Minimalist packer. Specializing in high-speed rail trips across East Asia and hidden mountain temples.",
    stats: { trips: 15, followers: "8.2K", countries: 9 },
    recentDestinations: ["Japan", "South Korea", "Taiwan"],
  },
  {
    id: "3",
    name: "Sarah & Tom",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80",
    isVerified: false,
    bio: "Couple travel on a budget. Showing you how to see the world without breaking the bank.",
    stats: { trips: 31, followers: "45K", countries: 22 },
    recentDestinations: ["Thailand", "Vietnam", "Indonesia", "Malaysia"],
  },
  {
    id: "4",
    name: "David Okafor",
    image: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&w=256&q=80",
    isVerified: true,
    bio: "Luxury travel and exclusive experiences across the African continent and the Middle East.",
    stats: { trips: 12, followers: "105K", countries: 14 },
    recentDestinations: ["Kenya", "South Africa", "UAE", "Morocco"],
  },
];

export default async function CreatorsPage() {
  await requireAuth();

  return (
    <AppShell
      title="Top Creators"
      description="Follow the best travel planners on Traveloop to get their latest itineraries."
    >
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/60">
        <div className="flex items-center gap-6 text-sm font-medium">
          <Link href="/community" className="text-muted-foreground hover:text-foreground transition-colors">Overview</Link>
          <Link href="/community/explore" className="text-muted-foreground hover:text-foreground transition-colors">Explore</Link>
          <Link href="/community/feed" className="text-muted-foreground hover:text-foreground transition-colors">Feed</Link>
          <span className="text-foreground border-b-2 border-primary pb-4 -mb-[18px]">Creators</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
        {MOCK_CREATORS.map(creator => (
          <CreatorCard key={creator.id} creator={creator} />
        ))}
      </div>
    </AppShell>
  );
}
