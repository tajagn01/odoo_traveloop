import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/api-auth";

const updateSchema = z.object({
  cityId: z.string().min(1).optional(),
  cityName: z.string().min(1).optional(),
  country: z.string().min(1).optional(),
  arrivalDate: z.string().optional(),
  departureDate: z.string().optional(),
  stopOrder: z.number().int().optional(),
});

async function resolveCity(cityId?: string, cityName?: string, country?: string) {
  if (cityId) {
    const city = await prisma.city.findUnique({ where: { id: cityId } });
    if (!city) {
      throw new Error("City not found.");
    }
    return city;
  }

  if (!cityName || !country) {
    return null;
  }

  return prisma.city.upsert({
    where: {
      name_country: {
        name: cityName,
        country,
      },
    },
    update: {},
    create: {
      name: cityName,
      country,
      region: "Custom",
      popularityScore: 50,
      costIndex: 50,
    },
  });
}

export async function PATCH(
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

  const payload = updateSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json({ message: "Invalid update." }, { status: 400 });
  }

  try {
    const city = await resolveCity(
      payload.data.cityId,
      payload.data.cityName,
      payload.data.country
    );

    const updated = await prisma.stop.update({
      where: { id: stopId },
      data: {
        cityId: city?.id,
        cityName: city?.name ?? payload.data.cityName,
        country: city?.country ?? payload.data.country,
        arrivalDate: payload.data.arrivalDate
          ? new Date(payload.data.arrivalDate)
          : undefined,
        departureDate: payload.data.departureDate
          ? new Date(payload.data.departureDate)
          : undefined,
        stopOrder: payload.data.stopOrder,
      },
      include: { city: true, activities: true },
    });

    return NextResponse.json({ stop: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update stop.";
    return NextResponse.json({ message }, { status: 400 });
  }
}

export async function DELETE(
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

  await prisma.stop.delete({ where: { id: stopId } });
  return NextResponse.json({ deleted: true });
}
