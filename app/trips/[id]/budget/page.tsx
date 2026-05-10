import { AppShell } from "@/components/layout/app-shell";
import { BudgetCharts } from "@/components/budget/budget-charts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { daysBetween, formatCurrency } from "@/lib/format";
import { upsertBudgetAction, addExpenseAction, deleteExpenseAction } from "@/lib/actions/budget";
import { summarizeExpenses, expenseCategoryLabels } from "@/lib/expenses";
import type { ExpenseCategory } from "@prisma/client";

const categoryBadgeColor: Record<ExpenseCategory, string> = {
  transport: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  stay: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  meals: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  activities: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};

export default async function BudgetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireAuth();
  const trip = await prisma.trip.findFirst({
    where: { id, userId: session.user.id },
    include: {
      expenses: { orderBy: { date: "desc" } },
    },
  });

  if (!trip) {
    return (
      <AppShell title="Budget" description="Trip not found.">
        <div />
      </AppShell>
    );
  }

  const budget = summarizeExpenses(
    trip.expenses.map((e) => ({ category: e.category, amount: Number(e.amount) }))
  );
  const totalCost = budget.totalCost;
  const days = daysBetween(trip.startDate, trip.endDate);
  const averagePerDay = days > 0 ? totalCost / days : 0;
  const overBudget =
    trip.budgetLimit !== null && totalCost > Number(trip.budgetLimit);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <AppShell
      title={`Budget for ${trip.tripName}`}
      description="Track costs and keep a close eye on totals."
    >
      <div className="space-y-8">

        {/* ── Summary Cards ── */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Total Cost</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">
              {formatCurrency(totalCost)}
            </CardContent>
          </Card>
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Avg per Day</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">
              {formatCurrency(averagePerDay)}
            </CardContent>
          </Card>
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Status</CardTitle>
            </CardHeader>
            <CardContent className={overBudget ? "text-red-600 font-semibold" : "text-emerald-700 font-semibold"}>
              {overBudget ? "Over budget" : "On track"}
              {trip.budgetLimit && (
                <p className="text-xs text-muted-foreground mt-1">
                  Limit: {formatCurrency(Number(trip.budgetLimit))}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Budget Limit & Aggregate Inputs ── */}
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Budget Overview / Limit</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={upsertBudgetAction} className="grid gap-4 md:grid-cols-2">
              <input type="hidden" name="tripId" value={trip.id} />
              <div>
                <Label>Transport Cost</Label>
                <Input
                  name="transportCost"
                  type="number"
                  step="0.01"
                  defaultValue={budget.transportCost}
                />
              </div>
              <div>
                <Label>Stay Cost</Label>
                <Input
                  name="stayCost"
                  type="number"
                  step="0.01"
                  defaultValue={budget.stayCost}
                />
              </div>
              <div>
                <Label>Meal Cost</Label>
                <Input
                  name="mealCost"
                  type="number"
                  step="0.01"
                  defaultValue={budget.mealCost}
                />
              </div>
              <div>
                <Label>Activity Cost</Label>
                <Input
                  name="activityCost"
                  type="number"
                  step="0.01"
                  defaultValue={budget.activityCost}
                />
              </div>
              <div>
                <Label>Budget Limit</Label>
                <Input
                  name="budgetLimit"
                  type="number"
                  step="0.01"
                  defaultValue={trip.budgetLimit ?? ""}
                  placeholder="Optional"
                />
              </div>
              <div className="flex items-end">
                <Button type="submit">Update Budget</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* ── Charts ── */}
        <BudgetCharts
          transportCost={budget.transportCost}
          stayCost={budget.stayCost}
          mealCost={budget.mealCost}
          activityCost={budget.activityCost}
        />

        {/* ── Add Expense ── */}
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Add Expense</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={addExpenseAction} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <input type="hidden" name="tripId" value={trip.id} />
              <div className="space-y-1.5">
                <Label htmlFor="expDate">Date</Label>
                <Input id="expDate" name="date" type="date" defaultValue={today} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="expCategory">Category</Label>
                <select
                  id="expCategory"
                  name="category"
                  required
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="transport">Transport</option>
                  <option value="stay">Stay</option>
                  <option value="meals">Meals</option>
                  <option value="activities">Activities</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="expAmount">Amount ($)</Label>
                <Input id="expAmount" name="amount" type="number" step="0.01" min="0.01" placeholder="0.00" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="expNote">Note</Label>
                <Input id="expNote" name="note" placeholder="e.g. Taxi to airport" />
              </div>
              <div className="sm:col-span-2 lg:col-span-4">
                <Button type="submit">Add Expense</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* ── Expense Table ── */}
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Expense History ({trip.expenses.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trip.expenses.length === 0 ? (
              <p className="text-sm text-muted-foreground">No expenses logged yet. Add one above.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs text-muted-foreground">
                      <th className="pb-2 pr-4 font-semibold">Date</th>
                      <th className="pb-2 pr-4 font-semibold">Category</th>
                      <th className="pb-2 pr-4 font-semibold">Amount</th>
                      <th className="pb-2 pr-4 font-semibold">Note</th>
                      <th className="pb-2 font-semibold" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {trip.expenses.map((expense) => (
                      <tr key={expense.id} className="text-foreground">
                        <td className="py-2.5 pr-4 text-muted-foreground">
                          {expense.date.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-2.5 pr-4">
                          <Badge
                            className={`text-xs ${categoryBadgeColor[expense.category as ExpenseCategory]}`}
                          >
                            {expenseCategoryLabels[expense.category as ExpenseCategory]}
                          </Badge>
                        </td>
                        <td className="py-2.5 pr-4 font-semibold">
                          {formatCurrency(Number(expense.amount))}
                        </td>
                        <td className="py-2.5 pr-4 text-muted-foreground">
                          {expense.note ?? "—"}
                        </td>
                        <td className="py-2.5">
                          <form action={deleteExpenseAction}>
                            <input type="hidden" name="expenseId" value={expense.id} />
                            <input type="hidden" name="tripId" value={trip.id} />
                            <button
                              type="submit"
                              className="text-xs text-muted-foreground hover:text-red-500 transition"
                            >
                              Remove
                            </button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
