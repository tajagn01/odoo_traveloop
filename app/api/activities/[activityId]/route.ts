import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/api-auth";

const updateSchema = z.object({
  activityName: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  activityType: z.string().min(1).optional(),
  duration: z.number().int().min(1).optional(),
  cost: z.number().min(0).optional(),
  imageUrl: z.string().optional().nullable(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ activityId: string }> }
) {
  const { activityId } = await params;
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: { stop: { include: { trip: true } } },
  });

  if (!activity || !activity.stop || activity.stop.trip.userId !== userId) {
    return NextResponse.json({ message: "Activity not found." }, { status: 404 });
  }

  const payload = updateSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json({ message: "Invalid update." }, { status: 400 });
  }

  const updated = await prisma.activity.update({
    where: { id: activityId },
    data: {
      activityName: payload.data.activityName,
      description: payload.data.description ?? undefined,
      activityType: payload.data.activityType,
      duration: payload.data.duration,
      cost: payload.data.cost,
      imageUrl: payload.data.imageUrl ?? undefined,
    },
  });

  return NextResponse.json({ activity: updated });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ activityId: string }> }
) {
  const { activityId } = await params;
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: { stop: { include: { trip: true } } },
  });

  if (!activity || !activity.stop || activity.stop.trip.userId !== userId) {
    return NextResponse.json({ message: "Activity not found." }, { status: 404 });
  }

  await prisma.activity.delete({ where: { id: activityId } });
  return NextResponse.json({ deleted: true });
}
