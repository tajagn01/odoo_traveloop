import { Skeleton } from "@/components/ui/skeleton";

export default function TripLoading() {
  return (
    <div className="space-y-6 px-6 py-10">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-64" />
      <Skeleton className="h-32" />
    </div>
  );
}
