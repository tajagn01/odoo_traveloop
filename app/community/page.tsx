import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Share2, MapPin } from "lucide-react";
import { requireAuth } from "@/lib/auth-guard";

const communityPosts = [
  {
    id: "1",
    author: "Sofia Martinez",
    avatar: "SM",
    avatarColor: "bg-violet-500",
    location: "Barcelona, Spain",
    timeAgo: "2 hours ago",
    content:
      "Just finished planning my Mediterranean loop — Lisbon → Barcelona → Nice → Rome. The itinerary builder made it so easy to see how the budget stacks up across each stop. Highly recommend setting a budget limit per city!",
    tags: ["Mediterranean", "Multi-city", "Budget"],
    likes: 42,
    comments: 8,
  },
  {
    id: "2",
    author: "James Kowalski",
    avatar: "JK",
    avatarColor: "bg-blue-500",
    location: "Kyoto, Japan",
    timeAgo: "5 hours ago",
    content:
      "Spent 3 days in Kyoto and the activity suggestions were spot on. The Arashiyama Bamboo Grove and Fushimi Inari Shrine are must-dos. Already added them to my packing list with the right gear tags.",
    tags: ["Japan", "Culture", "Nature"],
    likes: 71,
    comments: 14,
  },
  {
    id: "3",
    author: "Amara Osei",
    avatar: "AO",
    avatarColor: "bg-amber-500",
    location: "Accra, Ghana",
    timeAgo: "1 day ago",
    content:
      "Planning a West Africa trip for the first time and the city discovery feature helped me find destinations I'd never considered. The cost index is really useful when working with a tight budget.",
    tags: ["West Africa", "Discovery", "First-timer"],
    likes: 33,
    comments: 6,
  },
  {
    id: "4",
    author: "Lena Fischer",
    avatar: "LF",
    avatarColor: "bg-emerald-500",
    location: "Vienna, Austria",
    timeAgo: "2 days ago",
    content:
      "Pro tip: use the Notes section to keep track of restaurant recommendations from locals. I had 12 notes pinned to Vienna alone and every single one was worth it. Food trip of a lifetime!",
    tags: ["Austria", "Food", "Pro Tips"],
    likes: 89,
    comments: 22,
  },
  {
    id: "5",
    author: "Takeshi Yamamoto",
    avatar: "TY",
    avatarColor: "bg-rose-500",
    location: "Tokyo, Japan",
    timeAgo: "3 days ago",
    content:
      "Completed a 14-day Japan loop: Tokyo → Osaka → Kyoto → Hiroshima → Nara. The packing checklist was a lifesaver — never forgot anything this time! Shared my itinerary publicly if anyone wants a reference.",
    tags: ["Japan Loop", "14 Days", "Shared"],
    likes: 124,
    comments: 31,
  },
];

export default async function CommunityPage() {
  await requireAuth();

  return (
    <AppShell
      title="Community"
      description="See how other travelers are planning their adventures. Share your own tips and itineraries."
    >
      <div className="space-y-6">
        {/* Stats bar */}
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Active Travelers", value: "2,841" },
            { label: "Shared Itineraries", value: "1,203" },
            { label: "Tips Shared", value: "4,519" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-border bg-card px-5 py-4 text-center"
            >
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Posts feed */}
        <div className="space-y-4">
          {communityPosts.map((post) => (
            <Card key={post.id} className="border-border/70">
              <CardHeader className="pb-2">
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${post.avatarColor}`}
                  >
                    {post.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <p className="font-semibold text-sm text-foreground">{post.author}</p>
                      <span className="text-xs text-muted-foreground">{post.timeAgo}</span>
                    </div>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {post.location}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-foreground leading-relaxed">{post.content}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.map((tag) => (
                    <Badge key={tag} className="bg-muted text-foreground text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 pt-1 border-t border-border/60">
                  <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-rose-500 transition">
                    <Heart className="h-3.5 w-3.5" />
                    {post.likes}
                  </button>
                  <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition">
                    <MessageCircle className="h-3.5 w-3.5" />
                    {post.comments}
                  </button>
                  <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition">
                    <Share2 className="h-3.5 w-3.5" />
                    Share
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
