import type { ReactNode } from "react";

import { MobileNav } from "@/components/layout/mobile-nav";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";

type AppShellProps = {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden selection:bg-teal-100 selection:text-teal-900">
      <Navbar />
      <div className="flex flex-1 min-w-0 min-h-0">
        <Sidebar />
        <div className="flex-1 min-w-0 min-h-0 overflow-y-auto">
          <main className="flex-1 px-6 md:px-12 pb-24 pt-6">
            <div className="mx-auto max-w-[1400px] w-full">
              {children}
            </div>
          </main>
        </div>
        <MobileNav />
      </div>
    </div>
  );
}
