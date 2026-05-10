import { AppShell } from "@/components/layout/app-shell";
import { requireAuth } from "@/lib/auth-guard";
import { fetchCommunityFeed } from "@/lib/actions/community";
import Link from "next/link";
import { Heart, MessageCircle, Share2, MapPin, MoreHorizontal, Calendar, Bookmark } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";

export default async function FeedPage() {
  await requireAuth();

  const posts = await fetchCommunityFeed(1, 20);

  return (
    <AppShell
      title="Community Feed"
      description="See the latest trips, stories, and recommendations from travelers you follow."
    >
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/60">
        <div className="flex items-center gap-6 text-sm font-medium">
          <Link href="/community" className="text-muted-foreground hover:text-foreground transition-colors">Overview</Link>
          <Link href="/community/explore" className="text-muted-foreground hover:text-foreground transition-colors">Explore</Link>
          <span className="text-foreground border-b-2 border-primary pb-4 -mb-[18px]">Feed</span>
          <Link href="/community/creators" className="text-muted-foreground hover:text-foreground transition-colors">Creators</Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-8 pb-12">
        {posts.length > 0 ? (
          posts.map((post) => {
            const stops = post.trip.stops.sort((a, b) => a.stopOrder - b.stopOrder);
            let durationDays = 0;
            if (stops.length > 0) {
              const first = new Date(stops[0].arrivalDate);
              const last = new Date(stops[stops.length - 1].departureDate);
              durationDays = Math.ceil((last.getTime() - first.getTime()) / (1000 * 60 * 60 * 24)) || 1;
            }

            const destinations = Array.from(new Set(stops.map(s => s.country)));

            return (
              <article key={post.id} className="bg-card rounded-3xl border border-border/60 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {/* Author Header */}
                <div className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full overflow-hidden bg-muted">
                      {post.author.image ? (
                        <img src={post.author.image} alt={post.author.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                          {post.author.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-foreground leading-none mb-1">{post.author.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        Published {formatDistanceToNow(new Date(post.publishedAt))} ago
                      </p>
                    </div>
                  </div>
                  <button className="text-muted-foreground hover:text-foreground transition-colors p-2">
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="px-5 pb-3">
                  <h3 className="text-lg font-bold mb-2">{post.title}</h3>
                  {post.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      {post.description}
                    </p>
                  )}
                  
                  {/* Trip Summary Mini-Card */}
                  <div className="flex flex-wrap gap-4 mb-4 text-xs font-medium bg-muted/30 p-3 rounded-xl border border-border/50">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {destinations.slice(0, 3).join(", ")}{destinations.length > 3 ? "..." : ""}
                    </span>
                    <span className="flex items-center gap-1.5 text-muted-foreground border-l border-border/60 pl-4">
                      <Calendar className="h-3.5 w-3.5" />
                      {durationDays} Days
                    </span>
                    {post.trip.budgetLimit && (
                      <span className="flex items-center gap-1.5 text-muted-foreground border-l border-border/60 pl-4">
                        Cost: ~{formatCurrency(post.trip.budgetLimit)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Images (if any) */}
                {post.coverImage && (
                  <div className="w-full h-80 sm:h-96 relative">
                    <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Actions Footer */}
                <div className="p-4 flex items-center justify-between border-t border-border/60">
                  <div className="flex items-center gap-6">
                    <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-rose-500 transition-colors group">
                      <Heart className="h-5 w-5 group-hover:fill-rose-500/20" />
                      <span className="font-medium">{post._count.likes}</span>
                    </button>
                    <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group">
                      <MessageCircle className="h-5 w-5 group-hover:fill-primary/20" />
                      <span className="font-medium">Reply</span>
                    </button>
                    <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                      <Share2 className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="text-muted-foreground">
                      <Bookmark className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className="py-20 text-center border-2 border-dashed rounded-2xl bg-card">
            <h3 className="text-xl font-bold mb-2">Your feed is empty</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              Follow creators or explore shared trips to fill up your feed with inspiring adventures.
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
