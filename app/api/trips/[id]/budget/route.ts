import { ExpenseCategory } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/api-auth";
import { summarizeExpenses } from "@/lib/expenses";

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
    include: { expenses: true },
  });

  if (!trip) {
    return NextResponse.json({ message: "Trip not found." }, { status: 404 });
  }

  return NextResponse.json({
    budget: {
      ...summarizeExpenses(trip.expenses),
      budgetLimit: trip.budgetLimit,
    },
  });
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

  const expenseInputs = [
    { category: ExpenseCategory.transport, amount: payload.data.transportCost },
    { category: ExpenseCategory.stay, amount: payload.data.stayCost },
    { category: ExpenseCategory.meals, amount: payload.data.mealCost },
    { category: ExpenseCategory.activities, amount: payload.data.activityCost },
  ];

  await prisma.$transaction([
    prisma.expense.deleteMany({
      where: { tripId: id, category: { in: expenseInputs.map((expense) => expense.category) } },
    }),
    prisma.trip.update({
      where: { id },
      data: { budgetLimit: payload.data.budgetLimit ?? null },
    }),
    prisma.expense.createMany({
      data: expenseInputs.map((expense) => ({
        tripId: id,
        category: expense.category,
        amount: expense.amount,
        date: trip.startDate,
        note: "Budget planner",
      })),
    }),
  ]);

  return NextResponse.json({
    budget: {
      ...summarizeExpenses(
        expenseInputs.map((expense) => ({
          category: expense.category,
          amount: expense.amount,
        }))
      ),
      budgetLimit: payload.data.budgetLimit ?? null,
    },
  });
}
