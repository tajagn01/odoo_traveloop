import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";

type BudgetHighlight = {
  id: string;
  tripName: string;
  totalCost: number;
  budgetLimit: number | null;
};
//hello this is the code

export function BudgetHighlights({ budgets }: { budgets: BudgetHighlight[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {budgets.map((budget) => {
        const limit = budget.budgetLimit ?? 0;
        const overBudget = limit > 0 && budget.totalCost > limit;
        return (
          <Card key={budget.id} className="border-border/70">
            <CardHeader className="space-y-2">
              <CardTitle className="text-base font-semibold">
                {budget.tripName}
              </CardTitle>
              <Badge className={overBudget ? "bg-red-100 text-red-700" : "bg-muted"}>
                {overBudget ? "Over budget" : "On track"}
              </Badge>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {formatCurrency(budget.totalCost)}
              {limit ? ` / ${formatCurrency(limit)}` : " total"}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
