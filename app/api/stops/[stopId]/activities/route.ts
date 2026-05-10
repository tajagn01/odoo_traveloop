import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/api-auth";

const activitySchema = z.union([
  z.object({
    activityId: z.string().min(1),
  }),
  z.object({
    activityName: z.string().min(1),
    description: z.string().optional(),
    activityType: z.string().min(1),
    duration: z.number().int().min(1),
    cost: z.number().min(0),
    imageUrl: z.string().optional().nullable(),
    cityId: z.string().optional(),
  }),
]);

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

  const activity =
    "activityId" in payload.data
      ? await prisma.activity.findFirst({
          where: { id: payload.data.activityId, stopId: null },
        })
      : null;
  const manualActivity = "activityId" in payload.data ? null : payload.data;

  if ("activityId" in payload.data && !activity) {
    return NextResponse.json({ message: "Activity not found." }, { status: 404 });
  }

  const created = await prisma.activity.create({
    data: {
      cityId: activity?.cityId ?? manualActivity?.cityId ?? stop.cityId,
      stopId,
      activityName: activity?.activityName ?? manualActivity?.activityName ?? stop.cityName,
      description: activity?.description ?? manualActivity?.description ?? null,
      activityType: activity?.activityType ?? manualActivity?.activityType ?? "Sightseeing",
      duration: activity?.duration ?? manualActivity?.duration ?? 1,
      cost: activity?.cost ?? manualActivity?.cost ?? 0,
      imageUrl: activity?.imageUrl ?? manualActivity?.imageUrl ?? null,
    },
  });

  return NextResponse.json({ activity: created }, { status: 201 });
}
