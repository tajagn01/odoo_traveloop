import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/api-auth";

const noteSchema = z.object({
  noteContent: z.string().min(1),
  stopId: z.string().optional().nullable(),
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

  const notes = await prisma.note.findMany({
    where: { tripId: id },
    include: { stop: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ notes });
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

  const payload = noteSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json({ message: "Invalid note." }, { status: 400 });
  }

  const note = await prisma.note.create({
    data: {
      tripId: id,
      stopId: payload.data.stopId ?? null,
      noteContent: payload.data.noteContent,
    },
  });

  return NextResponse.json({ note }, { status: 201 });
}
