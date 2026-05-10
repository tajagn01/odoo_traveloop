import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Find the existing demo user
  const demoUser = await prisma.user.findUnique({
    where: { email: "demo@traveloop.local" },
  });

  if (!demoUser) {
    console.error("❌ Demo user not found. Please create demo@traveloop.local first.");
    return;
  }

  console.log("✅ Found demo user:", demoUser.email);

  // Create cities
  const paris = await prisma.city.upsert({
    where: { name_country: { name: "Paris", country: "France" } },
    update: {},
    create: {
      name: "Paris",
      country: "France",
      region: "Europe",
      popularityScore: 95,
      costIndex: 85,
    },
  });

  const rome = await prisma.city.upsert({
    where: { name_country: { name: "Rome", country: "Italy" } },
    update: {},
    create: {
      name: "Rome",
      country: "Italy",
      region: "Europe",
      popularityScore: 92,
      costIndex: 75,
    },
  });

  const tokyo = await prisma.city.upsert({
    where: { name_country: { name: "Tokyo", country: "Japan" } },
    update: {},
    create: {
      name: "Tokyo",
      country: "Japan",
      region: "Asia",
      popularityScore: 90,
      costIndex: 88,
    },
  });

  const barcelona = await prisma.city.upsert({
    where: { name_country: { name: "Barcelona", country: "Spain" } },
    update: {},
    create: {
      name: "Barcelona",
      country: "Spain",
      region: "Europe",
      popularityScore: 88,
      costIndex: 70,
    },
  });

  console.log("✅ Cities created");

  // Trip 1: European Adventure
  const trip1StartDate = new Date("2026-06-15");
  const trip1 = await prisma.trip.create({
    data: {
      userId: demoUser.id,
      tripName: "European Summer Adventure",
      description: "A wonderful journey through the heart of Europe, exploring iconic cities and rich culture.",
      startDate: trip1StartDate,
      endDate: new Date("2026-06-28"),
      status: "upcoming",
      budgetLimit: 4500,
      shareToken: `demo-europe-${Date.now()}`,
      coverPhoto: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
      stops: {
        create: [
          {
            cityId: paris.id,
            cityName: "Paris",
            country: "France",
            arrivalDate: new Date("2026-06-15"),
            departureDate: new Date("2026-06-19"),
            stopOrder: 1,
            hotelName: "Hotel Le Marais",
            hotelAddress: "15 Rue des Archives, 75004 Paris",
            stayCost: 800,
            transportCost: 150,
            activities: {
              create: [
                {
                  cityId: paris.id,
                  activityName: "Eiffel Tower Visit",
                  description: "Iconic iron lattice tower with panoramic city views from observation decks",
                  activityType: "sightseeing",
                  duration: 180,
                  cost: 26,
                  rating: 4.8,
                  bestTime: "Morning",
                  scheduledDay: 1,
                  scheduledTime: "09:00",
                  imageUrl: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=800&q=80",
                },
                {
                  cityId: paris.id,
                  activityName: "Louvre Museum",
                  description: "World's largest art museum featuring the Mona Lisa and thousands of masterpieces",
                  activityType: "culture",
                  duration: 240,
                  cost: 17,
                  rating: 4.9,
                  bestTime: "Afternoon",
                  scheduledDay: 1,
                  scheduledTime: "14:00",
                  imageUrl: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80",
                },
                {
                  cityId: paris.id,
                  activityName: "Seine River Cruise",
                  description: "Romantic boat tour along the Seine with views of Notre-Dame and bridges",
                  activityType: "leisure",
                  duration: 90,
                  cost: 15,
                  rating: 4.7,
                  bestTime: "Evening",
                  scheduledDay: 2,
                  scheduledTime: "19:00",
                  imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80",
                },
                {
                  cityId: paris.id,
                  activityName: "Montmartre Walking Tour",
                  description: "Explore the artistic neighborhood with Sacré-Cœur Basilica and charming streets",
                  activityType: "sightseeing",
                  duration: 150,
                  cost: 0,
                  rating: 4.6,
                  bestTime: "Morning",
                  scheduledDay: 3,
                  scheduledTime: "10:00",
                },
              ],
            },
          },
          {
            cityId: barcelona.id,
            cityName: "Barcelona",
            country: "Spain",
            arrivalDate: new Date("2026-06-19"),
            departureDate: new Date("2026-06-23"),
            stopOrder: 2,
            hotelName: "Hotel Gothic Quarter",
            hotelAddress: "Carrer de la Portaferrissa, 08002 Barcelona",
            stayCost: 650,
            transportCost: 120,
            activities: {
              create: [
                {
                  cityId: barcelona.id,
                  activityName: "Sagrada Familia",
                  description: "Gaudí's unfinished masterpiece basilica with stunning architecture",
                  activityType: "culture",
                  duration: 120,
                  cost: 26,
                  rating: 4.9,
                  bestTime: "Morning",
                  scheduledDay: 1,
                  scheduledTime: "09:30",
                  imageUrl: "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=800&q=80",
                },
                {
                  cityId: barcelona.id,
                  activityName: "Park Güell",
                  description: "Colorful park designed by Gaudí with mosaic art and city views",
                  activityType: "sightseeing",
                  duration: 150,
                  cost: 10,
                  rating: 4.7,
                  bestTime: "Afternoon",
                  scheduledDay: 1,
                  scheduledTime: "15:00",
                },
                {
                  cityId: barcelona.id,
                  activityName: "Beach Day at Barceloneta",
                  description: "Relax on the famous beach with Mediterranean views",
                  activityType: "leisure",
                  duration: 240,
                  cost: 0,
                  rating: 4.5,
                  bestTime: "All day",
                  scheduledDay: 2,
                  scheduledTime: "11:00",
                },
                {
                  cityId: barcelona.id,
                  activityName: "Gothic Quarter Walk",
                  description: "Explore medieval streets and historic architecture",
                  activityType: "sightseeing",
                  duration: 120,
                  cost: 0,
                  rating: 4.6,
                  bestTime: "Evening",
                  scheduledDay: 3,
                  scheduledTime: "17:00",
                },
              ],
            },
          },
          {
            cityId: rome.id,
            cityName: "Rome",
            country: "Italy",
            arrivalDate: new Date("2026-06-23"),
            departureDate: new Date("2026-06-28"),
            stopOrder: 3,
            hotelName: "Hotel Trastevere",
            hotelAddress: "Via della Lungaretta, 00153 Rome",
            stayCost: 750,
            transportCost: 100,
            activities: {
              create: [
                {
                  cityId: rome.id,
                  activityName: "Colosseum Tour",
                  description: "Ancient Roman amphitheater and iconic landmark",
                  activityType: "sightseeing",
                  duration: 150,
                  cost: 20,
                  rating: 4.9,
                  bestTime: "Morning",
                  scheduledDay: 1,
                  scheduledTime: "09:00",
                  imageUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80",
                },
                {
                  cityId: rome.id,
                  activityName: "Vatican Museums & Sistine Chapel",
                  description: "World-renowned art collection and Michelangelo's ceiling",
                  activityType: "culture",
                  duration: 210,
                  cost: 17,
                  rating: 4.8,
                  bestTime: "Afternoon",
                  scheduledDay: 2,
                  scheduledTime: "13:00",
                },
                {
                  cityId: rome.id,
                  activityName: "Trevi Fountain & Spanish Steps",
                  description: "Famous baroque fountain and historic stairway",
                  activityType: "sightseeing",
                  duration: 90,
                  cost: 0,
                  rating: 4.7,
                  bestTime: "Evening",
                  scheduledDay: 3,
                  scheduledTime: "18:00",
                },
                {
                  cityId: rome.id,
                  activityName: "Roman Forum Walk",
                  description: "Ancient ruins in the heart of Rome",
                  activityType: "sightseeing",
                  duration: 120,
                  cost: 16,
                  rating: 4.6,
                  bestTime: "Morning",
                  scheduledDay: 4,
                  scheduledTime: "10:00",
                },
              ],
            },
          },
        ],
      },
      expenses: {
        create: [
          { category: "transport", amount: 650, date: trip1StartDate, note: "Round-trip flights" },
          { category: "transport", amount: 370, date: trip1StartDate, note: "Inter-city trains" },
          { category: "meals", amount: 800, date: trip1StartDate, note: "Dining budget" },
          { category: "activities", amount: 147, date: trip1StartDate, note: "Entrance fees" },
        ],
      },
      packingItems: {
        create: [
          { itemName: "Passport", category: "Documents", isPacked: false },
          { itemName: "Travel insurance", category: "Documents", isPacked: false },
          { itemName: "Phone charger", category: "Electronics", isPacked: false },
          { itemName: "Camera", category: "Electronics", isPacked: false },
          { itemName: "Comfortable walking shoes", category: "Clothing", isPacked: false },
          { itemName: "Light jacket", category: "Clothing", isPacked: false },
          { itemName: "Sunglasses", category: "Accessories", isPacked: false },
          { itemName: "Sunscreen", category: "Toiletries", isPacked: false },
        ],
      },
    },
  });

  console.log("✅ Trip 1 created: European Summer Adventure");

  // Trip 2: Tokyo Discovery
  const trip2StartDate = new Date("2026-09-10");
  const trip2 = await prisma.trip.create({
    data: {
      userId: demoUser.id,
      tripName: "Tokyo Discovery",
      description: "Immerse yourself in Japanese culture, technology, and cuisine in the vibrant capital.",
      startDate: trip2StartDate,
      endDate: new Date("2026-09-17"),
      status: "upcoming",
      budgetLimit: 3500,
      shareToken: `demo-tokyo-${Date.now()}`,
      coverPhoto: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80",
      stops: {
        create: [
          {
            cityId: tokyo.id,
            cityName: "Tokyo",
            country: "Japan",
            arrivalDate: trip2StartDate,
            departureDate: new Date("2026-09-17"),
            stopOrder: 1,
            hotelName: "Shibuya Grand Hotel",
            hotelAddress: "1-1 Shibuya, Tokyo 150-0002",
            stayCost: 1200,
            transportCost: 80,
            activities: {
              create: [
                {
                  cityId: tokyo.id,
                  activityName: "Senso-ji Temple",
                  description: "Tokyo's oldest Buddhist temple in historic Asakusa",
                  activityType: "culture",
                  duration: 120,
                  cost: 0,
                  rating: 4.7,
                  bestTime: "Morning",
                  scheduledDay: 1,
                  scheduledTime: "09:00",
                  imageUrl: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=800&q=80",
                },
                {
                  cityId: tokyo.id,
                  activityName: "Shibuya Crossing Experience",
                  description: "World's busiest pedestrian crossing and shopping district",
                  activityType: "sightseeing",
                  duration: 90,
                  cost: 0,
                  rating: 4.6,
                  bestTime: "Evening",
                  scheduledDay: 1,
                  scheduledTime: "18:00",
                },
                {
                  cityId: tokyo.id,
                  activityName: "Tokyo Skytree",
                  description: "Tallest structure in Japan with observation decks",
                  activityType: "sightseeing",
                  duration: 150,
                  cost: 25,
                  rating: 4.8,
                  bestTime: "Afternoon",
                  scheduledDay: 2,
                  scheduledTime: "14:00",
                },
                {
                  cityId: tokyo.id,
                  activityName: "Tsukiji Outer Market",
                  description: "Fresh seafood and street food paradise",
                  activityType: "food",
                  duration: 120,
                  cost: 30,
                  rating: 4.7,
                  bestTime: "Morning",
                  scheduledDay: 3,
                  scheduledTime: "08:00",
                },
                {
                  cityId: tokyo.id,
                  activityName: "Meiji Shrine",
                  description: "Peaceful Shinto shrine in forested grounds",
                  activityType: "culture",
                  duration: 90,
                  cost: 0,
                  rating: 4.6,
                  bestTime: "Morning",
                  scheduledDay: 4,
                  scheduledTime: "10:00",
                },
                {
                  cityId: tokyo.id,
                  activityName: "TeamLab Borderless",
                  description: "Immersive digital art museum",
                  activityType: "culture",
                  duration: 180,
                  cost: 35,
                  rating: 4.9,
                  bestTime: "Evening",
                  scheduledDay: 5,
                  scheduledTime: "17:00",
                },
              ],
            },
          },
        ],
      },
      expenses: {
        create: [
          { category: "transport", amount: 950, date: trip2StartDate, note: "Round-trip flights" },
          { category: "transport", amount: 80, date: trip2StartDate, note: "JR Pass & local transport" },
          { category: "stay", amount: 1200, date: trip2StartDate, note: "Hotel accommodation" },
          { category: "meals", amount: 600, date: trip2StartDate, note: "Food & dining" },
          { category: "activities", amount: 90, date: trip2StartDate, note: "Attractions" },
        ],
      },
      packingItems: {
        create: [
          { itemName: "Passport & visa", category: "Documents", isPacked: false },
          { itemName: "JR Pass voucher", category: "Documents", isPacked: false },
          { itemName: "Universal adapter", category: "Electronics", isPacked: false },
          { itemName: "Pocket WiFi device", category: "Electronics", isPacked: false },
          { itemName: "Comfortable shoes", category: "Clothing", isPacked: false },
          { itemName: "Light rain jacket", category: "Clothing", isPacked: false },
          { itemName: "Reusable water bottle", category: "Accessories", isPacked: false },
        ],
      },
    },
  });

  console.log("✅ Trip 2 created: Tokyo Discovery");

  console.log("🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
