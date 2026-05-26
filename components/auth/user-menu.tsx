"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { LogOut, User } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function UserMenu({ isCollapsed = false }: { isCollapsed?: boolean }) {
  const { data } = useSession();
  const user = data?.user;
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .toUpperCase()
    : "TL";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={cn(
          "flex items-center rounded-full border border-border bg-card transition-all duration-200",
          isCollapsed ? "p-1 justify-center" : "gap-3 px-2 py-1"
        )}>
          <Avatar>
            <AvatarImage src={user?.profilePhoto ?? ""} alt={user?.name ?? "User"} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <span className="hidden text-sm font-semibold sm:inline pr-2">
              {user?.name ?? "Traveler"}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center gap-2"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
