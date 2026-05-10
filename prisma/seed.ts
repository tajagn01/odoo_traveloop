import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("Password123!", 12);

  const user = await prisma.user.create({
    data: {
      name: "Avery Park",
      email: "demo@traveloop.local",
      password: hashedPassword,
      profilePhoto: null,
      languagePreference: "en",
    },
  });

  const trip = await prisma.trip.create({
    data: {
      userId: user.id,
      tripName: "Mediterranean Loop",
      description: "A slow travel route through coastal cities.",
      startDate: new Date("2026-06-02"),
      endDate: new Date("2026-06-14"),
      coverPhoto: null,
      isPublic: true,
      shareToken: crypto.randomUUID(),
      budget: {
        create: {
          transportCost: 820,
          stayCost: 1450,
          mealCost: 480,
          activityCost: 320,
          totalCost: 3070,
          budgetLimit: 3200,
        },
      },
      packingItems: {
        create: [
          { itemName: "Linen shirts", category: "clothing", isPacked: true },
          { itemName: "Passport", category: "documents", isPacked: false },
          { itemName: "Camera", category: "electronics", isPacked: false },
          { itemName: "Sunscreen", category: "toiletries", isPacked: true },
        ],
      },
      stops: {
        create: [
          {
            cityName: "Lisbon",
            country: "Portugal",
            arrivalDate: new Date("2026-06-02"),
            departureDate: new Date("2026-06-05"),
            stopOrder: 1,
            activities: {
              create: [
                {
                  activityName: "Sunrise tram ride",
                  description: "Historic tram line with lookout stops.",
                  activityType: "Sightseeing",
                  duration: 2,
                  cost: 28,
                },
                {
                  activityName: "Seafood market crawl",
                  description: "Tastings across the waterfront market.",
                  activityType: "Food",
                  duration: 3,
                  cost: 54,
                },
              ],
            },
          },
          {
            cityName: "Barcelona",
            country: "Spain",
            arrivalDate: new Date("2026-06-05"),
            departureDate: new Date("2026-06-09"),
            stopOrder: 2,
            activities: {
              create: [
                {
                  activityName: "Modernist architecture walk",
                  description: "Guided tour of iconic design districts.",
                  activityType: "Culture",
                  duration: 3,
                  cost: 36,
                },
              ],
            },
          },
          {
            cityName: "Nice",
            country: "France",
            arrivalDate: new Date("2026-06-09"),
            departureDate: new Date("2026-06-14"),
            stopOrder: 3,
            activities: {
              create: [
                {
                  activityName: "Coastal bike cruise",
                  description: "Easy ride with coastal viewpoints.",
                  activityType: "Outdoor",
                  duration: 2,
                  cost: 22,
                },
              ],
            },
          },
        ],
      },
      notes: {
        create: [
          {
            noteContent: "Book rail passes before June 1 for the discount.",
          },
          {
            noteContent: "Bring light layers for coastal evenings.",
          },
        ],
      },
    },
  });

  await prisma.sharedTrip.create({
    data: {
      tripId: trip.id,
      shareToken: crypto.randomUUID(),
    },
  });

  await prisma.trip.create({
    data: {
      userId: user.id,
      tripName: "Nordic Cities Sprint",
      description: "Short break focused on design districts.",
      startDate: new Date("2026-08-11"),
      endDate: new Date("2026-08-18"),
      coverPhoto: null,
      isPublic: false,
      shareToken: crypto.randomUUID(),
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
