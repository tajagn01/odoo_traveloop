# Traveloop — Copilot workspace instructions

This project is **Traveloop**: a Next.js App Router app for multi-city trips, budgets, packing, notes, and sharing. See `README.md` for setup, demo account, routes, and environment variables.

## Checklist (complete)

- [x] Verify `copilot-instructions.md` exists under `.github`.
- [x] Clarify project requirements (Next.js, TypeScript, Prisma, NextAuth, Tailwind).
- [x] Scaffold / implement app structure and features.
- [x] Customize the project — Traveloop features implemented (trips, itinerary builder, budget, packing, notes, share, admin).
- [x] Install required extensions — none specified for this workspace; skipped.
- [x] Compile — run `npm install`, `npm run lint`, `npm run build`; resolve TypeScript and ESLint issues.
- [x] Create/run VS Code task — use `package.json` scripts (`npm run dev`, `npm run build`); no extra task file required.
- [x] Launch — start locally with `npm run dev` when you want to run the app.
- [x] Documentation — `README.md` and this file are present and current.

## Notes for contributors

- After cloning: copy `.env.example` to `.env`, run `npm run db:push` and `npm run db:seed` per README.
- Regenerate the Prisma client after schema changes: `npx prisma generate` (requires valid `DATABASE_URL` for CLI validation).
- Prisma is pinned to v6.x so the schema may keep `datasource.url` and client generation works without Prisma 7 config migration.
