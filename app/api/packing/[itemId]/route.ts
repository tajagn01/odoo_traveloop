import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/api-auth";

const updateSchema = z.object({
  itemName: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  isPacked: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const { itemId } = await params;
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const item = await prisma.packingItem.findUnique({
    where: { id: itemId },
    include: { trip: true },
  });

  if (!item || item.trip.userId !== userId) {
    return NextResponse.json({ message: "Item not found." }, { status: 404 });
  }

  const payload = updateSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json({ message: "Invalid update." }, { status: 400 });
  }

  const updated = await prisma.packingItem.update({
    where: { id: itemId },
    data: {
      itemName: payload.data.itemName,
      category: payload.data.category,
      isPacked: payload.data.isPacked,
    },
  });

  return NextResponse.json({ item: updated });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const { itemId } = await params;
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const item = await prisma.packingItem.findUnique({
    where: { id: itemId },
    include: { trip: true },
  });

  if (!item || item.trip.userId !== userId) {
    return NextResponse.json({ message: "Item not found." }, { status: 404 });
  }

  await prisma.packingItem.delete({ where: { id: itemId } });
  return NextResponse.json({ deleted: true });
}
