import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.trim() ?? "";
  const type = searchParams.get("type")?.trim() ?? "";
  const cityId = searchParams.get("cityId")?.trim() ?? "";
  const cost = Number(searchParams.get("cost") ?? "");
  const duration = Number(searchParams.get("duration") ?? "");

  const results = await prisma.activity.findMany({
    where: {
      stopId: null,
      AND: [
        query
          ? {
              OR: [
                { activityName: { contains: query, mode: "insensitive" } },
                { description: { contains: query, mode: "insensitive" } },
              ],
            }
          : {},
        type ? { activityType: { equals: type, mode: "insensitive" } } : {},
        cityId ? { cityId } : {},
        Number.isFinite(cost) ? { cost: { lte: cost } } : {},
        Number.isFinite(duration) ? { duration: { lte: duration } } : {},
      ],
    },
    include: { city: true },
    orderBy: [{ activityType: "asc" }, { activityName: "asc" }],
    take: 24,
  });

  return NextResponse.json({
    results: results.map((activity) => ({
      id: activity.id,
      activityName: activity.activityName,
      description: activity.description ?? "",
      activityType: activity.activityType,
      duration: activity.duration,
      cost: activity.cost,
      imageUrl: activity.imageUrl,
      cityName: activity.city.name,
      country: activity.city.country,
      cityId: activity.cityId,
    })),
  });
}
