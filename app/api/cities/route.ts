import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.trim() ?? "";
  const region = searchParams.get("region")?.trim() ?? "";
  const country = searchParams.get("country")?.trim() ?? "";

  const results = await prisma.city.findMany({
    where: {
      AND: [
        query
          ? {
              OR: [
                { name: { contains: query, mode: "insensitive" } },
                { country: { contains: query, mode: "insensitive" } },
              ],
            }
          : {},
        region ? { region: { equals: region, mode: "insensitive" } } : {},
        country ? { country: { equals: country, mode: "insensitive" } } : {},
      ],
    },
    orderBy: [{ popularityScore: "desc" }, { name: "asc" }],
    take: 20,
  });

  return NextResponse.json({
    results: results.map((city) => ({
      id: city.id,
      cityName: city.name,
      country: city.country,
      region: city.region,
      costIndex: city.costIndex,
      popularity: city.popularityScore,
    })),
  });
}
