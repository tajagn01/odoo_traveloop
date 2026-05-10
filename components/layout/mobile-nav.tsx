"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, FolderOpen, LayoutDashboard, Settings, Map, Activity, Globe2 } from "lucide-react";

import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/trips", label: "Trips", icon: FolderOpen },
  { href: "/trips/new", label: "New", icon: Compass },
  { href: "/cities", label: "Cities", icon: Map },
  { href: "/activities", label: "Activities", icon: Activity },
  { href: "/community", label: "Community", icon: Globe2 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between border-t border-border/40 bg-background/95 px-6 py-3 pb-safe lg:hidden backdrop-blur-xl">
      {items.slice(0, 5).map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1.5 transition-all duration-300",
              active ? "text-[#0D7A73] scale-110" : "text-muted-foreground/60"
            )}
          >
            <div className={cn(
              "flex h-8 w-8 items-center justify-center rounded-xl transition-all",
              active ? "bg-[#0D7A73]/10" : "bg-transparent"
            )}>
              <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
            </div>
            <span className={cn("text-[10px] font-bold tracking-tight", active ? "opacity-100" : "opacity-0")}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
