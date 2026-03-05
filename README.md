# SmartBooking API

![CI](https://github.com/CarlosAlbertoFurtado/smart-booking/actions/workflows/ci.yml/badge.svg)
![Node](https://img.shields.io/badge/node-20-green)
![License](https://img.shields.io/badge/license-MIT-green)

Booking management REST API for small businesses — barber shops, clinics, salons, etc.

Built with **TypeScript**, **Express**, **Prisma**, **PostgreSQL**, **Redis**, and **Socket.IO**.

![TypeScript](https://img.shields.io/badge/typescript-5.3-blue)
![Node](https://img.shields.io/badge/node-20-green)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Why this exists

Small businesses in Brazil still manage appointments via WhatsApp. It works until it doesn't — double bookings, forgotten appointments, no visibility on revenue. SmartBooking provides the backend for a proper scheduling system.

## What it does

- **Multi-role auth** — clients book, professionals manage their schedules, admins see everything (JWT + refresh tokens)
- **Booking CRUD** — create, list, confirm, cancel. Includes conflict detection (no double-booking)
- **Time slot management** — validates start/end times, calculates duration from service config
- **Business & services** — each professional belongs to a business, each business has services with price + duration
- **Real-time updates** — Socket.IO rooms per business/professional, so the frontend can update instantly
- **Booking stats** — total bookings, completion rate, revenue for a given period
- **Rate limiting** — configurable per-window limits
- **API docs** — Swagger UI auto-generated

## Tech stack

| What | Why |
|------|-----|
| TypeScript | Type safety across the stack |
| Express | Mature, well-documented |
| Prisma | Type-safe ORM, great DX with migrations |
| PostgreSQL | Reliable for transactional data |
| Redis (ioredis) | Cache frequently accessed data |
| Socket.IO | Real-time booking notifications |
| Zod | Runtime request validation |
| Pino | Structured JSON logging |
| Jest | Unit tests |
| Docker | Dev environment + CI |
| GitHub Actions | Lint → test → build |

## Architecture

Clean Architecture with separated layers:

```
src/
├── domain/          # Entities (User, Booking, Business, Service) + repository interfaces
├── application/     # Use cases (RegisterUser, LoginUser, CreateBooking) + DTOs
├── infrastructure/  # Prisma repos, Redis cache
├── presentation/    # Express routes, controllers, auth middleware
└── shared/          # App config, error classes, JWT utils, logger, validators
```

## Quick start

```bash
git clone https://github.com/CarlosAlbertoFurtado/smart-booking.git
cd smart-booking

cp .env.example .env

# with docker
docker-compose up -d
npx prisma migrate deploy

# or locally
npm install
npx prisma migrate deploy
npm run dev
```

API docs at http://localhost:3000/api/docs

## API overview

```
POST   /api/auth/register       → create account
POST   /api/auth/login          → get JWT tokens
GET    /api/auth/me             → current user

POST   /api/bookings            → create booking (conflict detection)
GET    /api/bookings            → list with filters & pagination
GET    /api/bookings/:id        → get by id
PATCH  /api/bookings/:id/confirm → confirm (admin/professional)
PATCH  /api/bookings/:id/cancel  → cancel
GET    /api/bookings/stats       → booking statistics
```

## Running tests

```bash
npm test                 # all tests
npm run test:coverage    # with coverage report
```

## WebSocket events

Clients can connect to Socket.IO and join rooms:

```js
socket.emit('join:business', businessId);
socket.emit('join:professional', professionalId);
```

The API emits events when bookings are created/updated (TODO: wire up emitters in controllers).

## Known limitations / TODO

- [ ] Business CRUD endpoints not yet exposed (entity + repo ready)
- [ ] Service CRUD endpoints not yet exposed
- [ ] WebSocket emitters not wired to booking create/update yet
- [ ] OAuth (Google) login — interface defined, not implemented
- [ ] Email notifications — interface defined, not implemented
- [ ] AI scheduling suggestions — interface defined, not implemented

## License

MIT
