import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { InvoiceView } from "@/components/invoices/invoice-view";
import { AppShell } from "@/components/layout/app-shell";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireAuth();

  const trip = await prisma.trip.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
    include: {
      stops: {
        orderBy: {
          stopOrder: "asc",
        },
        include: {
          activities: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      },
      expenses: {
        orderBy: {
          date: "asc",
        },
      },
    },
  });

  if (!trip) {
    notFound();
  }

  return (
    <AppShell>
      <InvoiceView 
        trip={trip} 
        userName={session.user.name || "User"}
        userEmail={session.user.email || ""}
      />
    </AppShell>
  );
}
