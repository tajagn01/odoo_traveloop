import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/api-auth";

export async function POST(request: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const payload = await request.json();
    if (!payload.tripName || !payload.startDate || !payload.endDate) {
      return NextResponse.json(
        { message: "Invalid trip payload: tripName, startDate, and endDate are required." },
        { status: 400 }
      );
    }

    const stops = payload.stops || [];

    // Create the trip in a single database transaction with sequential stop insertions
    const trip = await prisma.$transaction(async (tx) => {
      // 1. Create the base Trip record
      const newTrip = await tx.trip.create({
        data: {
          userId,
          tripName: payload.tripName,
          description: payload.description || null,
          startDate: new Date(payload.startDate),
          endDate: new Date(payload.endDate),
          status: "upcoming",
          budgetLimit: payload.budgetLimit ? parseFloat(payload.budgetLimit) : null,
          shareToken: crypto.randomUUID(),
        },
      });

      // 2. Add stops sequentially to prevent City unique constraint parallel race conditions
      if (stops && stops.length > 0) {
        for (let index = 0; index < stops.length; index++) {
          const stop = stops[index];

          // Find or create city sequentially
          let city = await tx.city.findUnique({
            where: {
              name_country: {
                name: stop.cityName,
                country: stop.country,
              },
            },
          });

          if (!city) {
            city = await tx.city.create({
              data: {
                name: stop.cityName,
                country: stop.country,
                region: "Unknown",
                popularityScore: 50,
                costIndex: 50,
              },
            });
          }

          // Create the Stop linked to the created/found City and Trip
          await tx.stop.create({
            data: {
              tripId: newTrip.id,
              cityId: city.id,
              cityName: stop.cityName,
              country: stop.country,
              arrivalDate: new Date(stop.arrivalDate),
              departureDate: new Date(stop.departureDate),
              stopOrder: index + 1,
              hotelName: stop.hotelName || null,
              stayCost: stop.hotelCost ? parseFloat(stop.hotelCost) : null,
              transportCost: stop.transportCost ? parseFloat(stop.transportCost) : null,
              activities:
                stop.activities && stop.activities.length > 0
                  ? {
                      create: stop.activities.map((activity: any, actIndex: number) => ({
                        cityId: city!.id,
                        activityName: activity.name,
                        description: activity.description || null,
                        activityType: "general",
                        duration: 60,
                        cost: activity.cost ? parseFloat(activity.cost) : 0,
                        scheduledDay: actIndex + 1,
                        scheduledTime: activity.time || null,
                      })),
                    }
                  : undefined,
            },
          });
        }
      }

      return newTrip;
    }, {
      maxWait: 10000, // 10 seconds max wait to acquire a connection
      timeout: 30000, // 30 seconds transaction timeout for network/cloud latency
    });

    // Revalidate paths so the user sees the new trip immediately
    revalidatePath("/trips");
    revalidatePath("/itinerary");
    revalidatePath("/dashboard");

    return NextResponse.json({ tripId: trip.id }, { status: 201 });
  } catch (error: any) {
    console.error("Error saving AI generated trip:", error);
    return NextResponse.json(
      { message: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
