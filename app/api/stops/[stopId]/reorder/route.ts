import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/api-auth";

const reorderSchema = z.object({
  direction: z.enum(["up", "down"]),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ stopId: string }> }
) {
  const { stopId } = await params;
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const payload = reorderSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json({ message: "Invalid reorder request." }, { status: 400 });
  }

  const stop = await prisma.stop.findUnique({
    where: { id: stopId },
    include: { trip: true },
  });

  if (!stop || stop.trip.userId !== userId) {
    return NextResponse.json({ message: "Stop not found." }, { status: 404 });
  }

  const neighbor = await prisma.stop.findFirst({
    where: {
      tripId: stop.tripId,
      stopOrder:
        payload.data.direction === "up"
          ? { lt: stop.stopOrder }
          : { gt: stop.stopOrder },
    },
    orderBy: { stopOrder: payload.data.direction === "up" ? "desc" : "asc" },
  });

  if (!neighbor) {
    return NextResponse.json({ updated: false });
  }

  await prisma.$transaction([
    prisma.stop.update({
      where: { id: stop.id },
      data: { stopOrder: neighbor.stopOrder },
    }),
    prisma.stop.update({
      where: { id: neighbor.id },
      data: { stopOrder: stop.stopOrder },
    }),
  ]);

  return NextResponse.json({ updated: true });
}
