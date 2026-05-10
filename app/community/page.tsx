import { AppShell } from "@/components/layout/app-shell";
import { CommunityHero } from "@/components/community/CommunityHero";
import { TripShowcaseCard } from "@/components/community/TripShowcaseCard";
import { Compass, Sparkles, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getFeaturedItineraries } from "@/lib/community-mock";

const POSTS_PER_PAGE = 6;

  // Fetch some featured/recent posts
  let posts = [];
  try {
    posts = await prisma.communityPost.findMany({
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
  } catch (error) {
    console.error("Error fetching community posts:", error);
    // Return empty array if database query fails
  }

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
export default async function CommunityPage(props: { searchParams: Promise<{ page?: string }> }) {
  const searchParams = await props.searchParams;
  const currentPage = parseInt(searchParams.page || "1");
  const featuredItineraries = getFeaturedItineraries();
  const totalPages = Math.ceil(featuredItineraries.length / POSTS_PER_PAGE);
  
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const currentPosts = featuredItineraries.slice(startIndex, endIndex);

  return (
    <AppShell>
      <div className="mb-12">
        <h1 className="text-5xl md:text-6xl font-display text-foreground mb-4 leading-tight">
          Traveloop <span className="text-rose-500">Community</span>
        </h1>
        <p className="text-muted-foreground text-xl max-w-2xl font-medium">
          Discover shared itineraries and get inspired for your next adventure.
        </p>
      </div>
      
      <CommunityHero />

      <div className="space-y-16 pb-24">
        {/* Featured Trips Section */}
        <section>
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2 mb-2">
                <Sparkles className="h-6 w-6 text-primary" />
                Latest Itineraries
              </h2>
              <p className="text-muted-foreground">Showing page {currentPage} of {totalPages}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentPosts.map((post) => (
              <TripShowcaseCard key={post.id} post={post} />
            ))}
          </div>

          {/* Pagination UI */}
          <div className="mt-16 flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              className="rounded-xl"
              disabled={currentPage <= 1}
              asChild={currentPage > 1}
            >
              {currentPage > 1 ? (
                <Link href={`/community?page=${currentPage - 1}`}>
                  <ChevronLeft className="h-5 w-5" />
                </Link>
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </Button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1;
                const active = pageNum === currentPage;
                return (
                  <Button
                    key={pageNum}
                    variant={active ? "default" : "outline"}
                    className={active ? "rounded-xl bg-primary text-primary-foreground" : "rounded-xl"}
                    asChild
                  >
                    <Link href={`/community?page=${pageNum}`}>{pageNum}</Link>
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="icon"
              className="rounded-xl"
              disabled={currentPage >= totalPages}
              asChild={currentPage < totalPages}
            >
              {currentPage < totalPages ? (
                <Link href={`/community?page=${currentPage + 1}`}>
                  <ChevronRight className="h-5 w-5" />
                </Link>
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </Button>
          </div>
        </section>

        {/* Trending Destinations */}
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
              <img src="https://images.unsplash.com/photo-1476610182048-b716b8518aae?auto=format&fit=crop&w=600&q=80" alt="Iceland" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-xl font-bold">Iceland</h3>
                <p className="text-white/80 text-sm">312 trips</p>
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
