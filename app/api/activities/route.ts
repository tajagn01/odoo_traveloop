import { NextResponse } from "next/server";

import { mockActivities } from "@/lib/mock-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.toLowerCase() ?? "";
  const type = searchParams.get("type")?.toLowerCase() ?? "";
  const cost = Number(searchParams.get("cost") ?? "");
  const duration = Number(searchParams.get("duration") ?? "");

  const results = mockActivities.filter((activity) => {
    const matchesQuery =
      activity.activityName.toLowerCase().includes(query) ||
      activity.description.toLowerCase().includes(query);
    const matchesType = type ? activity.activityType.toLowerCase() === type : true;
    const matchesCost = Number.isFinite(cost) ? activity.cost <= cost : true;
    const matchesDuration = Number.isFinite(duration)
      ? activity.duration <= duration
      : true;
    return matchesQuery && matchesType && matchesCost && matchesDuration;
  });

  return NextResponse.json({ results });
}
