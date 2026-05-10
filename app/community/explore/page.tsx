import { AppShell } from "@/components/layout/app-shell";
import { FilterSidebar } from "@/components/community/FilterSidebar";
import { TripShowcaseCard } from "@/components/community/TripShowcaseCard";
import { requireAuth } from "@/lib/auth-guard";
import { fetchCommunityFeed } from "@/lib/actions/community";
import { LayoutGrid, List } from "lucide-react";
import Link from "next/link";

export default async function ExplorePage() {
  await requireAuth();

  // Fetch paginated feed
  const posts = await fetchCommunityFeed(1, 20);

  const formattedPosts = posts.map(post => {
    const stops = post.trip.stops.sort((a, b) => a.stopOrder - b.stopOrder);
    let durationDays = 0;
    if (stops.length > 0) {
      const first = new Date(stops[0].arrivalDate);
      const last = new Date(stops[stops.length - 1].departureDate);
      durationDays = Math.ceil((last.getTime() - first.getTime()) / (1000 * 60 * 60 * 24));
    }

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
      title="Explore Itineraries"
      description="Find the perfect trip blueprint for your next adventure."
    >
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/60">
        <div className="flex items-center gap-6 text-sm font-medium">
          <Link href="/community" className="text-muted-foreground hover:text-foreground transition-colors">Overview</Link>
          <span className="text-foreground border-b-2 border-primary pb-4 -mb-[18px]">Explore</span>
          <Link href="/community/feed" className="text-muted-foreground hover:text-foreground transition-colors">Feed</Link>
          <Link href="/community/creators" className="text-muted-foreground hover:text-foreground transition-colors">Creators</Link>
        </div>
        
        <div className="hidden sm:flex items-center gap-2 bg-muted rounded-lg p-1">
          <button className="p-1.5 rounded-md bg-background shadow-sm text-foreground">
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors">
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full lg:w-72 shrink-0 hidden md:block">
          <FilterSidebar />
        </aside>

        {/* Main Grid */}
        <main className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-muted-foreground">{formattedPosts.length} itineraries found</p>
            <select className="bg-transparent text-sm font-medium border-none outline-none focus:ring-0 cursor-pointer text-foreground">
              <option>Most Popular</option>
              <option>Recently Added</option>
              <option>Budget: Low to High</option>
              <option>Duration: Short to Long</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {formattedPosts.length > 0 ? (
              formattedPosts.map((post) => (
                <TripShowcaseCard key={post.id} post={post} />
              ))
            ) : (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-center border-2 border-dashed rounded-xl bg-muted/20">
                <p className="text-lg font-medium text-foreground mb-1">No trips match your filters</p>
                <p className="text-muted-foreground text-sm">Try adjusting your budget or destination search.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </AppShell>
  );
}
