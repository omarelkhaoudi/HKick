# HKick Production Deployment

Recommended production setup:

- Backend API: Render web service
- Database: Render PostgreSQL
- Frontend: Vercel static Vite app

## 1. Backend on Render

Use the repository root and the included `render.yaml`.

Required environment variables:

```text
NODE_ENV=production
DATABASE_URL=<Render PostgreSQL internal connection string>
JWT_SECRET=<long random secret, at least 32 characters>
CLIENT_URL=https://your-frontend-domain.vercel.app
JSON_BODY_LIMIT=64kb
API_RATE_LIMIT_PER_MINUTE=180
PAYZONE_ORIGINATOR_ID=<Payzone originator ID>
PAYZONE_PASSWORD=<Payzone password>
PAYZONE_PAYMENT_BASE_URL=https://paiement.payzone.ma
PAYZONE_API_VERSION=002.70
```

Build command:

```bash
npm install --prefix backend && npm run prisma:generate --prefix backend
```

Start command:

```bash
npm run prisma:migrate:deploy --prefix backend && npm run start --prefix backend
```

Healthcheck:

```text
/health
```

## 2. Frontend on Vercel

Set Vercel project root to:

```text
frontend
```

Required environment variables:

```text
VITE_API_URL=https://your-hkick-api.onrender.com/api
VITE_SOCKET_URL=https://your-hkick-api.onrender.com
```

Build command:

```bash
npm run build
```

Output directory:

```text
dist
```

## 3. Deployment Order

1. Create Render PostgreSQL.
2. Deploy Render backend.
3. Copy backend URL.
4. Deploy Vercel frontend with `VITE_API_URL` and `VITE_SOCKET_URL`.
5. Update backend `CLIENT_URL` with the final Vercel domain.
6. Redeploy backend.
7. Test `/health`, auth, match creation, booking, Captain dashboard, Ops dashboard.

## 4. Final Production Checklist

- `JWT_SECRET` is not the development value.
- `CLIENT_URL` contains only trusted frontend origins.
- `DATABASE_URL` uses the production PostgreSQL database.
- Migrations are applied by `prisma migrate deploy`.
- Frontend env points to the production API.
- `/health` returns `{ "ok": true }`.
- Register/login works.
- Terrain list loads.
- Match creation works.
- Booking works.
- Captain confirmation/deposit/check-in works.
- Result and review save.
- Ops dashboard shows live Prisma data.

## 5. Real Payments

HKick includes a Payzone hosted payment-page integration for real card payments in MAD.

Required Payzone merchant credentials:

```text
PAYZONE_ORIGINATOR_ID
PAYZONE_PASSWORD
```

The app creates a match deposit, redirects the user to the hosted Payzone checkout page, then syncs the payment status when the user returns to the match lobby.

Do not collect card numbers inside HKick. Keep card entry on the hosted payment page.
