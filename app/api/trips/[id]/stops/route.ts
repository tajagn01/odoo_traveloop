import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/api-auth";

const stopSchema = z
  .object({
    cityId: z.string().min(1).optional(),
    cityName: z.string().min(1).optional(),
    country: z.string().min(1).optional(),
    arrivalDate: z.string(),
    departureDate: z.string(),
  })
  .refine((value) => value.cityId || (value.cityName && value.country), {
    message: "Select a city or provide destination details.",
  });

async function resolveCity(input: z.infer<typeof stopSchema>) {
  if (input.cityId) {
    const city = await prisma.city.findUnique({ where: { id: input.cityId } });
    if (!city) {
      throw new Error("City not found.");
    }
    return city;
  }

  return prisma.city.upsert({
    where: {
      name_country: {
        name: input.cityName!,
        country: input.country!,
      },
    },
    update: {},
    create: {
      name: input.cityName!,
      country: input.country!,
      region: "Custom",
      popularityScore: 50,
      costIndex: 50,
    },
  });
}

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

  const stops = await prisma.stop.findMany({
    where: { tripId: id },
    include: { activities: true, city: true },
    orderBy: { stopOrder: "asc" },
  });

  return NextResponse.json({ stops });
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

  const payload = stopSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json({ message: "Invalid stop details." }, { status: 400 });
  }

  const lastStop = await prisma.stop.findFirst({
    where: { tripId: id },
    orderBy: { stopOrder: "desc" },
  });

  try {
    const city = await resolveCity(payload.data);
    const stop = await prisma.stop.create({
      data: {
        tripId: id,
        cityId: city.id,
        cityName: city.name,
        country: city.country,
        arrivalDate: new Date(payload.data.arrivalDate),
        departureDate: new Date(payload.data.departureDate),
        stopOrder: lastStop ? lastStop.stopOrder + 1 : 1,
      },
      include: { city: true, activities: true },
    });

    return NextResponse.json({ stop }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to add stop.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
