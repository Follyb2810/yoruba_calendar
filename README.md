# Kọ́jọ́dá — Yoruba Calendar

A community platform for tracking Yoruba festivals, honoring the Orisa, and managing cultural events.

## Features

- **Yoruba Calendar** — 4-day week cycle with traditional date names
- **Festival Directory** — Browse published community events
- **Orisa Guide** — Reference for deities and their festivals
- **Event Creator Dashboard** — Create, draft, publish, and manage events with tickets
- **Authentication** — Email/password + Google, GitHub, Twitter via NextAuth

## Tech Stack

- Next.js 16 (App Router)
- PostgreSQL + Prisma 7
- NextAuth v5 (JWT sessions)
- Tailwind CSS 4 + Radix UI
- Zod + Formik validation

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

### 3. Set up the database (local SQLite)

```bash
npm run db:local
```

This runs `prisma db push` (no migrations needed) and seeds Orisas + sample festivals.

> **Production (PostgreSQL):** Uncomment the Postgres lines in `prisma/schema.prisma`, `prisma.config.ts`, `utils/prisma-client.ts`, and set your Supabase/Postgres `DATABASE_URL` in `.env`. Then run `npx prisma migrate deploy`.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | SQLite locally: `file:./dev.db` — Postgres in production |
| `NEXTAUTH_SECRET` | Secret for session signing (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | App URL (e.g. `http://localhost:3000`) |
| `NEXT_PUBLIC_BASE_URL` | Public base URL for server-side fetches |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth (optional) |
| `GITHUB_ID` / `GITHUB_SECRET` | GitHub OAuth (optional) |
| `TWITTER_ID` / `TWITTER_SECRET` | Twitter OAuth (optional) |
| `JWT_SECRET` | Mobile API token signing (defaults to NEXTAUTH_SECRET) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Seed admin account (optional) |

## Project Structure

```
app/
  (public)/     # Calendar, festivals, orisha pages
  dashboard/    # Authenticated creator dashboard
  api/          # REST API routes
module/         # Domain services (Festival, Orisa, Ticket, User)
components/     # UI components
utils/          # Shared utilities
prisma/         # Schema and migrations
```

## API Overview

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/festivals` | Public | List published festivals |
| GET | `/api/festivals?mine=true&filter=` | User | List own events |
| POST | `/api/festivals` | User | Create event |
| GET | `/api/festivals/:id` | Public* | Festival details |
| PATCH | `/api/festivals/:id` | Owner | Update or publish |
| DELETE | `/api/festivals/:id` | Owner | Delete event |
| GET | `/api/orisha` | Public | List Orisas |

*Draft festivals only visible to the owner.

## Default Admin (after seed)

- Email: `admin@dev.com` (or `ADMIN_EMAIL`)
- Password: `admin1234` (or `ADMIN_PASSWORD`)

## Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run db:local       # Push schema + seed (local SQLite)
npm run prisma:push    # Sync schema without migrations
npm run seeder         # Seed Orisas, roles, sample festivals
```
