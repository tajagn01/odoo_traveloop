import crypto from "crypto";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/api-auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const source = await prisma.trip.findFirst({
    where: { shareToken: token, isPublic: true },
    include: {
      stops: { include: { activities: true }, orderBy: { stopOrder: "asc" } },
      expenses: true,
      packingItems: true,
      notes: true,
    },
  });

  if (!source) {
    return NextResponse.json({ message: "Shared trip not found." }, { status: 404 });
  }

  const trip = await prisma.$transaction(async (tx) => {
    const createdTrip = await tx.trip.create({
      data: {
        userId,
        tripName: `${source.tripName} Copy`,
        description: source.description,
        startDate: source.startDate,
        endDate: source.endDate,
        coverPhoto: source.coverPhoto,
        isPublic: false,
        shareToken: crypto.randomUUID(),
        budgetLimit: source.budgetLimit,
        packingItems: {
          create: source.packingItems.map((item) => ({
            itemName: item.itemName,
            category: item.category,
            isPacked: false,
          })),
        },
        expenses: {
          create: source.expenses.map((expense) => ({
            category: expense.category,
            amount: expense.amount,
            date: expense.date,
            note: expense.note,
          })),
        },
      },
    });

    const stopIdMap = new Map<string, string>();

    for (const stop of source.stops) {
      const createdStop = await tx.stop.create({
        data: {
          tripId: createdTrip.id,
          cityId: stop.cityId,
          cityName: stop.cityName,
          country: stop.country,
          arrivalDate: stop.arrivalDate,
          departureDate: stop.departureDate,
          stopOrder: stop.stopOrder,
        },
      });

      stopIdMap.set(stop.id, createdStop.id);

      if (stop.activities.length) {
        await tx.activity.createMany({
          data: stop.activities.map((activity) => ({
            cityId: activity.cityId,
            stopId: createdStop.id,
            activityName: activity.activityName,
            description: activity.description,
            activityType: activity.activityType,
            duration: activity.duration,
            cost: activity.cost,
            imageUrl: activity.imageUrl,
          })),
        });
      }
    }

    if (source.notes.length) {
      await tx.note.createMany({
        data: source.notes.map((note) => ({
          tripId: createdTrip.id,
          stopId: note.stopId ? stopIdMap.get(note.stopId) ?? null : null,
          noteContent: note.noteContent,
        })),
      });
    }

    return createdTrip;
  });

  return NextResponse.json({ trip }, { status: 201 });
}
