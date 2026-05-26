"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, CheckCircle2, PlaneTakeoff, Calendar } from "lucide-react";
import { saveCommunityTrip } from "@/lib/actions/community";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { TripShowcaseProps } from "./TripShowcaseCard";

interface CopyTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: TripShowcaseProps["post"];
}

export function CopyTripModal({ isOpen, onClose, post }: CopyTripModalProps) {
  const today = new Date().toLocaleDateString('en-CA');
  const [status, setStatus] = useState<"idle" | "selectDates" | "copying" | "success">("idle");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const router = useRouter();

  const handleOpenDateSelection = () => {
    // Set default dates: today to today + duration
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + Math.max(post.durationDays - 1, 0));

    const formatDate = (date: Date) => date.toISOString().split("T")[0];
    
    setStartDate(formatDate(today));
    setEndDate(formatDate(tomorrow));
    setStatus("selectDates");
  };

  const handleCopy = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error("Start date must be before end date");
      return;
    }

    setStatus("copying");
    try {
      await saveCommunityTrip(post, {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
      setStatus("success");
      setTimeout(() => {
        onClose();
        toast.success("Trip successfully saved!");
        router.push(`/trips#saved-trips`);
      }, 1500);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save trip. Please try again.");
      setStatus("idle");
      setStartDate("");
      setEndDate("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open && status !== "copying") {
        onClose();
        setStatus("idle");
        setStartDate("");
        setEndDate("");
      }
    }}>
      <DialogContent className="sm:max-w-md border-border/70 p-0 overflow-hidden bg-card">
        <div className="relative p-8 flex flex-col items-center text-center">
          <AnimatePresence mode="wait">
            {status === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                className="flex flex-col items-center w-full"
              >
                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
                  <Copy className="h-8 w-8" />
                </div>
                <DialogTitle className="text-2xl font-bold mb-2">Save this itinerary?</DialogTitle>
                <DialogDescription className="text-base mb-8">
                  This will create a private saved copy of <strong>&quot;{post.title}&quot;</strong> in your trips. You can customize dates, stops, and activities later.
                </DialogDescription>
                
                <div className="flex w-full gap-3">
                  <Button variant="outline" className="flex-1" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button className="flex-1" onClick={handleOpenDateSelection}>
                    Yes, Save Trip
                  </Button>
                </div>
              </motion.div>
            )}

            {status === "selectDates" && (
              <motion.div
                key="selectDates"
                initial={{ opacity: 0, scale: 0.9, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: -20 }}
                className="flex flex-col items-center w-full"
              >
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                  <Calendar className="h-6 w-6" />
                </div>
                <DialogTitle className="text-2xl font-bold mb-2 text-center">Plan your trip dates</DialogTitle>
                <p className="text-xs text-muted-foreground text-center mb-6">({post.durationDays} days)</p>

                <div className="w-full space-y-4">
                  <div>
                    <Label htmlFor="copy-start-date" className="text-sm font-medium">
                      Start Date
                    </Label>
                    <Input
                      id="copy-start-date"
                      type="date"
                      min={today}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="copy-end-date" className="text-sm font-medium">
                      End Date
                    </Label>
                    <Input
                      id="copy-end-date"
                      type="date"
                      min={today}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  {startDate && endDate && new Date(startDate) <= new Date(endDate) && (
                    <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
                      <p className="text-xs font-medium text-primary">
                        Duration: {Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} days
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex w-full gap-3 mt-8">
                  <Button 
                    variant="outline" 
                    className="flex-1" 
                    onClick={() => {
                      setStatus("idle");
                      setStartDate("");
                      setEndDate("");
                    }}
                  >
                    Back
                  </Button>
                  <Button 
                    className="flex-1" 
                    onClick={handleCopy}
                    disabled={!startDate || !endDate}
                  >
                    Confirm & Save
                  </Button>
                </div>
              </motion.div>
            )}

            {status === "copying" && (
              <motion.div
                key="copying"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                className="flex flex-col items-center py-6"
              >
                <div className="relative mb-6">
                  <div className="h-20 w-20 rounded-full border-4 border-muted flex items-center justify-center">
                    <PlaneTakeoff className="h-8 w-8 text-primary animate-pulse" />
                  </div>
                  <svg className="absolute inset-0 h-full w-full animate-spin text-primary" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="150" strokeLinecap="round" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Saving Itinerary...</h3>
                <p className="text-muted-foreground text-sm">Packing all the stops and activities into your trips.</p>
              </motion.div>
            )}

            {status === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="flex flex-col items-center py-6"
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                  className="h-20 w-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 text-green-600 dark:text-green-500"
                >
                  <CheckCircle2 className="h-10 w-10" />
                </motion.div>
                <h3 className="text-xl font-bold mb-2">Saved!</h3>
                <p className="text-muted-foreground text-sm">Taking you to your saved trip...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
