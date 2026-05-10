"use server";

import { ExpenseCategory } from "@prisma/client";
import { z } from "zod";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";

const optionalBudgetLimit = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce.number().min(0).optional()
);

const budgetSchema = z.object({
  tripId: z.string(),
  transportCost: z.coerce.number().min(0),
  stayCost: z.coerce.number().min(0),
  mealCost: z.coerce.number().min(0),
  activityCost: z.coerce.number().min(0),
  budgetLimit: optionalBudgetLimit,
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

  const expenseInputs = [
    { category: ExpenseCategory.transport, amount: payload.data.transportCost },
    { category: ExpenseCategory.stay, amount: payload.data.stayCost },
    { category: ExpenseCategory.meals, amount: payload.data.mealCost },
    { category: ExpenseCategory.activities, amount: payload.data.activityCost },
  ];

  await prisma.$transaction([
    prisma.expense.deleteMany({
      where: { tripId: payload.data.tripId, category: { in: expenseInputs.map((e) => e.category) } },
    }),
    prisma.trip.update({
      where: { id: payload.data.tripId },
      data: { budgetLimit: payload.data.budgetLimit ?? null },
    }),
    prisma.expense.createMany({
      data: expenseInputs.map((expense) => ({
        tripId: payload.data.tripId,
        category: expense.category,
        amount: expense.amount,
        date: trip.startDate,
        note: "Budget planner",
      })),
    }),
  ]);

  revalidatePath(`/trips/${payload.data.tripId}/budget`);
  revalidatePath(`/trips/${payload.data.tripId}`);
  revalidatePath("/dashboard");
}

const addExpenseSchema = z.object({
  tripId: z.string(),
  category: z.enum(["transport", "stay", "meals", "activities"]),
  amount: z.coerce.number().min(0.01),
  date: z.string(),
  note: z.string().optional(),
});

export async function addExpenseAction(formData: FormData) {
  const session = await requireAuth();

  const payload = addExpenseSchema.safeParse({
    tripId: formData.get("tripId"),
    category: formData.get("category"),
    amount: formData.get("amount"),
    date: formData.get("date"),
    note: formData.get("note"),
  });

  if (!payload.success) {
    throw new Error("Invalid expense data.");
  }

  const trip = await prisma.trip.findFirst({
    where: { id: payload.data.tripId, userId: session.user.id },
  });

  if (!trip) {
    throw new Error("Trip not found.");
  }

  await prisma.expense.create({
    data: {
      tripId: payload.data.tripId,
      category: payload.data.category as ExpenseCategory,
      amount: payload.data.amount,
      date: new Date(payload.data.date),
      note: payload.data.note ?? null,
    },
  });

  revalidatePath(`/trips/${payload.data.tripId}/budget`);
  revalidatePath(`/trips/${payload.data.tripId}`);
  revalidatePath("/dashboard");
}

export async function deleteExpenseAction(formData: FormData) {
  const session = await requireAuth();
  const expenseId = formData.get("expenseId") as string;
  const tripId = formData.get("tripId") as string;

  if (!expenseId || !tripId) throw new Error("Missing data.");

  // Verify ownership
  const expense = await prisma.expense.findFirst({
    where: { id: expenseId, trip: { userId: session.user.id } },
  });

  if (!expense) throw new Error("Expense not found.");

  await prisma.expense.delete({ where: { id: expenseId } });

  revalidatePath(`/trips/${tripId}/budget`);
  revalidatePath(`/trips/${tripId}`);
  revalidatePath("/dashboard");
}
