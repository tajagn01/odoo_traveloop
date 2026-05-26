"use client";

import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";
import {
  FolderOpen,
  LayoutDashboard,
  ShieldCheck,
  Map,
  Users,
  BarChart2,
  Globe2,
  User,
  Backpack,
  MapPinned,
  Receipt,
  ChevronLeft,
  ChevronRight,
  Plus
} from "lucide-react";

import { cn } from "@/lib/utils";
import { UserMenu } from "@/components/auth/user-menu";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Trips", href: "/trips", icon: FolderOpen },
  { label: "Itineraries", href: "/itinerary", icon: MapPinned },
  { label: "Invoices", href: "/invoices", icon: Receipt },
  { label: "City Search", href: "/cities", icon: Map },
  { label: "Community", href: "/community", icon: Globe2 },
  { label: "Packing Checklist", href: "/packing", icon: Backpack },
  { label: "Profile", href: "/profile", icon: User },
];

const adminItems = [
  { label: "Admin", href: "/admin", icon: ShieldCheck },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Trips Analytics", href: "/admin/trips", icon: BarChart2 },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(false);

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
    <aside className={cn(
      "hidden h-full shrink-0 border-r border-border/40 bg-background px-4 py-6 lg:flex flex-col transition-all duration-300 z-30",
      isCollapsed ? "w-20" : "w-64"
    )}>
      {/* Brand Logo Header & Toggle Button */}
      <div className="flex flex-col gap-4 mb-6 pb-6 border-b border-border/40">
        <div className={cn("flex items-center", isCollapsed ? "justify-center" : "justify-between px-1")}>
          <Link href="/dashboard" className="group flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#1F1B16] text-xs font-bold uppercase tracking-[0.2em] text-[#F7F2EA] transition-all duration-200">
              TL
            </span>
            {!isCollapsed && (
              <div className="leading-tight transition-all duration-200">
                <span className="block text-lg font-semibold tracking-tight text-foreground font-display group-hover:text-primary transition-colors">
                  Traveloop
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">
                  Journey Studio
                </span>
              </div>
            )}
          </Link>
          
          {!isCollapsed && (
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer shrink-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        {isCollapsed && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 flex flex-col gap-1 overflow-y-auto pr-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition-all duration-200",
                isCollapsed && "justify-center px-0",
                active 
                  ? "bg-muted text-foreground shadow-sm" 
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <Icon className={cn("h-4 w-4 transition-colors shrink-0", active ? "text-foreground" : "text-muted-foreground/70 group-hover:text-foreground")} />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}

        {isAdmin && (
          <>
            <div className="my-4 border-t border-border/40 mx-2" />
            {!isCollapsed && (
              <p className="mb-2 px-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/40">
                Admin
              </p>
            )}
            {adminItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isCollapsed ? item.label : undefined}
                  className={cn(
                    "group flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition-all duration-200",
                    isCollapsed && "justify-center px-0",
                    active 
                      ? "bg-muted text-foreground shadow-sm" 
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <Icon className={cn("h-4 w-4 transition-colors shrink-0", active ? "text-foreground" : "text-muted-foreground/70 group-hover:text-foreground")} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* End of Sidebar - UserMenu & New Trip */}
      <div className="mt-auto pt-6 border-t border-border/40 flex flex-col gap-4">
        {/* New Trip Button */}
        <Button
          asChild
          className={cn(
            "bg-primary text-white hover:bg-primary/90 font-semibold shadow-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 rounded-2xl shrink-0 overflow-hidden",
            isCollapsed ? "h-10 w-10 p-0 rounded-full" : "h-11 px-5 w-full"
          )}
        >
          <Link href="/trips/new" title={isCollapsed ? "New trip" : undefined} className="flex items-center justify-center">
            <Plus className="h-5 w-5 shrink-0" />
            {!isCollapsed && <span className="truncate">New trip</span>}
          </Link>
        </Button>

        {/* User Profile Block */}
        <div className={cn("flex shrink-0", isCollapsed ? "justify-center" : "justify-start")}>
          <UserMenu isCollapsed={isCollapsed} />
        </div>
      </div>
    </aside>
  );
}
