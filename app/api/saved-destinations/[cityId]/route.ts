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

  let resolvedCityId = cityId;

  // Intercept dynamic temporary IDs generated during live Wikipedia internet searches
  if (cityId.startsWith("temp__")) {
    const parts = cityId.split("__");
    const cityName = decodeURIComponent(parts[1]);
    const countryName = decodeURIComponent(parts[2] || "Global");

    const resolvedCity = await prisma.city.upsert({
      where: {
        name_country: {
          name: cityName,
          country: countryName,
        },
      },
      update: {},
      create: {
        name: cityName,
        country: countryName,
        region: "Custom",
        popularityScore: 50,
        costIndex: 50,
      },
    });
    resolvedCityId = resolvedCity.id;
  } else {
    const city = await prisma.city.findUnique({ where: { id: cityId } });
    if (!city) {
      return NextResponse.json({ message: "City not found." }, { status: 404 });
    }
  }

  const saved = await prisma.savedDestination.upsert({
    where: {
      userId_cityId: {
        userId,
        cityId: resolvedCityId,
      },
    },
    update: {},
    create: {
      userId,
      cityId: resolvedCityId,
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

  let resolvedCityId = cityId;

  // Intercept dynamic temporary IDs generated during live Wikipedia internet searches
  if (cityId.startsWith("temp__")) {
    const parts = cityId.split("__");
    const cityName = decodeURIComponent(parts[1]);
    const countryName = decodeURIComponent(parts[2] || "Global");

    const city = await prisma.city.findFirst({
      where: {
        name: { equals: cityName, mode: "insensitive" },
        country: { equals: countryName, mode: "insensitive" },
      },
    });
    if (city) {
      resolvedCityId = city.id;
    }
  }

  await prisma.savedDestination.deleteMany({
    where: { userId, cityId: resolvedCityId },
  });

  return NextResponse.json({ deleted: true });
}
