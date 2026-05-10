"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";

const budgetSchema = z.object({
  tripId: z.string(),
  transportCost: z.coerce.number().min(0),
  stayCost: z.coerce.number().min(0),
  mealCost: z.coerce.number().min(0),
  activityCost: z.coerce.number().min(0),
  budgetLimit: z.coerce.number().min(0).optional().nullable(),
});

export async function upsertBudgetAction(formData: FormData) {
  const session = await requireAuth();

  const payload = budgetSchema.safeParse({
    tripId: formData.get("tripId"),
    transportCost: formData.get("transportCost"),
    stayCost: formData.get("stayCost"),
    mealCost: formData.get("mealCost"),
    activityCost: formData.get("activityCost"),
    budgetLimit: formData.get("budgetLimit"),
  });

  if (!payload.success) {
    throw new Error("Invalid budget data.");
  }

  const trip = await prisma.trip.findFirst({
    where: { id: payload.data.tripId, userId: session.user.id },
  });

  if (!trip) {
    throw new Error("Trip not found.");
  }

  const totalCost =
    payload.data.transportCost +
    payload.data.stayCost +
    payload.data.mealCost +
    payload.data.activityCost;

  await prisma.budget.upsert({
    where: { tripId: payload.data.tripId },
    update: {
      transportCost: payload.data.transportCost,
      stayCost: payload.data.stayCost,
      mealCost: payload.data.mealCost,
      activityCost: payload.data.activityCost,
      totalCost,
      budgetLimit: payload.data.budgetLimit ?? null,
    },
    create: {
      tripId: payload.data.tripId,
      transportCost: payload.data.transportCost,
      stayCost: payload.data.stayCost,
      mealCost: payload.data.mealCost,
      activityCost: payload.data.activityCost,
      totalCost,
      budgetLimit: payload.data.budgetLimit ?? null,
    },
  });

  revalidatePath(`/trips/${payload.data.tripId}/budget`);
}
