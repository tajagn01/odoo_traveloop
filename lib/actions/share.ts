"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";

export async function enableShareAction(formData: FormData) {
  const session = await requireAuth();
  const tripId = String(formData.get("tripId"));

  const trip = await prisma.trip.findFirst({
    where: { id: tripId, userId: session.user.id },
    include: { sharedTrips: true },
  });

  if (!trip) {
    throw new Error("Trip not found.");
  }

  const token = trip.shareToken ?? crypto.randomUUID();

  if (!trip.sharedTrips.length) {
    await prisma.sharedTrip.create({
      data: {
        tripId: trip.id,
        shareToken: token,
      },
    });
  }

  await prisma.trip.update({
    where: { id: trip.id },
    data: { isPublic: true, shareToken: token },
  });

  revalidatePath(`/trips/${trip.id}`);
}
