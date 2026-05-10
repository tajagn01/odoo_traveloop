"use client";

import Link from "next/link";
import React from "react";
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
  Receipt,
} from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Trips", href: "/trips", icon: FolderOpen },
  { label: "Itineraries", href: "/itinerary", icon: MapPinned },
  { label: "Invoices", href: "/invoices", icon: Receipt },
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
  const [isAdmin, setIsAdmin] = React.useState(false);
  React.useEffect(() => {
    let mounted = true;
    fetch('/api/admin/status')
      .then((r) => r.json())
      .then((data) => {
        if (mounted && data?.isAdmin) setIsAdmin(true);
      })
      .catch(() => {
        /* ignore */
      });
    return () => {
      mounted = false;
    };
  }, []);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside className="hidden h-screen w-64 shrink-0 border-r border-border/40 bg-background px-4 py-8 lg:flex flex-col sticky top-0">
      <nav className="flex-1 flex flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition-all",
                active 
                  ? "bg-muted text-foreground shadow-sm" 
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <Icon className={cn("h-4 w-4 transition-colors", active ? "text-foreground" : "text-muted-foreground/70 group-hover:text-foreground")} />
              {item.label}
            </Link>
          );
        })}

        <div className="my-6 border-t border-border/40 mx-2" />
        
        {isAdmin && (
          <>
            <p className="mb-2 px-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/40">
              Admin
            </p>
            {adminItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition-all",
                active 
                  ? "bg-muted text-foreground shadow-sm" 
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <Icon className={cn("h-4 w-4 transition-colors", active ? "text-foreground" : "text-muted-foreground/70 group-hover:text-foreground")} />
              {item.label}
            </Link>
          );
        })}
          </>
        )}
      </nav>
    </aside>
  );
}
