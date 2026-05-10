"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Copy, CheckCircle2, PlaneTakeoff } from "lucide-react";
import { copyTrip } from "@/lib/actions/community";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CopyTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  tripName: string;
}

export function CopyTripModal({ isOpen, onClose, postId, tripName }: CopyTripModalProps) {
  const [status, setStatus] = useState<"idle" | "copying" | "success">("idle");
  const router = useRouter();

  const handleCopy = async () => {
    setStatus("copying");
    try {
      const newTrip = await copyTrip(postId);
      setStatus("success");
      setTimeout(() => {
        onClose();
        toast.success("Trip successfully copied!");
        router.push(`/trips/${newTrip.id}`);
      }, 1500);
    } catch (error) {
      console.error(error);
      toast.error("Failed to copy trip. Please try again.");
      setStatus("idle");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open && status !== "copying") onClose();
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
                className="flex flex-col items-center"
              >
                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
                  <Copy className="h-8 w-8" />
                </div>
                <DialogTitle className="text-2xl font-bold mb-2">Copy this itinerary?</DialogTitle>
                <DialogDescription className="text-base mb-8">
                  This will create a private duplicate of <strong>"{tripName}"</strong> in your dashboard. You can customize dates, stops, and activities later.
                </DialogDescription>
                
                <div className="flex w-full gap-3">
                  <Button variant="outline" className="flex-1" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button className="flex-1" onClick={handleCopy}>
                    Yes, Copy Trip
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
                <h3 className="text-xl font-bold mb-2">Cloning Itinerary...</h3>
                <p className="text-muted-foreground text-sm">Packing all the stops and activities into your suitcase.</p>
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
                <h3 className="text-xl font-bold mb-2">Success!</h3>
                <p className="text-muted-foreground text-sm">Taking you to your new trip...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
