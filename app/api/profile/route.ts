import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/api-auth";

const profileSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  profilePhoto: z.string().optional().nullable(),
  languagePreference: z.string().optional().nullable(),
});

export async function PATCH(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const payload = profileSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json({ message: "Invalid profile update." }, { status: 400 });
  }

  if (payload.data.email) {
    const existing = await prisma.user.findUnique({
      where: { email: payload.data.email.toLowerCase() },
    });
    if (existing && existing.id !== userId) {
      return NextResponse.json(
        { message: "Email is already in use." },
        { status: 409 }
      );
    }
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      name: payload.data.name,
      email: payload.data.email?.toLowerCase(),
      profilePhoto: payload.data.profilePhoto ?? undefined,
      languagePreference: payload.data.languagePreference ?? undefined,
    },
  });

  return NextResponse.json({ user });
}

export async function DELETE() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await prisma.user.delete({ where: { id: userId } });
  return NextResponse.json({ deleted: true });
}
