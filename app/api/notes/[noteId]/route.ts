import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/api-auth";

const updateSchema = z.object({
  noteContent: z.string().min(1),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ noteId: string }> }
) {
  const { noteId } = await params;
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const note = await prisma.note.findUnique({
    where: { id: noteId },
    include: { trip: true },
  });

  if (!note || note.trip.userId !== userId) {
    return NextResponse.json({ message: "Note not found." }, { status: 404 });
  }

  const payload = updateSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json({ message: "Invalid update." }, { status: 400 });
  }

  const updated = await prisma.note.update({
    where: { id: noteId },
    data: { noteContent: payload.data.noteContent },
  });

  return NextResponse.json({ note: updated });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ noteId: string }> }
) {
  const { noteId } = await params;
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const note = await prisma.note.findUnique({
    where: { id: noteId },
    include: { trip: true },
  });

  if (!note || note.trip.userId !== userId) {
    return NextResponse.json({ message: "Note not found." }, { status: 404 });
  }

  await prisma.note.delete({ where: { id: noteId } });
  return NextResponse.json({ deleted: true });
}
