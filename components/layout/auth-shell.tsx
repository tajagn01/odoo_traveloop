import type { ReactNode } from "react";
import Link from "next/link";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#f8efe0,_#f5f1ea_50%,_#f0ebe4_100%)] px-6 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 flex items-center gap-2 text-sm font-semibold">
          <span className="text-base font-semibold">Traveloop</span>
          <span className="rounded-full bg-accent/30 px-2 py-0.5 text-xs">Planner</span>
        </Link>
        {children}
      </div>
    </div>
  );
}
