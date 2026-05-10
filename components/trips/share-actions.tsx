"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ShareActions({ shareUrl }: { shareUrl: string }) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Share link copied.");
    setTimeout(() => setCopied(false), 2000);
  };

  const nativeShare = async () => {
    if (!navigator.share) {
      toast.message("Sharing is not available in this browser.");
      return;
    }

    await navigator.share({ title: "Traveloop itinerary", url: shareUrl });
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Input value={shareUrl} readOnly />
      <Button variant="outline" onClick={copyLink}>
        {copied ? "Copied" : "Copy link"}
      </Button>
      <Button onClick={nativeShare}>Share</Button>
    </div>
  );
}
