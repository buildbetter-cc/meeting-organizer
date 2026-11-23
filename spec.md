# BetterMeet: MVP Specification

## Goal

BetterMeet is a minimal group meeting poll. One organizer proposes candidate time slots, participants vote on them, and the organizer picks the final time. No user accounts.

## Features

### 1. Create a poll (organizer)

- Fields: title (required), description (optional), location (optional), organizer name (required).
- One or more candidate time slots, each with a date, start time and end time.
- After saving, the organizer receives two links:
  - **Participant link** (`/p/{pollId}`): shared with everyone.
  - **Admin link** (`/p/{pollId}/admin/{adminToken}`): kept private, used to manage the poll.

### 2. Vote (participant)

- Open the participant link. No account or login is needed.
- Enter a name (required).
- Mark each slot **Yes** or **No**.
- Submit. A vote can be edited later using an edit token stored in the browser.

### 3. View results (everyone)

- A grid with participants as rows and slots as columns, showing each answer.
- A "Yes" count for each slot, with the best slot highlighted.

### 4. Finalize (organizer)

- From the admin link, the organizer picks the final slot.
- The poll's status becomes `closed`, and the chosen time is shown on the participant page.
- A closed poll accepts no new votes and no vote edits.

## Data model

```
Poll         id, title, description, location, organizer_name,
             admin_token, status (open|closed), final_slot_id, created_at
Slot         id, poll_id, start_at, end_at
Vote         id, poll_id, participant_name, edit_token, created_at
VoteChoice   vote_id, slot_id, answer (yes|no)
```

- `Poll`, `Slot` and `Vote` are the main tables. `VoteChoice` joins a vote to its answer for each slot.
- Times are stored in UTC and displayed in the browser's local time zone.
- `admin_token` and `edit_token` are random, hard-to-guess strings.

## Pages and API

| Page | API |
|---|---|
| `/`: create poll form | `POST /api/polls` |
| `/p/:id`: vote and results grid | `GET /api/polls/:id`, `POST /api/polls/:id/votes`, `PUT /api/votes/:voteId` |
| `/p/:id/admin/:token`: manage poll | `POST /api/polls/:id/finalize` |

## Validation rules

- A poll must have a title, an organizer name and at least one slot.
- Each slot's end time must be after its start time.
- A vote must have a participant name and an answer for every slot.
- Editing a vote requires the matching `edit_token`.
- Finalizing requires the matching `admin_token`, and the chosen slot must belong to the poll.
- A closed poll rejects new votes and vote edits.

## Out of scope (for later)

- User accounts and login
- "If need be" (maybe) answers
- Email notifications and calendar invites (.ics)
- Time-zone selection and conversion beyond local display
- Calendar sync, booking pages, 1:1 scheduling
- Hidden polls, vote limits, deadlines

## Tech stack

- **Next.js (TypeScript)**: frontend and API in one project
- **Postgres + Prisma**: database and ORM (Prisma provider `postgresql`)
- **Tailwind CSS**: styling

## Hosting

- **App:** Vercel, deploying automatically from the GitHub repo. Each pull request gets a preview deployment.
- **Database:** Neon (serverless Postgres).
- **Why not SQLite in production:** Vercel's filesystem does not persist between requests or deploys, so a SQLite file would lose data.
- **Local development:** a local Postgres instance or a separate Neon development branch, set via `DATABASE_URL`.

### Deployment steps

1. Push the repo to GitHub.
2. Create a Neon project and copy its connection string.
3. Import the repo in Vercel and set `DATABASE_URL` in the project's environment variables.
4. Run `prisma migrate deploy` as part of the build to apply the schema.
5. Deploy.

## Build order

1. Set up the project and the database schema.
2. Create-poll form and API.
3. Participant page with the voting form.
4. Results grid with the counts.
5. Admin page with finalizing.
6. Validation rules (see above).
