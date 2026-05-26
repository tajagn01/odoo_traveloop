import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { CommunityHero } from "@/components/community/CommunityHero";
import { TripShowcaseCard } from "@/components/community/TripShowcaseCard";
import { Sparkles, TrendingUp, ChevronLeft, ChevronRight, Compass } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getFeaturedItineraries } from "@/lib/community-mock";

const POSTS_PER_PAGE = 6;

export default async function CommunityPage(props: { searchParams: Promise<{ page?: string; query?: string }> }) {
  const searchParams = await props.searchParams;
  const currentPage = parseInt(searchParams.page || "1");
  const query = (searchParams.query || "").trim().toLowerCase();

  // 1. Fetch real community posts from the DB inside the SSR flow
  let dbPosts: any[] = [];
  try {
    dbPosts = await prisma.communityPost.findMany({
      orderBy: { publishedAt: "desc" },
      include: {
        author: true,
        trip: {
          include: {
            stops: {
              orderBy: { stopOrder: "asc" },
            },
          },
        },
        _count: {
          select: { likes: true, bookmarks: true },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching community posts:", error);
  }

  // 2. Map DB posts into the format expected by TripShowcaseCard
  const formattedDbPosts = dbPosts.map(post => {
    const stops = post.trip?.stops || [];
    let durationDays = 0;
    if (stops.length > 0) {
      const first = new Date(stops[0].arrivalDate);
      const last = new Date(stops[stops.length - 1].departureDate);
      durationDays = Math.ceil((last.getTime() - first.getTime()) / (1000 * 60 * 60 * 24));
    }

    const destinations = Array.from(new Set(stops.map((s: any) => ((s.cityName || s.country || "") as string).trim()))) as string[];

    return {
      id: post.id,
      title: post.title,
      coverImage: post.coverImage || "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80",
      author: {
        name: post.author?.name || "Anonymous Explorer",
        image: post.author?.image || null,
      },
      trip: {
        id: post.trip?.id || "",
        budgetLimit: post.trip?.budgetLimit || null,
      },
      durationDays: durationDays || 1,
      destinations: destinations.length ? destinations : ["Global"],
      likes: post._count?.likes || 0,
      bookmarks: post._count?.bookmarks || 0,
    };
  });

  // 3. Fetch mock featured itineraries
  const featuredItineraries = getFeaturedItineraries();

  // 4. Combine real database posts at the top, then append mock posts
  const allPosts = [...formattedDbPosts, ...featuredItineraries];

  // 5. Apply real-time query filtering if user searches for anything
  const filteredPosts = query 
    ? allPosts.filter(p => 
        p.title.toLowerCase().includes(query) || 
        p.destinations.some(d => d.toLowerCase().includes(query)) ||
        p.author.name.toLowerCase().includes(query)
      )
    : allPosts;

  // 6. Paginate posts
  const totalPages = Math.max(Math.ceil(filteredPosts.length / POSTS_PER_PAGE), 1);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const currentPosts = filteredPosts.slice(startIndex, endIndex);

  return (
    <AppShell>
      {/* Immersive Header */}
      <div className="relative mb-10 mt-4 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/40 pb-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Traveloop Social Hub</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground tracking-tight leading-none mb-3 font-display">
            The Community <span className="text-primary italic font-serif font-normal font-display">Hub</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl font-medium">
            Explore premium itineraries published by globetrotters and co-create your next masterpiece.
          </p>
        </div>
      </div>
      
      {/* Stunning Interactive Hero Component */}
      <CommunityHero searchQuery={query} />

      {/* Main sections */}
      <div className="space-y-16 pb-24">
        {/* Latest Shared Itineraries Section */}
        <section id="itineraries">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 border-b border-border/40 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Compass className="h-6 w-6 text-primary" />
                <h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
                  {query ? "Search Results" : "Latest Shared Itineraries"}
                </h2>
              </div>
              <p className="text-muted-foreground text-sm">
                {query 
                  ? `Found ${filteredPosts.length} trips matching your query.` 
                  : "Discover newly published real-time itineraries by community members."}
              </p>
            </div>
            {query && (
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 font-semibold p-0 h-auto cursor-pointer" asChild>
                <Link href="/community">Clear Search Filters</Link>
              </Button>
            )}
          </div>

          {/* Feed Grid */}
          {currentPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentPosts.map((post) => (
                <TripShowcaseCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-12 bg-muted/20 border border-dashed border-border/80 rounded-3xl">
              <Compass className="h-12 w-12 text-muted-foreground/60 mb-4 animate-bounce" />
              <h3 className="text-lg font-bold text-foreground mb-1">No shared trips found</h3>
              <p className="text-muted-foreground text-sm max-w-xs">
                We couldn't find any itineraries matching "{query}". Try checking your spelling or explore trending tags!
              </p>
            </div>
          )}

          {/* Pagination UI */}
          {totalPages > 1 && (
            <div className="mt-16 flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                className="rounded-xl border-border/60 hover:bg-muted cursor-pointer"
                disabled={currentPage <= 1}
                asChild={currentPage > 1}
              >
                {currentPage > 1 ? (
                  <Link href={`/community?page=${currentPage - 1}${query ? `&query=${encodeURIComponent(query)}` : ""}`}>
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
                      className={active ? "rounded-xl bg-primary text-primary-foreground font-semibold cursor-pointer" : "rounded-xl border-border/60 hover:bg-muted cursor-pointer"}
                      asChild
                    >
                      <Link href={`/community?page=${pageNum}${query ? `&query=${encodeURIComponent(query)}` : ""}`}>{pageNum}</Link>
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="icon"
                className="rounded-xl border-border/60 hover:bg-muted cursor-pointer"
                disabled={currentPage >= totalPages}
                asChild={currentPage < totalPages}
              >
                {currentPage < totalPages ? (
                  <Link href={`/community?page=${currentPage + 1}${query ? `&query=${encodeURIComponent(query)}` : ""}`}>
                    <ChevronRight className="h-5 w-5" />
                  </Link>
                ) : (
                  <ChevronRight className="h-5 w-5" />
                )}
              </Button>
            </div>
          )}
        </section>

        {/* Trending Destinations */}
        <section>
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2.5">
              <TrendingUp className="h-6 w-6 text-primary" />
              Trending Destinations
            </h2>
            <p className="text-muted-foreground text-sm mt-1">Where the Traveloop community is heading next.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-[400px]">
            <div className="col-span-2 row-span-2 relative rounded-[1.5rem] overflow-hidden group border border-white/5 shadow-lg">
              <img src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80" alt="Japan" className="w-full h-full object-cover transition-transform duration-[1000ms] group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <span className="px-2.5 py-1 rounded-full bg-primary/25 border border-primary/50 text-primary text-[10px] font-bold uppercase tracking-wider mb-2 inline-block">HOT DESTINATION</span>
                <h3 className="text-3xl font-bold font-display">Japan</h3>
                <p className="text-white/80 mt-1 text-sm font-medium">420 shared trips</p>
              </div>
            </div>
            
            <div className="relative rounded-[1.5rem] overflow-hidden group border border-white/5 shadow-md">
              <img src="https://images.unsplash.com/photo-1476610182048-b716b8518aae?auto=format&fit=crop&w=600&q=80" alt="Iceland" className="w-full h-full object-cover transition-transform duration-[1000ms] group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-xl font-bold font-display">Iceland</h3>
                <p className="text-white/80 text-xs font-medium">312 trips</p>
              </div>
            </div>
            
            <div className="relative rounded-[1.5rem] overflow-hidden group border border-white/5 shadow-md">
              <img src="https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=400&q=80" alt="Italy" className="w-full h-full object-cover transition-transform duration-[1000ms] group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-xl font-bold font-display">Italy</h3>
                <p className="text-white/80 text-xs font-medium">285 trips</p>
              </div>
            </div>
            
            <div className="col-span-2 relative rounded-[1.5rem] overflow-hidden group border border-white/5 shadow-md">
              <img src="https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=800&q=80" alt="Bali" className="w-full h-full object-cover transition-transform duration-[1000ms] group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-xl font-bold font-display">Bali, Indonesia</h3>
                <p className="text-white/80 text-xs font-medium">194 trips</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
