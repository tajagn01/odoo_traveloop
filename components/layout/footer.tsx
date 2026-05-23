import Link from "next/link";

const footerLinks = [
  {
    title: "Product",
    links: [
      { label: "Trips", href: "/trips" },
      { label: "Cities", href: "/cities" },
      { label: "Community", href: "/community" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign up", href: "/signup" },
      { label: "Sign in", href: "/login" },
      { label: "Dashboard", href: "/dashboard" },
    ],
  },
  {
    title: "Planning",
    links: [
      { label: "Itinerary", href: "/itinerary" },
      { label: "Packing", href: "/packing" },
      { label: "Profile", href: "/profile" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border/70 bg-card/80">
      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-xl font-semibold tracking-tight font-display">Traveloop</span>
              <span className="rounded-lg bg-accent px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Planner
              </span>
            </div>
            <p className="max-w-xs text-sm text-muted-foreground">
              Plan multi-city trips with a clear itinerary, real-time budget tracking, and shareable views.
            </p>
          </div>
          {footerLinks.map((section) => (
            <div key={section.title} className="space-y-3">
              <p className="text-sm font-semibold text-foreground">{section.title}</p>
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                {section.links.map((link) => (
                  <Link key={link.label} href={link.href} className="transition hover:text-foreground">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>Copyright {new Date().getFullYear()} Traveloop. All rights reserved.</span>
          <span>Designed for calm, modern travel planning.</span>
        </div>
      </div>
    </footer>
  );
}
