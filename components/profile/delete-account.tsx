"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function DeleteAccountButton() {
  const router = useRouter();

  const handleDelete = async () => {
    const confirmed = window.confirm("Delete your account and all trips?");
    if (!confirmed) return;

    const response = await fetch("/api/profile", { method: "DELETE" });
    if (!response.ok) {
      toast.error("Unable to delete account.");
      return;
    }

    toast.success("Account deleted.");
    router.push("/login");
  };

  return (
    <Button variant="ghost" onClick={handleDelete}>
      Delete account
    </Button>
  );
}
