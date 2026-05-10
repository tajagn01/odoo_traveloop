"use client";

import { useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";
import { Download, Printer, Mail } from "lucide-react";
import Link from "next/link";
import { useReactToPrint } from "react-to-print";
import { toast } from "sonner";

type Activity = {
  id: string;
  activityName: string;
  description: string | null;
  activityType: string;
  cost: number;
};

type Stop = {
  id: string;
  cityName: string;
  country: string;
  arrivalDate: Date;
  departureDate: Date;
  hotelName: string | null;
  hotelCost: number | null;
  activities: Activity[];
};

type Expense = {
  id: string;
  category: string;
  description: string | null;
  amount: number;
  date: Date;
};

type Trip = {
  id: string;
  tripName: string;
  description: string | null;
  startDate: Date;
  endDate: Date;
  budgetLimit: number | null;
  stops: Stop[];
  expenses: Expense[];
};

export function InvoiceView({
  trip,
  userName,
  userEmail,
}: {
  trip: Trip;
  userName: string;
  userEmail: string;
}) {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: invoiceRef,
  });

  const handleDownload = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  // Calculate expenses
  const expenseItems: Array<{
    category: string;
    description: string;
    qty: string | number;
    unitCost: number;
    amount: number;
  }> = [];

  // Add hotel expenses
  trip.stops.forEach((stop) => {
    if (stop.hotelCost && stop.hotelCost > 0) {
      const nights = Math.ceil(
        (new Date(stop.departureDate).getTime() - new Date(stop.arrivalDate).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      expenseItems.push({
        category: "hotel",
        description: `Hotel booking ${stop.cityName}`,
        qty: `${nights} nights`,
        unitCost: stop.hotelCost / nights,
        amount: stop.hotelCost,
      });
    }
  });

  // Add activity expenses
  trip.stops.forEach((stop) => {
    stop.activities.forEach((activity) => {
      if (activity.cost > 0) {
        expenseItems.push({
          category: activity.activityType || "activity",
          description: activity.activityName,
          qty: 1,
          unitCost: activity.cost,
          amount: activity.cost,
        });
      }
    });
  });

  // Add other expenses
  trip.expenses.forEach((expense) => {
    expenseItems.push({
      category: expense.category,
      description: expense.description || expense.category,
      qty: 1,
      unitCost: expense.amount,
      amount: expense.amount,
    });
  });

  const subtotal = expenseItems.reduce((sum, item) => sum + item.amount, 0);
  const taxRate = 0.05; // 5% tax
  const tax = subtotal * taxRate;
  const discount = 50; // Fixed discount
  const grandTotal = subtotal + tax - discount;

  const invoiceId = `INV-${trip.id.slice(0, 6).toUpperCase()}`;
  const generatedDate = new Date().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const totalBudget = trip.budgetLimit || 0;
  const totalSpent = grandTotal;
  const remaining = totalBudget - totalSpent;

  return (
    <div>
      <style jsx global>{`
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          @page {
            size: A4;
            margin: 15mm;
          }
          
          body {
            margin: 0;
            padding: 0;
          }
          
          .no-print {
            display: none !important;
          }
          
          .print-container {
            box-shadow: none !important;
            border: 1px solid #e5e7eb !important;
            page-break-inside: avoid;
            max-width: 100%;
            margin: 0 auto;
          }
          
          .print-page-break {
            page-break-before: always;
          }
          
          table {
            page-break-inside: auto;
          }
          
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          
          thead {
            display: table-header-group;
          }
          
          tfoot {
            display: table-footer-group;
          }
          
          /* Ensure proper spacing */
          .print-spacing {
            margin-bottom: 1rem;
          }
          
          /* Make sure colors are preserved */
          .bg-muted, .bg-muted\/30 {
            background-color: #f5f5f5 !important;
          }
          
          .text-green-600 {
            color: #16a34a !important;
          }
          
          .text-red-600 {
            color: #dc2626 !important;
          }
          
          .text-yellow-500 {
            color: #eab308 !important;
          }
          
          .bg-green-500 {
            background-color: #22c55e !important;
          }
          
          .bg-red-500 {
            background-color: #ef4444 !important;
          }
          
          .bg-yellow-500 {
            background-color: #eab308 !important;
          }
          
          .bg-border {
            background-color: #e5e7eb !important;
          }
        }
      `}</style>
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6 no-print">
          <Button variant="outline" size="sm" asChild>
            <Link href="/invoices">← Back to My Trips</Link>
          </Button>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm px-3 py-1">
              {userName}
            </Badge>
          </div>
        </div>

        {/* Invoice Card */}
        <div className="max-w-4xl mx-auto">
          <Card className="border-border/70 shadow-lg print-container">
            <CardContent className="p-8 print-spacing" ref={invoiceRef}>
            {/* Invoice Header */}
            <div className="flex items-start justify-between mb-8 pb-6 border-b print-spacing">
              <div>
                <h1 className="text-2xl font-bold mb-1">Traveloop</h1>
                <p className="text-sm text-muted-foreground">Travel Expense Management</p>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="mb-2">
                  {trip.tripName}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  {trip.stops.map((s) => s.cityName).join(", ")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Created by {userName}
                </p>
              </div>
            </div>

            {/* Invoice Details */}
            <div className="grid grid-cols-2 gap-8 mb-8 print-spacing">
              <div>
                <h3 className="text-sm font-semibold mb-3">Invoice Id</h3>
                <p className="text-sm">{invoiceId}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-3">Generated date</h3>
                <p className="text-sm">{generatedDate}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-3">Traveler Details</h3>
                <p className="text-sm">{userName}</p>
                <p className="text-sm text-muted-foreground">{userEmail}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-3">Payment status</h3>
                <Badge variant="secondary">pending</Badge>
              </div>
            </div>

            {/* Budget Insights */}
            {trip.budgetLimit && (
              <Card className="mb-8 bg-muted/30 print-spacing">
                <CardHeader>
                  <h3 className="text-sm font-semibold">Budget Insights</h3>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Budget:</span>
                    <span className="font-semibold">{formatCurrency(totalBudget)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Spent:</span>
                    <span className="font-semibold">{formatCurrency(totalSpent)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Remaining:</span>
                    <span className={`font-semibold ${remaining >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {formatCurrency(remaining)}
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="w-full bg-border rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          (totalSpent / totalBudget) * 100 > 100
                            ? "bg-red-500"
                            : (totalSpent / totalBudget) * 100 > 80
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                        style={{ width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-3" asChild>
                    <Link href={`/trips/${trip.id}/budget`}>View Full Budget</Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Expense Table */}
            <div className="mb-8 print-spacing">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 text-sm font-semibold">#</th>
                    <th className="text-left py-3 text-sm font-semibold">Category</th>
                    <th className="text-left py-3 text-sm font-semibold">Description</th>
                    <th className="text-left py-3 text-sm font-semibold">Qty/Details</th>
                    <th className="text-right py-3 text-sm font-semibold">Unit Cost</th>
                    <th className="text-right py-3 text-sm font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {expenseItems.map((item, index) => (
                    <tr key={index} className="border-b border-border/50">
                      <td className="py-3 text-sm">{index + 1}</td>
                      <td className="py-3 text-sm capitalize">{item.category}</td>
                      <td className="py-3 text-sm">{item.description}</td>
                      <td className="py-3 text-sm">{item.qty}</td>
                      <td className="py-3 text-sm text-right">{formatCurrency(item.unitCost)}</td>
                      <td className="py-3 text-sm text-right font-semibold">
                        {formatCurrency(item.amount)}
                      </td>
                    </tr>
                  ))}
                  {expenseItems.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                        No expenses recorded for this trip
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-8 print-spacing">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span className="font-semibold">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax (5%)</span>
                  <span className="font-semibold">{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Discount</span>
                  <span className="font-semibold">{formatCurrency(discount)}</span>
                </div>
                <div className="flex justify-between text-base font-bold pt-2 border-t">
                  <span>Grand Total</span>
                  <span>{formatCurrency(grandTotal)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3 mt-6 no-print">
          <Button variant="outline" className="gap-2" onClick={handleDownload}>
            <Download className="h-4 w-4" />
            Download Invoice
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => handlePrint()}>
            <Printer className="h-4 w-4" />
            Export as PDF
          </Button>
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => toast.success("Marked as paid")}
          >
            <Mail className="h-4 w-4" />
            Mark as paid
          </Button>
        </div>
      </div>
  );
}
