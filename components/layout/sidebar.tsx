"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  FolderOpen,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Map,
  Users,
  BarChart2,
  Globe2,
  User,
  Backpack,
  MapPinned,
} from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Trips", href: "/trips", icon: FolderOpen },
  { label: "Itineraries", href: "/itinerary", icon: MapPinned },
  { label: "City Search", href: "/cities", icon: Map },
  { label: "Community", href: "/community", icon: Globe2 },
  { label: "Packing Checklist", href: "/packing", icon: Backpack },
  { label: "Profile", href: "/profile", icon: User },
  { label: "Settings", href: "/settings", icon: Settings },
];

const adminItems = [
  { label: "Admin", href: "/admin", icon: ShieldCheck },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Trips Analytics", href: "/admin/trips", icon: BarChart2 },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-64 shrink-0 border-r border-border/70 bg-background/95 px-4 py-6 lg:block overflow-y-auto">
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                isActive(item.href) && "bg-muted text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}

        <div className="my-3 border-t border-border/60" />
        <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
          Admin
        </p>
        {adminItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                isActive(item.href) && "bg-muted text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
