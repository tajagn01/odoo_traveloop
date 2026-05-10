import Link from "next/link";

import { UserMenu } from "@/components/auth/user-menu";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 md:px-6 py-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-lg font-semibold tracking-tight">Traveloop</span>
          <span className="rounded-full bg-accent/30 px-2 py-0.5 text-xs font-semibold text-foreground">
            Planner
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link href="/trips/new">Plan New Trip</Link>
          </Button>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
