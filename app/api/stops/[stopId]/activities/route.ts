import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/api-auth";

const activitySchema = z.object({
  activityName: z.string().min(1),
  description: z.string().optional(),
  activityType: z.string().min(1),
  duration: z.number().int().min(1),
  cost: z.number().min(0),
  imageUrl: z.string().optional(),
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

  const stop = await prisma.stop.findUnique({
    where: { id: stopId },
    include: { trip: true },
  });

  if (!stop || stop.trip.userId !== userId) {
    return NextResponse.json({ message: "Stop not found." }, { status: 404 });
  }

  const payload = activitySchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json({ message: "Invalid activity details." }, { status: 400 });
  }

  const activity = await prisma.activity.create({
    data: {
      stopId,
      activityName: payload.data.activityName,
      description: payload.data.description ?? null,
      activityType: payload.data.activityType,
      duration: payload.data.duration,
      cost: payload.data.cost,
      imageUrl: payload.data.imageUrl ?? null,
    },
  });

  return NextResponse.json({ activity }, { status: 201 });
}
