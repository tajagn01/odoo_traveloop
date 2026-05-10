import { AppShell } from "@/components/layout/app-shell";
import { PackingList } from "@/components/packing/packing-list";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function PackingChecklistPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const session = await requireAuth();
  const { tripId } = await params;

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      packingItems: {
        select: {
          id: true,
          itemName: true,
          category: true,
          isPacked: true,
        },
      },
    },
  });

  if (!trip) {
    redirect("/packing");
  }

  if (trip.userId !== session.user.id) {
    redirect("/packing");
  }

  const packingItems = trip.packingItems.map((item) => ({
    id: item.id,
    itemName: item.itemName,
    category: item.category.toLowerCase(),
    isPacked: item.isPacked,
  }));

  return (
    <AppShell
      title={`Packing: ${trip.tripName}`}
      description="Organize and track your packing items"
    >
      <PackingList tripId={tripId} initialItems={packingItems} />
    </AppShell>
  );
}
