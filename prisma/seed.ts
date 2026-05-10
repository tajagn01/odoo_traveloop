import { PrismaClient, ExpenseCategory } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const prisma = new PrismaClient();

const cities = [
  { name: "Lisbon", country: "Portugal", region: "Europe", popularityScore: 92, costIndex: 62 },
  { name: "Barcelona", country: "Spain", region: "Europe", popularityScore: 95, costIndex: 70 },
  { name: "Nice", country: "France", region: "Europe", popularityScore: 82, costIndex: 76 },
  { name: "Marrakesh", country: "Morocco", region: "Africa", popularityScore: 84, costIndex: 45 },
  { name: "Kyoto", country: "Japan", region: "Asia", popularityScore: 90, costIndex: 78 },
  { name: "Cape Town", country: "South Africa", region: "Africa", popularityScore: 80, costIndex: 52 },
  { name: "Vancouver", country: "Canada", region: "North America", popularityScore: 86, costIndex: 76 },
  { name: "Istanbul", country: "Turkey", region: "Europe", popularityScore: 88, costIndex: 58 },
];

const catalogActivities = {
  Lisbon: [
    {
      activityName: "Sunrise tram ride",
      description: "Historic tram line with lookout stops.",
      activityType: "Sightseeing",
      duration: 2,
      cost: 28,
      imageUrl:
        "https://images.unsplash.com/photo-1548707306-eedb5146f5c9?auto=format&fit=crop&w=800&q=80",
    },
    {
      activityName: "Seafood market crawl",
      description: "Tastings across the waterfront market.",
      activityType: "Food",
      duration: 3,
      cost: 54,
      imageUrl:
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
    },
  ],
  Barcelona: [
    {
      activityName: "Modernist architecture walk",
      description: "Guided tour of iconic design districts.",
      activityType: "Culture",
      duration: 3,
      cost: 36,
      imageUrl:
        "https://images.unsplash.com/photo-1505739776515-2f929d2e4f3f?auto=format&fit=crop&w=800&q=80",
    },
    {
      activityName: "Tapas rooftop evening",
      description: "Shared plates with skyline views.",
      activityType: "Food",
      duration: 2,
      cost: 44,
      imageUrl:
        "https://images.unsplash.com/photo-1515443961218-a51367888e4b?auto=format&fit=crop&w=800&q=80",
    },
  ],
  Nice: [
    {
      activityName: "Coastal bike cruise",
      description: "Easy ride with coastal viewpoints.",
      activityType: "Outdoor",
      duration: 2,
      cost: 22,
      imageUrl:
        "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?auto=format&fit=crop&w=800&q=80",
    },
    {
      activityName: "Old Town market stroll",
      description: "Flower stalls, street snacks, and local produce.",
      activityType: "Sightseeing",
      duration: 2,
      cost: 18,
      imageUrl:
        "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80",
    },
  ],
  Kyoto: [
    {
      activityName: "Temple district cycling",
      description: "Leisurely route through eastern temple streets.",
      activityType: "Outdoor",
      duration: 3,
      cost: 26,
      imageUrl:
        "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80",
    },
    {
      activityName: "Tea ceremony workshop",
      description: "Hands-on introduction to Kyoto tea culture.",
      activityType: "Culture",
      duration: 2,
      cost: 48,
      imageUrl:
        "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=800&q=80",
    },
  ],
  Vancouver: [
    {
      activityName: "Seawall cycling loop",
      description: "Scenic ride around the waterfront parks.",
      activityType: "Outdoor",
      duration: 3,
      cost: 34,
      imageUrl:
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80",
    },
    {
      activityName: "Granville market tasting",
      description: "Sample local bakeries and fresh seafood stands.",
      activityType: "Food",
      duration: 2,
      cost: 32,
      imageUrl:
        "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=800&q=80",
    },
  ],
} as const;

async function main() {
  const hashedPassword = await bcrypt.hash("Password123!", 12);

  await prisma.passwordResetToken.deleteMany();
  await prisma.savedDestination.deleteMany();
  await prisma.note.deleteMany();
  await prisma.packingItem.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.stop.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.city.deleteMany();
  await prisma.user.deleteMany();

  const user = await prisma.user.create({
    data: {
      name: "Avery Park",
      email: "demo@traveloop.local",
      password: hashedPassword,
      profilePhoto: null,
      languagePreference: "en",
      emailVerified: new Date(),
    },
  });

  await prisma.city.createMany({ data: cities });

  const cityRows = await prisma.city.findMany();
  const cityByName = new Map(cityRows.map((city) => [city.name, city]));

  await prisma.activity.createMany({
    data: Object.entries(catalogActivities).flatMap(([cityName, activities]) =>
      activities.map((activity) => ({
        cityId: cityByName.get(cityName)?.id ?? "",
        stopId: null,
        ...activity,
      }))
    ),
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
      budgetLimit: 3200,
      packingItems: {
        create: [
          { itemName: "Linen shirts", category: "clothing", isPacked: true },
          { itemName: "Passport", category: "documents", isPacked: false },
          { itemName: "Camera", category: "electronics", isPacked: false },
          { itemName: "Sunscreen", category: "toiletries", isPacked: true },
        ],
      },
      expenses: {
        create: [
          {
            category: ExpenseCategory.transport,
            amount: 820,
            date: new Date("2026-06-02"),
            note: "Flights and rail passes",
          },
          {
            category: ExpenseCategory.stay,
            amount: 1450,
            date: new Date("2026-06-02"),
            note: "Boutique hotels",
          },
          {
            category: ExpenseCategory.meals,
            amount: 480,
            date: new Date("2026-06-03"),
            note: "Food and cafes",
          },
          {
            category: ExpenseCategory.activities,
            amount: 320,
            date: new Date("2026-06-04"),
            note: "Tours and tickets",
          },
        ],
      },
      stops: {
        create: [
          {
            cityId: cityByName.get("Lisbon")!.id,
            cityName: "Lisbon",
            country: "Portugal",
            arrivalDate: new Date("2026-06-02"),
            departureDate: new Date("2026-06-05"),
            stopOrder: 1,
            activities: {
              create: [
                {
                  cityId: cityByName.get("Lisbon")!.id,
                  activityName: "Sunrise tram ride",
                  description: "Historic tram line with lookout stops.",
                  activityType: "Sightseeing",
                  duration: 2,
                  cost: 28,
                  imageUrl:
                    "https://images.unsplash.com/photo-1548707306-eedb5146f5c9?auto=format&fit=crop&w=800&q=80",
                },
                {
                  cityId: cityByName.get("Lisbon")!.id,
                  activityName: "Seafood market crawl",
                  description: "Tastings across the waterfront market.",
                  activityType: "Food",
                  duration: 3,
                  cost: 54,
                  imageUrl:
                    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
                },
              ],
            },
          },
          {
            cityId: cityByName.get("Barcelona")!.id,
            cityName: "Barcelona",
            country: "Spain",
            arrivalDate: new Date("2026-06-05"),
            departureDate: new Date("2026-06-09"),
            stopOrder: 2,
            activities: {
              create: [
                {
                  cityId: cityByName.get("Barcelona")!.id,
                  activityName: "Modernist architecture walk",
                  description: "Guided tour of iconic design districts.",
                  activityType: "Culture",
                  duration: 3,
                  cost: 36,
                  imageUrl:
                    "https://images.unsplash.com/photo-1505739776515-2f929d2e4f3f?auto=format&fit=crop&w=800&q=80",
                },
              ],
            },
          },
          {
            cityId: cityByName.get("Nice")!.id,
            cityName: "Nice",
            country: "France",
            arrivalDate: new Date("2026-06-09"),
            departureDate: new Date("2026-06-14"),
            stopOrder: 3,
            activities: {
              create: [
                {
                  cityId: cityByName.get("Nice")!.id,
                  activityName: "Coastal bike cruise",
                  description: "Easy ride with coastal viewpoints.",
                  activityType: "Outdoor",
                  duration: 2,
                  cost: 22,
                  imageUrl:
                    "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?auto=format&fit=crop&w=800&q=80",
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
    include: { stops: true },
  });

  const lisbonStop = trip.stops.find((stop) => stop.cityName === "Lisbon");
  if (lisbonStop) {
    await prisma.note.create({
      data: {
        tripId: trip.id,
        stopId: lisbonStop.id,
        noteContent: "Reserve the Alfama dinner spot two nights ahead.",
      },
    });
  }

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
      budgetLimit: 2800,
      stops: {
        create: [
          {
            cityId: cityByName.get("Vancouver")!.id,
            cityName: "Vancouver",
            country: "Canada",
            arrivalDate: new Date("2026-08-11"),
            departureDate: new Date("2026-08-14"),
            stopOrder: 1,
          },
          {
            cityId: cityByName.get("Kyoto")!.id,
            cityName: "Kyoto",
            country: "Japan",
            arrivalDate: new Date("2026-08-15"),
            departureDate: new Date("2026-08-18"),
            stopOrder: 2,
          },
        ],
      },
    },
  });

  await prisma.savedDestination.createMany({
    data: [
      { userId: user.id, cityId: cityByName.get("Kyoto")!.id },
      { userId: user.id, cityId: cityByName.get("Vancouver")!.id },
    ],
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
