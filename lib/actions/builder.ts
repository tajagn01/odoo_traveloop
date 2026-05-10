"use server";

import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Type definitions for incoming updates
export type UpdateStopInput = {
  id: string;
  hotelName?: string | null;
  hotelAddress?: string | null;
  bookingReference?: string | null;
  stayCost?: number | null;
  transportCost?: number | null;
  miscCost?: number | null;
  arrivalDate?: Date | string;
  departureDate?: Date | string;
};

export async function updateStopDetails(input: UpdateStopInput) {
  const session = await requireAuth();
  
  // Verify ownership
  const stop = await prisma.stop.findUnique({
    where: { id: input.id },
    include: { trip: true },
  });

  if (!stop || stop.trip.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  await prisma.stop.update({
    where: { id: input.id },
    data: {
      hotelName: input.hotelName,
      hotelAddress: input.hotelAddress,
      bookingReference: input.bookingReference,
      stayCost: input.stayCost,
      transportCost: input.transportCost,
      miscCost: input.miscCost,
      arrivalDate: input.arrivalDate ? new Date(input.arrivalDate) : undefined,
      departureDate: input.departureDate ? new Date(input.departureDate) : undefined,
    },
  });

  revalidatePath(`/trips/${stop.tripId}/builder`);
  return { success: true };
}

export async function updateStopOrder(tripId: string, orderedStopIds: string[]) {
  const session = await requireAuth();
  
  const trip = await prisma.trip.findFirst({
    where: { id: tripId, userId: session.user.id },
  });

  if (!trip) throw new Error("Unauthorized");

  // Execute in transaction to prevent partial updates
  await prisma.$transaction(
    orderedStopIds.map((stopId, index) =>
      prisma.stop.update({
        where: { id: stopId },
        data: { stopOrder: index + 1 },
      })
    )
  );

  revalidatePath(`/trips/${tripId}/builder`);
  return { success: true };
}

export async function deleteStop(stopId: string) {
  const session = await requireAuth();
  
  const stop = await prisma.stop.findUnique({
    where: { id: stopId },
    include: { trip: true },
  });

  if (!stop || stop.trip.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  await prisma.stop.delete({
    where: { id: stopId },
  });

  revalidatePath(`/trips/${stop.tripId}/builder`);
  return { success: true };
}

export async function addTransportSegment(data: {
  tripId: string;
  fromStopId: string;
  toStopId: string;
  mode: string;
  departureTime?: Date | string;
  arrivalTime?: Date | string;
  duration?: number;
  cost?: number;
}) {
  const session = await requireAuth();
  const trip = await prisma.trip.findFirst({
    where: { id: data.tripId, userId: session.user.id },
  });

  if (!trip) throw new Error("Unauthorized");

  const segment = await prisma.transportSegment.create({
    data: {
      tripId: data.tripId,
      fromStopId: data.fromStopId,
      toStopId: data.toStopId,
      mode: data.mode,
      departureTime: data.departureTime ? new Date(data.departureTime) : null,
      arrivalTime: data.arrivalTime ? new Date(data.arrivalTime) : null,
      duration: data.duration,
      cost: data.cost,
    },
  });

  revalidatePath(`/trips/${data.tripId}/builder`);
  return segment;
}

export async function saveFullItinerary(tripId: string, payload: any) {
  // Generic batch save action if needed for "Save Draft" button
  const session = await requireAuth();
  const trip = await prisma.trip.findFirst({
    where: { id: tripId, userId: session.user.id },
  });

  if (!trip) throw new Error("Unauthorized");

  // TODO: Add complex reconciliation logic if we don't rely purely on optimistic actions
  revalidatePath(`/trips/${tripId}/builder`);
  return { success: true };
}
