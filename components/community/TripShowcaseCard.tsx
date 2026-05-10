"use client";

import { motion } from "framer-motion";
import { Heart, Bookmark, Copy, MapPin, Calendar, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { CopyTripModal } from "./CopyTripModal";
import { useState } from "react";

export interface TripShowcaseProps {
  post: {
    id: string;
    title: string;
    coverImage: string | null;
    author: {
      name: string;
      image: string | null;
    };
    trip: {
      id: string;
      budgetLimit: number | null;
    };
    durationDays: number;
    destinations: string[];
    likes: number;
    bookmarks: number;
  };
}

export function TripShowcaseCard({ post }: TripShowcaseProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);

  const toggleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };

  const defaultImage = "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80";
  const makeImageUrl = (url: string | null | undefined) => {
    if (!url) return defaultImage;
    // If URL already has query params, trust it; otherwise append safe Unsplash params
    return url.includes("?") ? url : `${url}?auto=format&fit=crop&w=1200&q=80`;
  };

  return (
    <>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className="group relative flex flex-col rounded-2xl bg-card border border-border/60 overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/20 transition-all"
      >
        {/* Cover Image */}
        <Link href={`/community/post/${post.id}`} className="relative h-56 w-full overflow-hidden block">
          <img
            src={makeImageUrl(post.coverImage)}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = defaultImage;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
          
          <div className="absolute top-3 left-3 flex gap-1.5">
            {post.destinations.slice(0, 2).map(dest => (
              <span key={dest} className="px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-white text-[10px] font-medium border border-white/20">
                {dest}
              </span>
            ))}
            {post.destinations.length > 2 && (
              <span className="px-2 py-1 rounded-full bg-black/40 backdrop-blur-md text-white text-[10px] font-medium border border-white/20">
                +{post.destinations.length - 2}
              </span>
            )}
          </div>
          
          <button className="absolute top-3 right-3 p-2 rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-white/20 transition border border-white/10">
            <Bookmark className="h-4 w-4" />
          </button>
        </Link>

        {/* Content */}
        <div className="flex flex-col flex-1 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-6 w-6 rounded-full overflow-hidden bg-muted">
              {post.author.image ? (
                <img 
                  src={post.author.image} 
                  alt={post.author.name} 
                  className="h-full w-full object-cover" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="h-full w-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                  {post.author.name.charAt(0)}
                </div>
              )}
            </div>
            <span className="text-xs text-muted-foreground font-medium">By {post.author.name}</span>
          </div>

          <Link href={`/community/post/${post.id}`}>
            <h3 className="text-lg font-bold text-foreground leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
              {post.title}
            </h3>
          </Link>

          <div className="flex items-center gap-4 mt-auto pt-4 text-xs text-muted-foreground font-medium">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {post.durationDays} Days
            </span>
            {post.trip.budgetLimit && (
              <span className="flex items-center gap-1.5">
                <Wallet className="h-3.5 w-3.5" />
                ~{formatCurrency(post.trip.budgetLimit)}
              </span>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/60">
            <div className="flex items-center gap-3">
              <button 
                onClick={toggleLike}
                className={cn(
                  "flex items-center gap-1.5 text-xs font-medium transition-all active:scale-125",
                  liked ? "text-rose-500" : "text-muted-foreground hover:text-rose-500"
                )}
              >
                <Heart className={cn("h-4 w-4", liked && "fill-current")} />
                {likeCount}
              </button>
            </div>
            <Button 
              size="sm" 
              variant="secondary" 
              className="h-8 text-xs px-3 rounded-lg font-semibold bg-primary/5 text-primary hover:bg-primary hover:text-primary-foreground transition-all"
              onClick={() => setIsCopyModalOpen(true)}
            >
              <Copy className="h-3 w-3 mr-1.5" />
              Save Trip
            </Button>
          </div>
        </div>
      </motion.div>

      <CopyTripModal 
        isOpen={isCopyModalOpen} 
        onClose={() => setIsCopyModalOpen(false)} 
        post={post}
      />
    </>
  );
}
