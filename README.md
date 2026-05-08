# HKick

HKick is a modern real-time football reservation and matchmaking platform: instant matches, nearby player availability, smart team balancing, terrain booking, match chat, and live updates.

## Stack

- Frontend: React, Vite, Tailwind CSS, React Router, Framer Motion, Zustand
- Backend: Node.js, Express.js, Socket.io
- Database: PostgreSQL, Prisma ORM
- Auth: JWT

## Run Locally

1. Install dependencies:

```bash
npm run install:all
```

2. Create `backend/.env` from `backend/.env.example` and set `DATABASE_URL` plus `JWT_SECRET`.

3. Prepare the database:

```bash
npm run prisma:migrate
npm run seed
```

4. Start both apps:

```bash
npm run dev
```

Frontend: `http://localhost:5173`

Backend: `http://localhost:4000`

## Project Structure

```text
backend/   Express API, JWT auth, Socket.io, Prisma access
frontend/  React/Vite mobile-first app
prisma/    Database schema and migrations
docs/      Product and architecture notes
```

## MVP Roadmap

1. Private beta: auth, profiles, terrain discovery, create/join/leave matches, live match lobby, team balancing.
2. Real-time growth loop: nearby availability pulses, match chat, push-ready notifications, invite links, private match codes.
3. Venue operations: terrain owner dashboard, booking calendar, payments, cancellation rules.
4. Intelligence layer: player reliability score, smarter balancing by position and history, match recommendations.
5. Scale: Redis Socket.io adapter, job queue, observability, rate limiting, media storage, multi-city launch tooling.
