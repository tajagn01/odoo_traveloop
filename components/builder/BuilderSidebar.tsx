"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useBuilderStore } from "@/lib/stores/useBuilderStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Wallet, Map, Calendar, AlertTriangle, Globe, Loader2, FileDown } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { differenceInDays } from "date-fns";
import { toast } from "sonner";
import { publishTrip } from "@/lib/actions/community";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export function BuilderSidebar() {
  const router = useRouter();
  const { stops, budgetLimit, warnings, tripName, tripId } = useBuilderStore();

  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [publishTitle, setPublishTitle] = useState("");
  const [publishDesc, setPublishDesc] = useState("");
  const [publishTags, setPublishTags] = useState("");
  const [publishCover, setPublishCover] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);

  const totalStops = stops.length;
  
  let totalDays = 0;
  if (stops.length > 0) {
    const firstArrival = new Date(stops[0].arrivalDate);
    const lastDeparture = new Date(stops[stops.length - 1].departureDate);
    if (!isNaN(firstArrival.getTime()) && !isNaN(lastDeparture.getTime())) {
      totalDays = differenceInDays(lastDeparture, firstArrival);
    }
  }

  const totalStayCost = stops.reduce((sum, stop) => sum + (stop.stayCost || 0), 0);
  const totalTransportCost = stops.reduce((sum, stop) => sum + (stop.transportCost || 0), 0);
  const totalActivityCost = stops.reduce(
    (sum, stop) => sum + stop.activities.reduce((a, act) => a + (act.cost || 0), 0),
    0
  );

  const totalCost = totalStayCost + totalTransportCost + totalActivityCost;
  const progress = budgetLimit ? Math.min((totalCost / budgetLimit) * 100, 100) : 0;
  const isOverBudget = budgetLimit && totalCost > budgetLimit;

  const handleOpenPublish = () => {
    setPublishTitle(tripName || "");
    setPublishDesc("Explore this amazing travel itinerary with me!");
    setPublishCover("https://images.unsplash.com/photo-1488646953014-85cb44e25828");
    
    // Auto-create tags from stops
    const stopTags = stops
      .map((s) => s.cityName.trim().replace(/\s+/g, ""))
      .filter(Boolean);
    const uniqueTags = Array.from(new Set(stopTags));
    setPublishTags(uniqueTags.join(", "));
    
    setIsPublishOpen(true);
  };

  const handlePublishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publishTitle.trim()) {
      toast.error("Please enter a title for your post.");
      return;
    }

    setIsPublishing(true);
    try {
      const tagsArray = publishTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      await publishTrip(tripId, {
        title: publishTitle.trim(),
        description: publishDesc.trim(),
        coverImage: publishCover.trim(),
        tags: tagsArray,
      });

      toast.success("✨ Itinerary successfully published to Community Feed!");
      setIsPublishOpen(false);
      router.push("/community");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to publish itinerary.");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleExportPDF = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="space-y-6 sticky top-6">
      <style jsx global>{`
        @media print {
          aside,
          nav,
          header,
          button,
          .no-print,
          .sticky,
          .sticky.top-6,
          .fixed,
          .border-r,
          header + div,
          button[aria-label="Send"],
          div[role="dialog"] {
            display: none !important;
          }
          
          main {
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          
          .grid {
            display: block !important;
          }
          
          .lg\\:grid-cols-3 {
            grid-template-columns: 1fr !important;
          }
          
          .lg\\:col-span-2 {
            width: 100% !important;
            max-width: 100% !important;
          }

          .border-border\\/70 {
            border: none !important;
          }

          .shadow-sm, .shadow-md, .shadow-lg {
            box-shadow: none !important;
          }

          body {
            background: white !important;
            color: black !important;
            font-size: 12pt !important;
          }
          
          .rounded-3xl, .rounded-2xl, .rounded-xl {
            border-radius: 4px !important;
          }
        }
      `}</style>

      <Card className="border-border/70 shadow-sm">
        <CardHeader className="pb-4 border-b border-border">
          <CardTitle className="text-lg">Trip Summary</CardTitle>
          <p className="text-sm text-muted-foreground">{tripName}</p>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Map className="h-4 w-4" /> Stops
            </span>
            <span className="font-semibold">{totalStops}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" /> Duration
            </span>
            <span className="font-semibold">{totalDays} days</span>
          </div>

          <div className="pt-4 border-t border-border">
            <div className="flex justify-between items-end mb-2">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Wallet className="h-4 w-4" /> Est. Cost
              </span>
              <span className={`text-xl font-bold ${isOverBudget ? "text-red-500" : ""}`}>
                {formatCurrency(totalCost)}
              </span>
            </div>
            {budgetLimit && (
              <div className="space-y-1.5">
                <Progress value={progress} className={`h-2 ${isOverBudget ? "bg-red-200" : ""}`} />
                <p className="text-xs text-right text-muted-foreground">
                  Limit: {formatCurrency(budgetLimit)}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Stay</span>
              <span>{formatCurrency(totalStayCost)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Transport</span>
              <span>{formatCurrency(totalTransportCost)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Activities</span>
              <span>{formatCurrency(totalActivityCost)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {warnings.length > 0 && (
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2 text-red-600 font-semibold text-sm">
              <AlertTriangle className="h-4 w-4" />
              Planning Warnings
            </div>
            <ul className="list-disc pl-4 text-xs text-red-600 space-y-1">
              {warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3 no-print">
        <Button onClick={handleOpenPublish} className="w-full flex items-center justify-center gap-2 cursor-pointer bg-[#0D7A73] text-white hover:bg-[#0A625C] transition-colors rounded-2xl">
          <Globe className="h-4 w-4" />
          Publish Itinerary
        </Button>
        <Button onClick={handleExportPDF} variant="outline" className="w-full flex items-center justify-center gap-2 cursor-pointer border border-border bg-transparent text-foreground hover:bg-muted rounded-2xl">
          <FileDown className="h-4 w-4" />
          Export PDF
        </Button>
      </div>

      <Dialog open={isPublishOpen} onOpenChange={setIsPublishOpen}>
        <DialogContent className="max-w-md rounded-[28px] p-6 border border-border/80 shadow-lg bg-card">
          <DialogHeader>
            <DialogTitle className="text-xl font-display text-foreground flex items-center gap-2">
              <Globe className="h-5 w-5 text-[#0D7A73]" />
              Publish to Community Feed
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Share your perfect multi-stop travel itinerary blueprint with the Traveloop community. Others can copy and utilize it as a blueprint for their own loops!
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handlePublishSubmit} className="space-y-4 pt-2">
            <div className="space-y-1">
              <label htmlFor="post-title" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Post Title
              </label>
              <input
                id="post-title"
                type="text"
                required
                placeholder="e.g. Ultimate Tokyo 5-Day Adventure"
                value={publishTitle}
                onChange={(e) => setPublishTitle(e.target.value)}
                className="w-full h-11 px-4 text-sm rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#0D7A73]/20"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="post-desc" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Description
              </label>
              <textarea
                id="post-desc"
                rows={3}
                placeholder="e.g. Brief summary of what to expect, packing tips, or recommendations..."
                value={publishDesc}
                onChange={(e) => setPublishDesc(e.target.value)}
                className="w-full p-4 text-sm rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#0D7A73]/20 resize-none"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="post-cover" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Cover Photo URL
              </label>
              <input
                id="post-cover"
                type="url"
                placeholder="e.g. https://images.unsplash.com/..."
                value={publishCover}
                onChange={(e) => setPublishCover(e.target.value)}
                className="w-full h-11 px-4 text-sm rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#0D7A73]/20"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="post-tags" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Tags (Comma separated)
              </label>
              <input
                id="post-tags"
                type="text"
                placeholder="e.g. Summer, Culture, Budget"
                value={publishTags}
                onChange={(e) => setPublishTags(e.target.value)}
                className="w-full h-11 px-4 text-sm rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#0D7A73]/20"
              />
              <p className="text-[10px] text-muted-foreground pl-1">
                We've pre-filled these with your stops: Tokyo, Kyoto, etc.
              </p>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsPublishOpen(false)}
                disabled={isPublishing}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPublishing}
                className="bg-[#0D7A73] hover:bg-[#0A625C] text-white rounded-xl px-5 flex items-center gap-2 font-bold cursor-pointer"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>🚀 Share Now</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
