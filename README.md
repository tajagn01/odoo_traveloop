# Traveloop

Traveloop is a personalized travel planning app for multi-city itineraries, budgets, packing lists, notes, and public sharing.

## Tech stack

- Next.js App Router with TypeScript
- Tailwind CSS and ShadCN UI
- PostgreSQL with Prisma ORM
- NextAuth credentials authentication
- Cloudinary for image uploads
- Recharts for charts

## Setup

1. Install dependencies
	npm install
2. Create a local environment file
	Copy .env.example to .env and fill in values
3. Initialize the database
	npm run db:push
4. Seed demo data
	npm run db:seed
5. Start the dev server
	npm run dev

## Demo account

- Email: demo@traveloop.local
- Password: Password123!

## Key routes

- /login
- /signup
- /forgot-password
- /dashboard
- /trips
- /trips/new
- /trips/[id]
- /trips/[id]/builder
- /trips/[id]/budget
- /trips/[id]/packing
- /trips/[id]/notes
- /profile
- /share/[token]
- /admin

## Notes

- Cloudinary keys are required for image uploads.
- ADMIN_EMAILS controls access to the admin dashboard.
