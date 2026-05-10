"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Search, Filter, ArrowDownUp, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Trip = {
  id: string;
  tripName: string;
  description: string | null;
  startDate: Date;
  endDate: Date;
  budgetLimit: number | null;
  stops: {
    id: string;
    cityName: string;
    country: string;
  }[];
};

export function InvoiceClient({ trips, userName }: { trips: Trip[]; userName: string }) {
  const router = useRouter();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Expense Invoices</h1>
        <p className="text-muted-foreground">
          Select a trip to view and download its expense invoice
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search invoices..." 
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
        <Button variant="outline" className="gap-2">
          <ArrowDownUp className="h-4 w-4" />
          Sort by...
        </Button>
      </div>

      {trips.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No trips yet. Create your first trip to get started!</p>
          <Button asChild>
            <Link href="/trips/new">Create Trip</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {trips.length} {trips.length === 1 ? 'invoice' : 'invoices'} available
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trips.map((trip) => {
              const startDate = trip.startDate.toISOString().split('T')[0];
              const endDate = trip.endDate.toISOString().split('T')[0];

              return (
                <Card 
                  key={trip.id} 
                  className="border-border/70 hover:shadow-lg transition-all cursor-pointer hover:border-primary/50"
                  onClick={() => router.push(`/invoices/${trip.id}`)}
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-lg line-clamp-2">{trip.tripName}</h3>
                    </div>

                    {trip.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {trip.description}
                      </p>
                    )}

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CalendarDays className="h-4 w-4" />
                        <span>{startDate} to {endDate}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="line-clamp-1">
                          {trip.stops.map(s => s.cityName).join(" → ") || "No stops yet"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <Badge variant="secondary">{trip.stops.length} stops</Badge>
                      {trip.budgetLimit && (
                        <Badge variant="outline">Budget: ₹{trip.budgetLimit.toLocaleString()}</Badge>
                      )}
                    </div>

                    <Button className="w-full gap-2" size="sm">
                      View Invoice
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
