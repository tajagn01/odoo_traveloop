import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/api-auth";
import { revalidatePath } from "next/cache";

const updateSchema = z.object({
  tripName: z.string().min(2).optional(),
  description: z.string().optional().nullable(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  coverPhoto: z.string().optional().nullable(),
  isPublic: z.boolean().optional(),
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
    include: {
      stops: { include: { activities: true }, orderBy: { stopOrder: "asc" } },
      expenses: true,
      packingItems: true,
      notes: { include: { stop: true }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!trip) {
    return NextResponse.json({ message: "Trip not found." }, { status: 404 });
  }

  return NextResponse.json({ trip });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const payload = updateSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json({ message: "Invalid update." }, { status: 400 });
  }

  const trip = await prisma.trip.updateMany({
    where: { id, userId },
    data: {
      tripName: payload.data.tripName,
      description: payload.data.description ?? undefined,
      startDate: payload.data.startDate ? new Date(payload.data.startDate) : undefined,
      endDate: payload.data.endDate ? new Date(payload.data.endDate) : undefined,
      coverPhoto: payload.data.coverPhoto ?? undefined,
      isPublic: payload.data.isPublic,
    },
  });

  if (!trip.count) {
    return NextResponse.json({ message: "Trip not found." }, { status: 404 });
  }

  return NextResponse.json({ updated: true });
}

export async function DELETE(
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
    select: { id: true },
  });

  if (!trip) {
    return NextResponse.json({ message: "Trip not found." }, { status: 404 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.communityPost.deleteMany({
      where: { tripId: id },
    });

    await tx.trip.delete({
      where: { id },
    });
  });

  revalidatePath("/trips");
  revalidatePath("/dashboard");
  revalidatePath("/community");

  return NextResponse.json({ deleted: true });
}
