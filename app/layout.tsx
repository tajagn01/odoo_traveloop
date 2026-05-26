import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { Manrope, Playfair_Display } from "next/font/google";

import { AuthSessionProvider } from "@/components/auth/session-provider";
import { Toaster } from "@/components/ui/toaster";
import { authOptions } from "@/lib/auth";
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
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html
      lang="en"
      className={`${manrope.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground overflow-x-hidden" suppressHydrationWarning>
        <AuthSessionProvider session={session}>
          {children}
          <Toaster />
        </AuthSessionProvider>
      </body>
    </html>
  );
}
