import type { ExpenseCategory } from "@prisma/client";

export const expenseCategoryLabels: Record<ExpenseCategory, string> = {
  transport: "Transport",
  stay: "Stay",
  meals: "Meals",
  activities: "Activities",
};

export const expenseCategoryOrder: ExpenseCategory[] = [
  "transport",
  "stay",
  "meals",
  "activities",
];

type ExpenseLike = {
  category: ExpenseCategory;
  amount: number;
};

export function summarizeExpenses(expenses: ExpenseLike[]) {
  const summary = {
    transportCost: 0,
    stayCost: 0,
    mealCost: 0,
    activityCost: 0,
  };

  for (const expense of expenses) {
    if (expense.category === "transport") summary.transportCost += expense.amount;
    if (expense.category === "stay") summary.stayCost += expense.amount;
    if (expense.category === "meals") summary.mealCost += expense.amount;
    if (expense.category === "activities") summary.activityCost += expense.amount;
  }

  return {
    ...summary,
    totalCost:
      summary.transportCost +
      summary.stayCost +
      summary.mealCost +
      summary.activityCost,
  };
}
