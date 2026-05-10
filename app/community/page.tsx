import { AppShell } from "@/components/layout/app-shell";
import { CommunityHero } from "@/components/community/CommunityHero";
import { TripShowcaseCard } from "@/components/community/TripShowcaseCard";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { Compass, Sparkles, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function CommunityPage() {
  const session = await requireAuth();

  // Fetch some featured/recent posts
  const posts = await prisma.communityPost.findMany({
    take: 6,
    orderBy: { likes: { _count: "desc" } },
    include: {
      author: true,
      trip: {
        include: { stops: true },
      },
      _count: {
        select: { likes: true, bookmarks: true },
      },
    },
  });

  // Calculate duration and destinations for the UI
  const formattedPosts = posts.map(post => {
    const stops = post.trip.stops.sort((a, b) => a.stopOrder - b.stopOrder);
    let durationDays = 0;
    if (stops.length > 0) {
      const first = new Date(stops[0].arrivalDate);
      const last = new Date(stops[stops.length - 1].departureDate);
      durationDays = Math.ceil((last.getTime() - first.getTime()) / (1000 * 60 * 60 * 24));
    }

    // Unique countries or cities
    const destinations = Array.from(new Set(stops.map(s => s.country)));

    return {
      id: post.id,
      title: post.title,
      coverImage: post.coverImage,
      author: {
        name: post.author.name,
        image: post.author.image,
      },
      trip: {
        id: post.trip.id,
        budgetLimit: post.trip.budgetLimit,
      },
      durationDays: durationDays || 1,
      destinations: destinations.length ? destinations : ["Unknown"],
      likes: post._count.likes,
      bookmarks: post._count.bookmarks,
    };
  });

  return (
    <AppShell
      title="Community"
      description="Discover shared itineraries and get inspired for your next adventure."
    >
      <CommunityHero />

      <div className="space-y-16 pb-12">
        {/* Featured Trips Section */}
        <section>
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2 mb-2">
                <Sparkles className="h-6 w-6 text-primary" />
                Featured Itineraries
              </h2>
              <p className="text-muted-foreground">Handpicked trips from our top creators.</p>
            </div>
            <Button variant="ghost" asChild className="hidden sm:flex">
              <Link href="/community/explore">View All</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {formattedPosts.length > 0 ? (
              formattedPosts.map((post) => (
                <TripShowcaseCard key={post.id} post={post} />
              ))
            ) : (
              <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl bg-muted/20">
                <p className="text-muted-foreground">No featured trips available yet.</p>
              </div>
            )}
          </div>
          <Button variant="outline" asChild className="w-full mt-6 sm:hidden">
            <Link href="/community/explore">View All Trips</Link>
          </Button>
        </section>

        {/* Trending Destinations (Mocked for now) */}
        <section>
          <div className="mb-8">
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-2">
              <TrendingUp className="h-6 w-6 text-rose-500" />
              Trending Destinations
            </h2>
            <p className="text-muted-foreground">Where the community is heading next.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-[400px]">
            <div className="col-span-2 row-span-2 relative rounded-2xl overflow-hidden group">
              <img src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80" alt="Japan" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="text-3xl font-bold">Japan</h3>
                <p className="text-white/80 mt-1">420 shared trips</p>
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden group">
              <img src="https://images.unsplash.com/photo-1515542622106-78b28af78158?auto=format&fit=crop&w=400&q=80" alt="Italy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-xl font-bold">Italy</h3>
                <p className="text-white/80 text-sm">285 trips</p>
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden group">
              <img src="https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=400&q=80" alt="Italy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-xl font-bold">Italy</h3>
                <p className="text-white/80 text-sm">285 trips</p>
              </div>
            </div>
            <div className="col-span-2 relative rounded-2xl overflow-hidden group">
              <img src="https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=800&q=80" alt="Bali" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-xl font-bold">Bali, Indonesia</h3>
                <p className="text-white/80 text-sm">194 trips</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
