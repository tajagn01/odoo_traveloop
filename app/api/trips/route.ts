import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";

import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/api-auth";

const tripSchema = z.object({
  tripName: z.string().min(2),
  description: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  coverPhoto: z.string().optional(),
});

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const trips = await prisma.trip.findMany({
    where: { userId },
    include: {
      stops: true,
      budget: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ trips });
}

export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const payload = tripSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json({ message: "Invalid trip details." }, { status: 400 });
  }

  const trip = await prisma.trip.create({
    data: {
      userId,
      tripName: payload.data.tripName,
      description: payload.data.description ?? null,
      startDate: new Date(payload.data.startDate),
      endDate: new Date(payload.data.endDate),
      coverPhoto: payload.data.coverPhoto ?? null,
      shareToken: crypto.randomUUID(),
    },
  });

  return NextResponse.json({ trip }, { status: 201 });
}
