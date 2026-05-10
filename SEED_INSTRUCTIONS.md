# Seed Demo Data

This will create demo trips with full itineraries in your database.

## What Gets Created:

### Demo User
- **Email:** demo@traveloop.com
- **Password:** demo123

### Trip 1: European Summer Adventure (13 days)
- **Stops:** Paris → Barcelona → Rome
- **Activities:** 12 activities across 3 cities
  - Paris: Eiffel Tower, Louvre, Seine Cruise, Montmartre
  - Barcelona: Sagrada Familia, Park Güell, Beach, Gothic Quarter
  - Rome: Colosseum, Vatican, Trevi Fountain, Roman Forum
- **Budget:** $4,500
- **Expenses:** Flights, trains, meals, activities
- **Packing List:** 8 items

### Trip 2: Tokyo Discovery (7 days)
- **Stops:** Tokyo
- **Activities:** 6 activities
  - Senso-ji Temple, Shibuya Crossing, Tokyo Skytree
  - Tsukiji Market, Meiji Shrine, TeamLab Borderless
- **Budget:** $3,500
- **Expenses:** Flights, JR Pass, accommodation, meals
- **Packing List:** 7 items

## How to Run:

```bash
# Run the seed script
npm run db:seed
```

## After Seeding:

1. Login with: demo@traveloop.com / demo123
2. Go to "My Trips" in the sidebar
3. You'll see 2 demo trips with complete itineraries
4. Click on any trip to view the full itinerary with activities, budget, and packing list

## Reset Database (Optional):

If you want to start fresh:

```bash
# Reset database and run seed
npx prisma migrate reset
```

This will:
1. Drop all data
2. Run migrations
3. Automatically run the seed script
