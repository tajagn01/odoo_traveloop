import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/api-auth";

const packingSchema = z.object({
  itemName: z.string().min(1),
  category: z.string().min(1),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const trip = await prisma.trip.findFirst({
    where: { id, userId },
    include: { packingItems: true },
  });

  if (!trip) {
    return NextResponse.json({ message: "Trip not found." }, { status: 404 });
  }

  return NextResponse.json({ items: trip.packingItems });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const trip = await prisma.trip.findFirst({
    where: { id, userId },
  });

  if (!trip) {
    return NextResponse.json({ message: "Trip not found." }, { status: 404 });
  }

  const payload = packingSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json({ message: "Invalid packing item." }, { status: 400 });
  }

  const item = await prisma.packingItem.create({
    data: {
      tripId: id,
      itemName: payload.data.itemName,
      category: payload.data.category,
    },
  });

  return NextResponse.json({ item }, { status: 201 });
}
