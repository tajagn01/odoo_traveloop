import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const trip = await prisma.trip.findFirst({
    where: { shareToken: token, isPublic: true },
    include: {
      stops: { include: { activities: true }, orderBy: { stopOrder: "asc" } },
      expenses: true,
    },
  });

  if (!trip) {
    return NextResponse.json({ message: "Shared trip not found." }, { status: 404 });
  }

  return NextResponse.json({ trip });
}
