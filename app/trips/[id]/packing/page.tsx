import { AppShell } from "@/components/layout/app-shell";
import { PackingList } from "@/components/packing/packing-list";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

export default async function PackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireAuth();
  const trip = await prisma.trip.findFirst({
    where: { id, userId: session.user.id },
    include: { packingItems: true },
  });

  if (!trip) {
    return (
      <AppShell title="Packing" description="Trip not found.">
        <div />
      </AppShell>
    );
  }

  const items = trip.packingItems.map((item: { id: string; itemName: string; category: string; isPacked: boolean }) => ({
    id: item.id,
    itemName: item.itemName,
    category: item.category,
    isPacked: item.isPacked,
  }));

  return (
    <AppShell
      title={`Packing list: ${trip.tripName}`}
      description="Track everything you need across categories."
    >
      <PackingList tripId={trip.id} initialItems={items} />
    </AppShell>
  );
}
