"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function CopyTripButton({ token }: { token: string }) {
  const router = useRouter();

  const handleCopy = async () => {
    const response = await fetch(`/api/share/${token}/copy`, { method: "POST" });
    if (response.status === 401) {
      router.push("/login");
      return;
    }

    if (!response.ok) {
      toast.error("Unable to copy trip.");
      return;
    }

    const data = await response.json();
    toast.success("Trip copied to your account.");
    router.push(`/trips/${data.trip.id}/builder`);
  };

  return (
    <Button onClick={handleCopy}>
      Copy trip to my account
    </Button>
  );
}
