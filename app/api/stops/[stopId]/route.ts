import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/api-auth";

const updateSchema = z.object({
  cityName: z.string().min(1).optional(),
  country: z.string().min(1).optional(),
  arrivalDate: z.string().optional(),
  departureDate: z.string().optional(),
  stopOrder: z.number().int().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ stopId: string }> }
) {
  const { stopId } = await params;
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const stop = await prisma.stop.findUnique({
    where: { id: stopId },
    include: { trip: true },
  });

  if (!stop || stop.trip.userId !== userId) {
    return NextResponse.json({ message: "Stop not found." }, { status: 404 });
  }

  const payload = updateSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json({ message: "Invalid update." }, { status: 400 });
  }

  const updated = await prisma.stop.update({
    where: { id: stopId },
    data: {
      cityName: payload.data.cityName,
      country: payload.data.country,
      arrivalDate: payload.data.arrivalDate
        ? new Date(payload.data.arrivalDate)
        : undefined,
      departureDate: payload.data.departureDate
        ? new Date(payload.data.departureDate)
        : undefined,
      stopOrder: payload.data.stopOrder,
    },
  });

  return NextResponse.json({ stop: updated });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ stopId: string }> }
) {
  const { stopId } = await params;
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const stop = await prisma.stop.findUnique({
    where: { id: stopId },
    include: { trip: true },
  });

  if (!stop || stop.trip.userId !== userId) {
    return NextResponse.json({ message: "Stop not found." }, { status: 404 });
  }

  await prisma.stop.delete({ where: { id: stopId } });
  return NextResponse.json({ deleted: true });
}
