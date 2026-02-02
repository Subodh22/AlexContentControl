# MasterControl

Next.js + Clerk + Convex Kanban MVP.

## Setup

1) Install deps

```bash
npm install
```

2) Create `.env.local`

Copy `.env.example` → `.env.local` and fill Clerk keys.

```bash
cp .env.example .env.local
```

3) Convex

```bash
npx convex dev
```

4) Run Next

```bash
npm run dev
```

## Clerk Webhook (optional)

Route: `POST /api/webhooks/clerk`

Set `CLERK_WEBHOOK_SECRET` in `.env.local`.

This MVP also upserts the Clerk user from the client on first load (not production-grade).
