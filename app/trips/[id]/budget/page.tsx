import { AppShell } from "@/components/layout/app-shell";
import { BudgetCharts } from "@/components/budget/budget-charts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { daysBetween, formatCurrency } from "@/lib/format";
import { upsertBudgetAction } from "@/lib/actions/budget";

export default async function BudgetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireAuth();
  const trip = await prisma.trip.findFirst({
    where: { id, userId: session.user.id },
    include: { budget: true },
  });

  if (!trip) {
    return (
      <AppShell title="Budget" description="Trip not found.">
        <div />
      </AppShell>
    );
  }

  const budget = trip.budget ?? {
    transportCost: 0,
    stayCost: 0,
    mealCost: 0,
    activityCost: 0,
    totalCost: 0,
    budgetLimit: null,
  };

  const totalCost =
    budget.transportCost +
    budget.stayCost +
    budget.mealCost +
    budget.activityCost;
  const days = daysBetween(trip.startDate, trip.endDate);
  const averagePerDay = totalCost / days;
  const overBudget =
    budget.budgetLimit !== null && totalCost > Number(budget.budgetLimit);

  return (
    <AppShell
      title={`Budget for ${trip.tripName}`}
      description="Track costs and keep a close eye on totals."
    >
      <div className="space-y-8">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Budget inputs</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={upsertBudgetAction} className="grid gap-4 md:grid-cols-2">
              <input type="hidden" name="tripId" value={trip.id} />
              <div>
                <Label>Transport cost</Label>
                <Input
                  name="transportCost"
                  type="number"
                  step="0.01"
                  defaultValue={budget.transportCost}
                />
              </div>
              <div>
                <Label>Stay cost</Label>
                <Input
                  name="stayCost"
                  type="number"
                  step="0.01"
                  defaultValue={budget.stayCost}
                />
              </div>
              <div>
                <Label>Meal cost</Label>
                <Input
                  name="mealCost"
                  type="number"
                  step="0.01"
                  defaultValue={budget.mealCost}
                />
              </div>
              <div>
                <Label>Activity cost</Label>
                <Input
                  name="activityCost"
                  type="number"
                  step="0.01"
                  defaultValue={budget.activityCost}
                />
              </div>
              <div>
                <Label>Budget limit</Label>
                <Input
                  name="budgetLimit"
                  type="number"
                  step="0.01"
                  defaultValue={budget.budgetLimit ?? ""}
                  placeholder="Optional"
                />
              </div>
              <div className="flex items-end">
                <Button type="submit">Update budget</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Total cost</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">
              {formatCurrency(totalCost)}
            </CardContent>
          </Card>
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Avg per day</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">
              {formatCurrency(averagePerDay)}
            </CardContent>
          </Card>
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Status</CardTitle>
            </CardHeader>
            <CardContent className={overBudget ? "text-red-600" : "text-emerald-700"}>
              {overBudget ? "Over budget" : "On track"}
            </CardContent>
          </Card>
        </div>

        <BudgetCharts
          transportCost={budget.transportCost}
          stayCost={budget.stayCost}
          mealCost={budget.mealCost}
          activityCost={budget.activityCost}
        />
      </div>
    </AppShell>
  );
}
