# Architecture Overview

SmartBooking follows **Clean Architecture** with four layers.
Each layer depends only on the one directly below it — never the reverse.

```
┌────────────────────────────────────┐
│         Presentation               │  Express routes, controllers, middlewares
├────────────────────────────────────┤
│         Application                │  Use cases, DTOs
├────────────────────────────────────┤
│         Domain                     │  Entities, interfaces (ports)
├────────────────────────────────────┤
│         Infrastructure             │  Prisma repos, Redis cache, services
└────────────────────────────────────┘
```

## Domain Layer

Pure business rules — no framework imports.

- **Entities**: `User`, `Booking`, `Business`, `Service`
  - Validation in constructor
  - Immutable (`readonly`)
  - Domain methods like `conflictsWith()`, `canBeCancelled()`
- **Interfaces** (ports): `IUserRepository`, `IBookingRepository`, `ICacheService`, etc.

## Application Layer

Orchestrates domain objects through **Use Cases**.

| Use Case | Description |
|----------|-------------|
| `RegisterUserUseCase` | Hash password, create user, return tokens |
| `LoginUserUseCase` | Verify credentials, issue JWT pair |
| `CreateBookingUseCase` | Validate service, check conflicts, create booking |

DTOs live here as the contract between presentation and application.

## Infrastructure Layer

Concrete implementations of domain interfaces.

| Component | Interface | Adapter |
|-----------|-----------|---------|
| PostgreSQL | `IUserRepository` | Prisma ORM |
| Redis | `ICacheService` | ioredis with reconnect |
| SMTP | `IEmailService` | Nodemailer |
| OpenAI | `IAIService` | GPT-3.5 + fallback |

## Presentation Layer

HTTP surface built with Express.

- **Controllers** — translate HTTP ↔ use case calls
- **Middlewares** — JWT auth, RBAC, rate limiting, error handler
- **Routes** — thin wiring (`router.post('/register', controller.register)`)

## Cross-Cutting Concerns

| Concern | Implementation |
|---------|---------------|
| Logging | Pino (JSON in prod, pretty in dev) |
| Auth | JWT access + refresh tokens, bcrypt |
| Security | Helmet, CORS, rate limiting |
| API Docs | Swagger / OpenAPI 3.0 |
| Real-time | Socket.io for booking events |
| Containers | Docker multi-stage + Compose (PG + Redis) |
| CI/CD | GitHub Actions (lint → test → Docker build) |

## Data Flow

```
Client → Express → Controller → Use Case → Repository → Database
                                   ↓
                              Cache (Redis)
                                   ↓
                           Email / AI Service
```
