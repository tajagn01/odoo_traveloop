import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const trip = await prisma.trip.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        stops: {
          orderBy: { stopOrder: "asc" },
          include: {
            activities: {
              orderBy: [
                { scheduledDay: "asc" },
                { scheduledTime: "asc" },
                { createdAt: "asc" },
              ],
            },
          },
        },
        transportSegments: {
          orderBy: { departureTime: "asc" },
        },
      },
    });

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    return NextResponse.json(trip);
  } catch (error) {
    console.error("Error fetching builder trip:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
