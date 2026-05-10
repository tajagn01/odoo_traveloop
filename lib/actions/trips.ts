"use server";

import crypto from "crypto";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { uploadImage } from "@/lib/cloudinary";

const tripSchema = z.object({
  tripName: z.string().min(2),
  description: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
});

export async function createTripAction(formData: FormData) {
  const session = await requireAuth();

  const payload = tripSchema.safeParse({
    tripName: formData.get("tripName"),
    description: formData.get("description"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
  });

  if (!payload.success) {
    throw new Error("Invalid trip details.");
  }

  const coverFile = formData.get("coverPhoto");
  let coverPhoto: string | null = null;
  if (coverFile instanceof File && coverFile.size > 0) {
    try {
      coverPhoto = await uploadImage(coverFile);
    } catch (err) {
      console.error("Cover photo upload failed, skipping:", err);
      // Trip will be created without a cover photo
    }
  }

  const trip = await prisma.trip.create({
    data: {
      userId: session.user.id,
      tripName: payload.data.tripName,
      description: payload.data.description ?? null,
      startDate: new Date(payload.data.startDate),
      endDate: new Date(payload.data.endDate),
      coverPhoto,
      shareToken: crypto.randomUUID(),
    },
  });

  revalidatePath("/trips");
  redirect(`/trips/${trip.id}/builder`);
}
