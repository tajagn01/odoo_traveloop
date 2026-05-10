import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/api-auth";

const stopSchema = z.object({
  cityName: z.string().min(1),
  country: z.string().min(1),
  arrivalDate: z.string(),
  departureDate: z.string(),
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
  });

  if (!trip) {
    return NextResponse.json({ message: "Trip not found." }, { status: 404 });
  }

  const stops = await prisma.stop.findMany({
    where: { tripId: id },
    include: { activities: true },
    orderBy: { stopOrder: "asc" },
  });

  return NextResponse.json({ stops });
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

  const payload = stopSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json({ message: "Invalid stop details." }, { status: 400 });
  }

  const lastStop = await prisma.stop.findFirst({
    where: { tripId: id },
    orderBy: { stopOrder: "desc" },
  });

  const stop = await prisma.stop.create({
    data: {
      tripId: id,
      cityName: payload.data.cityName,
      country: payload.data.country,
      arrivalDate: new Date(payload.data.arrivalDate),
      departureDate: new Date(payload.data.departureDate),
      stopOrder: lastStop ? lastStop.stopOrder + 1 : 1,
    },
  });

  return NextResponse.json({ stop }, { status: 201 });
}
