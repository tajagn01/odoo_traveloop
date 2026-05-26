"use client";

import Link from "next/link";
import { UserMenu } from "@/components/auth/user-menu";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-transparent w-full lg:hidden">
      <div className="w-full">
        <div className="border border-border/60 bg-[#F7F2EA]/90 px-6 py-4 shadow-lg backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="group inline-flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[#1F1B16] text-xs font-bold uppercase tracking-[0.2em] text-[#F7F2EA]">
                TL
              </span>
              <div className="leading-tight">
                <span className="block text-lg font-semibold tracking-tight text-[#1F1B16] font-display">
                  Traveloop
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#6A5E4C]">
                  Journey Studio
                </span>
              </div>
            </Link>
            
            <div className="flex items-center gap-3">
              {/* Mobile Profile & Sign-out Dropdown */}
              <div className="lg:hidden">
                <UserMenu />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
