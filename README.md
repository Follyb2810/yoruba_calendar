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
| `PAYSTACK_SECRET_KEY` | Paystack secret key for book & ticket payments |
| `RESEND_API_KEY` | Resend API key for order confirmation emails |
| `EMAIL_FROM` | Sender address for transactional email |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Image uploads for books & events |
| `OWNER_EMAIL` | Your email — auto-grants SUPERADMIN + ADMIN + CREATOR on sign-in |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Dev seed admin account (defaults below) |

## Roles & access

### Platform owner (you)

1. Add your email to `.env`:
   ```bash
   OWNER_EMAIL=you@example.com
   ```
2. Sign up or sign in with Google (or email) using that address.
3. On sign-in, you automatically receive **SUPERADMIN**, **ADMIN**, **CREATOR**, and **MODERATOR** roles.
4. Open **Dashboard → Team** to grant roles to other users.

For local dev without Google, the seed also creates an admin account using `OWNER_EMAIL` (or `ADMIN_EMAIL`).

### Upgrade someone to Creator

**Self-service (any member):** Dashboard → **Become Creator** → Activate Creator Access.

**Admin grant:** Dashboard → **Team** → enter their email → role **CREATOR** → Grant.  
(They must have signed up first.)

**Admins** can grant Creator and Moderator. **SUPERADMIN** (platform owner) can also grant Admin roles.

### Book order notifications (sellers)

Creators see **Dashboard → Orders** with a badge for new paid orders (books and tickets). Expand an order for buyer contact and fulfillment details. **Email confirmations** are sent to buyers and sellers/organizers when `RESEND_API_KEY` is set (logged to console in dev without it).

### Event tickets

- **Paid tickets:** Paystack checkout on the festival detail page (sign-in required).
- **Free tickets:** Instant reservation via **Reserve free ticket** (no payment).
- Organizers see ticket orders under **Dashboard → Orders → Ticket orders**.

## Payment & fulfillment lifecycle

There are **two separate steps**: collecting payment, then closing the order after delivery/event.

### 1. Payment (automatic — at checkout)

| Step | What happens |
|------|----------------|
| Buyer pays on Paystack | Order created as `PENDING` |
| Paystack confirms | Order → `SUCCESS`, stock/tickets decremented, emails sent |
| Confirmation | Buyer redirect **or** Paystack webhook (`/api/paystack/webhook`) |

**Production webhook** — In [Paystack Dashboard → Settings → Webhooks](https://dashboard.paystack.com):

- URL: `https://yourdomain.com/api/paystack/webhook`
- Events: `charge.success`, `charge.failed`, `transfer.success`, `transfer.failed`, `transfer.reversed`

### 2. Fulfillment + creator payout (when order is complete)

| Who | Action |
|-----|--------|
| **Creator** | Dashboard → **Payouts** → connect bank account (once) |
| **Book seller** | Orders → **Mark as delivered / picked up** |
| **Organizer** | Orders → Ticket orders → **Mark as attended / fulfilled** |

On fulfill:
1. Buyer gets email with **rate your experience** link
2. Platform fee (`PLATFORM_FEE_PERCENT`, default 10%) is deducted
3. Remainder is **transferred to creator's bank** via Paystack Transfer
4. Webhook `transfer.success` marks payout **Completed**

If creator has no bank account, payout stays **Pending** — connect bank under Payouts, then **Retry creator payout** on the order.

### 3. Buyer satisfaction

After fulfillment, buyers receive `/feedback/[token]` (also in email):

- Rate **1–5 stars** + optional comment
- Creators see ratings on **Dashboard → Orders** (`Buyer rating: 4/5`)

**Awaiting buyer feedback** = fulfilled but not yet rated.


## Public vs authenticated access

| Area | Login required? |
|------|-----------------|
| Calendar, Orisa, Festivals list/detail | No |
| Book shop list/detail | No |
| Book checkout (Paystack) | Yes |
| Creator dashboard (events, books, orders) | Yes + Creator role |
| Team / admin roles | Yes + Admin |

## Production checklist

Before deploying:

1. Set `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, and `NEXT_PUBLIC_BASE_URL` to your live domain.
2. Set `OWNER_EMAIL` to your account email.
3. Switch `prisma/schema.prisma` to PostgreSQL and run `prisma migrate deploy`.
4. Configure Paystack live keys and Cloudinary for uploads.
5. Set Google OAuth redirect URIs for production.
6. Run `npm run build` and `npm start` locally to verify.

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
| POST | `/api/festivals` | Creator | Create event |
| GET | `/api/festivals/:id` | Public* | Festival details |
| PATCH | `/api/festivals/:id` | Owner | Update or publish |
| DELETE | `/api/festivals/:id` | Owner | Delete event |
| GET | `/api/orisha` | Public | List Orisas |
| GET | `/api/books` | Public | List published books |
| GET | `/api/books/:id` | Public* | Book details |
| POST | `/api/paystack/initialize` | User | Start book checkout |

*Draft books only visible to owner/admin.

## Default Admin (after seed)

- Email: value of `OWNER_EMAIL` or `ADMIN_EMAIL` (default `admin@dev.com`)
- Password: `admin1234` (or `ADMIN_PASSWORD`) — email/password sign-in only

## Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run db:local       # Push schema + seed (local SQLite)
npm run prisma:push    # Sync schema without migrations
npm run seeder         # Seed Orisas, roles, sample festivals
```
