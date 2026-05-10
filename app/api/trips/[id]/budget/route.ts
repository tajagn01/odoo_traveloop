import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/api-auth";

const budgetSchema = z.object({
  transportCost: z.number().min(0),
  stayCost: z.number().min(0),
  mealCost: z.number().min(0),
  activityCost: z.number().min(0),
  budgetLimit: z.number().min(0).optional().nullable(),
});

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
    include: { budget: true },
  });

  if (!trip) {
    return NextResponse.json({ message: "Trip not found." }, { status: 404 });
  }

  return NextResponse.json({ budget: trip.budget });
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

  const payload = budgetSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json({ message: "Invalid budget details." }, { status: 400 });
  }

  const totalCost =
    payload.data.transportCost +
    payload.data.stayCost +
    payload.data.mealCost +
    payload.data.activityCost;

  const budget = await prisma.budget.upsert({
    where: { tripId: id },
    update: {
      transportCost: payload.data.transportCost,
      stayCost: payload.data.stayCost,
      mealCost: payload.data.mealCost,
      activityCost: payload.data.activityCost,
      totalCost,
      budgetLimit: payload.data.budgetLimit ?? null,
    },
    create: {
      tripId: id,
      transportCost: payload.data.transportCost,
      stayCost: payload.data.stayCost,
      mealCost: payload.data.mealCost,
      activityCost: payload.data.activityCost,
      totalCost,
      budgetLimit: payload.data.budgetLimit ?? null,
    },
  });

  return NextResponse.json({ budget });
}
