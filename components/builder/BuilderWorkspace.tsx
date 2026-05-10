"use client";

import { useBuilderStore } from "@/lib/stores/useBuilderStore";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { StopCard } from "./StopCard";
import { updateStopOrder } from "@/lib/actions/builder";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export function BuilderWorkspace() {
  const { tripId, stops, reorderStops, isLoading } = useBuilderStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px tolerance before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      reorderStops(active.id as string, over.id as string);

      // We need to pass the newly ordered IDs to the server
      const oldIndex = stops.findIndex((s) => s.id === active.id);
      const newIndex = stops.findIndex((s) => s.id === over.id);
      const newStops = arrayMove(stops, oldIndex, newIndex);
      const newOrder = newStops.map((s) => s.id);

      try {
        await updateStopOrder(tripId, newOrder);
      } catch (error) {
        toast.error("Failed to save new order. Please try again.");
      }
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4 w-full lg:col-span-2">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (stops.length === 0) {
    return (
      <div className="w-full lg:col-span-2 flex flex-col items-center justify-center p-12 border-2 border-dashed border-border rounded-3xl bg-muted/20">
        <h3 className="text-xl font-semibold mb-2">No stops added yet</h3>
        <p className="text-muted-foreground text-center max-w-md">
          Start building your itinerary by searching for a city in the panel on the right, or use the City Search page.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full lg:col-span-2 space-y-6">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={stops.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          {stops.map((stop, index) => (
            <StopCard key={stop.id} stop={stop} index={index} />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
