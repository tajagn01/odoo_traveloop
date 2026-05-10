const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Creating test user...");
  const user = await prisma.user.create({
    data: {
      name: "Test User",
      email: "test_entry@traveloop.local",
      password: "hashed_password_mock",
    }
  });
  console.log("User created:", user.id);

  console.log("Creating test trip for user...");
  const trip = await prisma.trip.create({
    data: {
      userId: user.id,
      tripName: "Database Verification Trip",
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000 * 5),
    }
  });
  console.log("Trip created successfully:", trip.id);
  
  console.log("Cleaning up test data...");
  await prisma.trip.delete({ where: { id: trip.id } });
  await prisma.user.delete({ where: { id: user.id } });
  console.log("Cleaned up successfully.");
}

main()
  .catch(e => { console.error("Database Test Failed:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
