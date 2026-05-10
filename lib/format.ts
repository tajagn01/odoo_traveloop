import { differenceInDays, format, parseISO } from "date-fns";

export function formatDate(value: Date | string) {
  const date = typeof value === "string" ? parseISO(value) : value;
  return format(date, "MMM d, yyyy");
}

export function formatDateRange(start: Date | string, end: Date | string) {
  const startDate = typeof start === "string" ? parseISO(start) : start;
  const endDate = typeof end === "string" ? parseISO(end) : end;
  return `${format(startDate, "MMM d")}-${format(endDate, "MMM d, yyyy")}`;
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function daysBetween(start: Date | string, end: Date | string) {
  const startDate = typeof start === "string" ? parseISO(start) : start;
  const endDate = typeof end === "string" ? parseISO(end) : end;
  return Math.max(differenceInDays(endDate, startDate) + 1, 1);
}
