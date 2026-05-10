import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { InvoiceClient } from "./invoice-client";
import { AppShell } from "@/components/layout/app-shell";

export default async function InvoicesPage() {
  const session = await requireAuth();

  const trips = await prisma.trip.findMany({
    where: {
      userId: session.user.id,
    },
    select: {
      id: true,
      tripName: true,
      startDate: true,
      endDate: true,
      description: true,
      budgetLimit: true,
      stops: {
        select: {
          id: true,
          cityName: true,
          country: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <AppShell>
      <InvoiceClient trips={trips} userName={session.user.name || "User"} />
    </AppShell>
  );
}
