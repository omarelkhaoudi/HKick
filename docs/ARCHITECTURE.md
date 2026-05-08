# HKick Architecture

## Product Shape

HKick is built around fast football intent: players broadcast availability, captains create matches, teams are balanced automatically, and terrain slots can be reserved around the match flow.

## Frontend

- `frontend/src/pages/AuthPage.jsx`: login/register with player profile creation.
- `frontend/src/pages/HomePage.jsx`: live city feed, quick match creation, nearby available players.
- `frontend/src/pages/MatchPage.jsx`: match lobby, Socket.io room, team board, chat.
- `frontend/src/pages/TerrainsPage.jsx`: terrain discovery and slot booking.
- `frontend/src/pages/ProfilePage.jsx`: player summary, theme, logout.
- `frontend/src/services`: API and Socket.io clients.
- `frontend/src/store`: Zustand auth and app preferences.

## Backend

- `backend/src/server.js`: Express app, HTTP server, Socket.io bootstrap, route mounting.
- `backend/src/routes`: API route boundaries.
- `backend/src/controllers`: request validation, Prisma operations, response shaping.
- `backend/src/services/teamBalancer.js`: deterministic greedy balancing by player skill level.
- `backend/src/sockets/index.js`: authenticated sockets, city rooms, match rooms, live availability.
- `backend/src/middleware/auth.js`: JWT authentication.

## Database

The Prisma schema models:

- Users and player profiles.
- Matches with public/private visibility, status, owner, terrain, players, messages.
- Match players with assigned balanced teams.
- Terrains, available slots, and confirmed bookings.

## Realtime Events

- `availability:online`: marks a player available and broadcasts to their city.
- `availability:updated`: live player availability payload.
- `match:created`: new city match appears instantly.
- `match:updated`: player joins/leaves and team balancing updates.
- `match:join-room`: subscribes to a specific lobby.
- `chat:message`: live match chat message.
- `booking:created`: city-level terrain booking update.

## Auth Flow

1. Register creates `User` plus `PlayerProfile`.
2. Login/register return a JWT.
3. Frontend stores the token in `localStorage`.
4. API requests use `Authorization: Bearer <token>`.
5. Socket.io authenticates with the same token in `handshake.auth`.

## Production Next Steps

- Add Redis Socket.io adapter for multi-instance realtime.
- Add rate limiting, request logging correlation IDs, and structured error monitoring.
- Move images to object storage and support signed uploads.
- Add payment provider integration for terrain deposits.
- Add booking cancellation and owner approval rules.
- Evolve balancing with position constraints, reliability, and past performance.
