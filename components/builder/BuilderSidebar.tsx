"use client";

import { useBuilderStore } from "@/lib/stores/useBuilderStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Wallet, Map, Calendar, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { differenceInDays } from "date-fns";

export function BuilderSidebar() {
  const { stops, budgetLimit, warnings, tripName } = useBuilderStore();

  const totalStops = stops.length;
  
  let totalDays = 0;
  if (stops.length > 0) {
    const firstArrival = new Date(stops[0].arrivalDate);
    const lastDeparture = new Date(stops[stops.length - 1].departureDate);
    if (!isNaN(firstArrival.getTime()) && !isNaN(lastDeparture.getTime())) {
      totalDays = differenceInDays(lastDeparture, firstArrival);
    }
  }

  const totalStayCost = stops.reduce((sum, stop) => sum + (stop.stayCost || 0), 0);
  const totalTransportCost = stops.reduce((sum, stop) => sum + (stop.transportCost || 0), 0);
  const totalActivityCost = stops.reduce(
    (sum, stop) => sum + stop.activities.reduce((a, act) => a + (act.cost || 0), 0),
    0
  );

  const totalCost = totalStayCost + totalTransportCost + totalActivityCost;
  const progress = budgetLimit ? Math.min((totalCost / budgetLimit) * 100, 100) : 0;
  const isOverBudget = budgetLimit && totalCost > budgetLimit;

  return (
    <div className="space-y-6 sticky top-6">
      <Card className="border-border/70 shadow-sm">
        <CardHeader className="pb-4 border-b border-border">
          <CardTitle className="text-lg">Trip Summary</CardTitle>
          <p className="text-sm text-muted-foreground">{tripName}</p>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Map className="h-4 w-4" /> Stops
            </span>
            <span className="font-semibold">{totalStops}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" /> Duration
            </span>
            <span className="font-semibold">{totalDays} days</span>
          </div>

          <div className="pt-4 border-t border-border">
            <div className="flex justify-between items-end mb-2">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Wallet className="h-4 w-4" /> Est. Cost
              </span>
              <span className={`text-xl font-bold ${isOverBudget ? "text-red-500" : ""}`}>
                {formatCurrency(totalCost)}
              </span>
            </div>
            {budgetLimit && (
              <div className="space-y-1.5">
                <Progress value={progress} className={`h-2 ${isOverBudget ? "bg-red-200" : ""}`} />
                <p className="text-xs text-right text-muted-foreground">
                  Limit: {formatCurrency(budgetLimit)}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Stay</span>
              <span>{formatCurrency(totalStayCost)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Transport</span>
              <span>{formatCurrency(totalTransportCost)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Activities</span>
              <span>{formatCurrency(totalActivityCost)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {warnings.length > 0 && (
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2 text-red-600 font-semibold text-sm">
              <AlertTriangle className="h-4 w-4" />
              Planning Warnings
            </div>
            <ul className="list-disc pl-4 text-xs text-red-600 space-y-1">
              {warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        <Button className="w-full">Publish Itinerary</Button>
        <Button variant="outline" className="w-full">Export PDF</Button>
      </div>
    </div>
  );
}
