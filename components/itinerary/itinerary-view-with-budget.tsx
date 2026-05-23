"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { ItineraryView } from "@/components/itinerary/itinerary-view";
import type { StopCardData } from "@/components/itinerary/stop-card";
import type { ActivityCardData } from "@/components/itinerary/activity-card";

type TripExpense = {
	amount: number;
};

type TripStop = {
	id: string;
	cityName: string;
	country: string;
	arrivalDate: Date | string;
	departureDate: Date | string;
	stopOrder: number;
	activities: ActivityCardData[];
};

type TripWithBudget = {
	startDate: Date | string;
	endDate: Date | string;
	budgetLimit: number | null;
	stops: TripStop[];
	expenses: TripExpense[];
};

const toIsoDate = (value: Date | string) =>
	value instanceof Date ? value.toISOString() : value;

export function ItineraryViewWithBudget({ trip }: { trip: TripWithBudget }) {
	const stops: StopCardData[] = trip.stops.map((stop) => ({
		id: stop.id,
		cityName: stop.cityName,
		country: stop.country,
		arrivalDate: toIsoDate(stop.arrivalDate),
		departureDate: toIsoDate(stop.departureDate),
		stopOrder: stop.stopOrder,
		activities: stop.activities,
	}));

	const totalSpent = trip.expenses.reduce(
		(sum, expense) => sum + Number(expense.amount || 0),
		0
	);
	const budgetLimit = trip.budgetLimit ?? null;
	const remaining = budgetLimit === null ? null : budgetLimit - totalSpent;
	const usagePercent =
		budgetLimit && budgetLimit > 0 ? Math.min(100, (totalSpent / budgetLimit) * 100) : 0;

	return (
		<div className="space-y-6">
			<div className="grid gap-4 md:grid-cols-3">
				<Card className="border-border/70">
					<CardHeader>
						<CardTitle className="text-base font-semibold">Budget limit</CardTitle>
					</CardHeader>
					<CardContent className="text-2xl font-semibold">
						{budgetLimit === null ? "-" : formatCurrency(budgetLimit)}
					</CardContent>
				</Card>
				<Card className="border-border/70">
					<CardHeader>
						<CardTitle className="text-base font-semibold">Total spent</CardTitle>
					</CardHeader>
					<CardContent className="text-2xl font-semibold">
						{formatCurrency(totalSpent)}
					</CardContent>
				</Card>
				<Card className="border-border/70">
					<CardHeader>
						<CardTitle className="text-base font-semibold">Remaining</CardTitle>
					</CardHeader>
					<CardContent className="text-2xl font-semibold">
						{remaining === null ? "-" : formatCurrency(remaining)}
					</CardContent>
				</Card>
			</div>

			{budgetLimit !== null && (
				<Card className="border-border/70">
					<CardHeader>
						<CardTitle className="text-base font-semibold">Budget usage</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="h-2 w-full rounded-full bg-muted">
							<div
								className="h-2 rounded-full bg-primary"
								style={{ width: `${usagePercent}%` }}
							/>
						</div>
						<p className="mt-2 text-xs text-muted-foreground">
							{usagePercent.toFixed(0)}% of budget used
						</p>
					</CardContent>
				</Card>
			)}

			<ItineraryView
				stops={stops}
				startDate={toIsoDate(trip.startDate)}
				endDate={toIsoDate(trip.endDate)}
			/>
		</div>
	);
}
