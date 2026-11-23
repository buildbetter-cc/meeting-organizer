# BetterMeet

A group meeting scheduler, similar to Doodle. An organizer proposes time slots, participants vote, and the organizer picks the final time. No accounts needed.

See [spec.md](spec.md) for the MVP specification. The UI follows the buildbetter Design System.

## Stack

Next.js 15 (App Router, TypeScript), Tailwind CSS 4, Prisma 6 with Postgres (Neon), Vitest and Testing Library.

## Setup

1. Install dependencies:
   ```sh
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in your Neon connection strings:
   - `DATABASE_URL`: the pooled connection string (host contains `-pooler`)
   - `DIRECT_URL`: the direct connection string, used for migrations
3. Create the database tables:
   ```sh
   npx prisma migrate dev
   ```
4. Start the dev server at http://localhost:3000:
   ```sh
   npm run dev
   ```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm test` | Run the unit tests once |
| `npm run test:watch` | Run the tests in watch mode |
| `npm run lint` | Lint the code |
| `npm run build` | Generate the Prisma client, apply migrations, then build (used by Vercel) |

## Code layout

- `src/lib/poll-service.ts`: business rules (create, vote, edit, finalize). Talks to storage through the `PollRepository` interface in `src/lib/types.ts`.
- `src/lib/prisma-repo.ts`: the Postgres implementation of that interface.
- `src/lib/validation.ts`: input validation, shared by the API and the create form.
- `src/app/api/`: JSON API routes.
- `src/app/p/[id]/`: participant page. `src/app/p/[id]/admin/[token]/`: organizer page.
- `src/components/`: UI components built on the buildbetter tokens in `src/app/globals.css`.
