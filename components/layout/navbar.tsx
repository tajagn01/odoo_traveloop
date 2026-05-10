"use client";

import Link from "next/link";

import { UserMenu } from "@/components/auth/user-menu";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/40">
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-6 md:px-12 py-5">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <span className="text-xl font-bold tracking-tight text-foreground font-display transition-colors group-hover:text-[#0D7A73]">Traveloop</span>
          <span className="rounded-lg bg-[#E5D9C4] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#666666]">
            Planner
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" className="hidden sm:inline-flex font-semibold text-sm hover:bg-[#0D7A73]/10 hover:text-[#0D7A73]">
            <Link href="/trips/new">Plan New Trip</Link>
          </Button>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
