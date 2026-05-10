import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const shared = await prisma.sharedTrip.findUnique({
    where: { shareToken: token },
    include: {
      trip: {
        include: {
          stops: { include: { activities: true }, orderBy: { stopOrder: "asc" } },
          budget: true,
        },
      },
    },
  });

  if (!shared) {
    return NextResponse.json({ message: "Shared trip not found." }, { status: 404 });
  }

  return NextResponse.json({ shared });
}
