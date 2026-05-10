import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Manrope, Playfair_Display } from "next/font/google";

import { AuthSessionProvider } from "@/components/auth/session-provider";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Traveloop",
  description: "Plan multi-city itineraries with budgets, packing lists, and shared views.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground overflow-x-hidden" suppressHydrationWarning>
        <AuthSessionProvider>
          {children}
          <Toaster />
        </AuthSessionProvider>
      </body>
    </html>
  );
}
