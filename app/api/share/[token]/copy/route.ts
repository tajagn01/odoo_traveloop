import { NextResponse } from "next/server";
import crypto from "crypto";

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

  const shared = await prisma.sharedTrip.findUnique({
    where: { shareToken: token },
    include: {
      trip: {
        include: {
          stops: { include: { activities: true } },
          budget: true,
          packingItems: true,
          notes: true,
        },
      },
    },
  });

  if (!shared) {
    return NextResponse.json({ message: "Shared trip not found." }, { status: 404 });
  }

  const source = shared.trip;

  const trip = await prisma.trip.create({
    data: {
      userId,
      tripName: `${source.tripName} Copy`,
      description: source.description,
      startDate: source.startDate,
      endDate: source.endDate,
      coverPhoto: source.coverPhoto,
      isPublic: false,
      shareToken: crypto.randomUUID(),
      budget: source.budget
        ? {
            create: {
              transportCost: source.budget.transportCost,
              stayCost: source.budget.stayCost,
              mealCost: source.budget.mealCost,
              activityCost: source.budget.activityCost,
              totalCost: source.budget.totalCost,
              budgetLimit: source.budget.budgetLimit,
            },
          }
        : undefined,
      packingItems: {
        create: source.packingItems.map(
          (item: { itemName: string; category: string }) => ({
            itemName: item.itemName,
            category: item.category,
            isPacked: false,
          })
        ),
      },
      notes: {
        create: source.notes.map((note: { noteContent: string }) => ({
          noteContent: note.noteContent,
        })),
      },
      stops: {
        create: source.stops.map(
          (stop: {
            cityName: string;
            country: string;
            arrivalDate: Date;
            departureDate: Date;
            stopOrder: number;
            activities: Array<{
              activityName: string;
              description: string | null;
              activityType: string;
              duration: number;
              cost: number;
              imageUrl: string | null;
            }>;
          }) => ({
            cityName: stop.cityName,
            country: stop.country,
            arrivalDate: stop.arrivalDate,
            departureDate: stop.departureDate,
            stopOrder: stop.stopOrder,
            activities: {
              create: stop.activities.map(
                (activity: {
                  activityName: string;
                  description: string | null;
                  activityType: string;
                  duration: number;
                  cost: number;
                  imageUrl: string | null;
                }) => ({
                  activityName: activity.activityName,
                  description: activity.description,
                  activityType: activity.activityType,
                  duration: activity.duration,
                  cost: activity.cost,
                  imageUrl: activity.imageUrl,
                })
              ),
            },
          })
        ),
      },
    },
  });

  return NextResponse.json({ trip }, { status: 201 });
}
