import { NextResponse } from "next/server";

import { mockCities } from "@/lib/mock-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.toLowerCase() ?? "";
  const region = searchParams.get("region")?.toLowerCase() ?? "";
  const country = searchParams.get("country")?.toLowerCase() ?? "";

  const results = mockCities.filter((city) => {
    const matchesQuery =
      city.cityName.toLowerCase().includes(query) ||
      city.country.toLowerCase().includes(query);
    const matchesRegion = region ? city.region.toLowerCase() === region : true;
    const matchesCountry = country ? city.country.toLowerCase() === country : true;
    return matchesQuery && matchesRegion && matchesCountry;
  });

  return NextResponse.json({ results });
}
