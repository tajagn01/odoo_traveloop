import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/api-auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ cityId: string }> }
) {
  const { cityId } = await params;
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const city = await prisma.city.findUnique({ where: { id: cityId } });
  if (!city) {
    return NextResponse.json({ message: "City not found." }, { status: 404 });
  }

  const saved = await prisma.savedDestination.upsert({
    where: {
      userId_cityId: {
        userId,
        cityId,
      },
    },
    update: {},
    create: {
      userId,
      cityId,
    },
    include: { city: true },
  });

  return NextResponse.json({ saved }, { status: 201 });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ cityId: string }> }
) {
  const { cityId } = await params;
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await prisma.savedDestination.deleteMany({
    where: { userId, cityId },
  });

  return NextResponse.json({ deleted: true });
}
