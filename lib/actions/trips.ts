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
  status: z.enum(["upcoming", "ongoing", "completed"]).optional(),
});

export async function createTripAction(formData: FormData) {
  const session = await requireAuth();

  const payload = tripSchema.safeParse({
    tripName: formData.get("tripName"),
    description: formData.get("description"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    status: formData.get("status"),
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
    }
  }

  // Parse stops, expenses, and budget
  const stopsData = formData.get("stops");
  const expensesData = formData.get("expenses");
  const budgetLimit = formData.get("budgetLimit");
  
  const stops = stopsData ? JSON.parse(stopsData as string) : [];
  const expenses = expensesData ? JSON.parse(expensesData as string) : [];

  // Create trip with stops, activities, and expenses
  const trip = await prisma.trip.create({
    data: {
      userId: session.user.id,
      tripName: payload.data.tripName,
      description: payload.data.description ?? null,
      startDate: new Date(payload.data.startDate),
      endDate: new Date(payload.data.endDate),
      status: payload.data.status ?? "upcoming",
      budgetLimit: budgetLimit ? parseFloat(budgetLimit as string) : null,
      coverPhoto,
      shareToken: crypto.randomUUID(),
      // Create stops with activities
      stops: stops.length > 0 ? {
        create: await Promise.all(stops.map(async (stop: any, index: number) => {
          // Find or create city
          let city = await prisma.city.findUnique({
            where: { name_country: { name: stop.cityName, country: stop.country } }
          });

          if (!city) {
            city = await prisma.city.create({
              data: {
                name: stop.cityName,
                country: stop.country,
                region: "Unknown",
                popularityScore: 50,
                costIndex: 50,
              }
            });
          }

          return {
            cityId: city.id,
            cityName: stop.cityName,
            country: stop.country,
            arrivalDate: new Date(stop.arrivalDate),
            departureDate: new Date(stop.departureDate),
            stopOrder: index + 1,
            hotelName: stop.hotelName || null,
            stayCost: stop.hotelCost || null,
            transportCost: stop.transportCost || null,
            activities: stop.activities && stop.activities.length > 0 ? {
              create: stop.activities.map((activity: any, actIndex: number) => ({
                cityId: city.id,
                activityName: activity.name,
                description: activity.description || null,
                activityType: "general",
                duration: 60,
                cost: activity.cost || 0,
                scheduledDay: actIndex + 1,
                scheduledTime: activity.time || null,
              }))
            } : undefined,
          };
        }))
      } : undefined,
      // Create expenses
      expenses: expenses.length > 0 ? {
        create: expenses.map((expense: any) => ({
          category: expense.category,
          amount: expense.amount,
          date: expense.date ? new Date(expense.date) : new Date(payload.data.startDate),
          note: expense.description,
        }))
      } : undefined,
    },
  });

  revalidatePath("/trips");
  revalidatePath("/itinerary");
  redirect(`/trips/${trip.id}/builder`);
}

const updateTripSchema = z.object({
  tripId: z.string(),
  tripName: z.string().min(2),
  description: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
});

export async function updateTripAction(formData: FormData) {
  const session = await requireAuth();

  const payload = updateTripSchema.safeParse({
    tripId: formData.get("tripId"),
    tripName: formData.get("tripName"),
    description: formData.get("description"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
  });

  if (!payload.success) throw new Error("Invalid trip details.");

  const trip = await prisma.trip.findFirst({
    where: { id: payload.data.tripId, userId: session.user.id },
  });
  if (!trip) throw new Error("Trip not found.");

  const coverFile = formData.get("coverPhoto");
  let coverPhoto: string | null = trip.coverPhoto;
  if (coverFile instanceof File && coverFile.size > 0) {
    try {
      coverPhoto = await uploadImage(coverFile);
    } catch (err) {
      console.error("Cover photo upload failed, skipping:", err);
    }
  }

  await prisma.trip.update({
    where: { id: trip.id },
    data: {
      tripName: payload.data.tripName,
      description: payload.data.description ?? null,
      startDate: new Date(payload.data.startDate),
      endDate: new Date(payload.data.endDate),
      coverPhoto,
    },
  });

  revalidatePath(`/trips/${trip.id}`);
  revalidatePath("/trips");
  redirect(`/trips/${trip.id}`);
}


export async function deleteTripAction(tripId: string) {
  const session = await requireAuth();

  const trip = await prisma.trip.findFirst({
    where: { id: tripId, userId: session.user.id },
  });

  if (!trip) {
    throw new Error("Trip not found or unauthorized.");
  }

  await prisma.trip.delete({
    where: { id: tripId },
  });

  revalidatePath("/trips");
  revalidatePath("/itinerary");
  revalidatePath("/dashboard");
}

export async function deleteStopAction(stopId: string) {
  const session = await requireAuth();

  const stop = await prisma.stop.findFirst({
    where: { id: stopId },
    include: { trip: true },
  });

  if (!stop || stop.trip.userId !== session.user.id) {
    throw new Error("Stop not found or unauthorized.");
  }

  await prisma.stop.delete({
    where: { id: stopId },
  });

  revalidatePath(`/trips/${stop.tripId}`);
  revalidatePath("/itinerary");
}
