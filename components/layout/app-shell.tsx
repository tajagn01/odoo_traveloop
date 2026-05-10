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

export function AppShell({ title, description, actions, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background pb-16 lg:pb-0 overflow-x-hidden">
      <Navbar />
      <div className="mx-auto flex w-full max-w-7xl lg:ml-64 overflow-x-hidden">
        <Sidebar />
        <main className="flex-1 min-w-0 px-4 py-6 md:px-6 md:py-10">
          {(title || description || actions) && (
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
              <div>
                {title ? (
                  <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                    {title}
                  </h1>
                ) : null}
                {description ? (
                  <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>
                ) : null}
              </div>
              {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
            </div>
          )}
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
