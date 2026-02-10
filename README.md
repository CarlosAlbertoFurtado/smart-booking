# SmartBooking API

![CI](https://github.com/CarlosAlbertoFurtado/smart-booking/actions/workflows/ci.yml/badge.svg)
![Node](https://img.shields.io/badge/node-20-green)
![TypeScript](https://img.shields.io/badge/typescript-5.3-blue)

Backend de agendamentos para negócios locais (barbearias, clínicas, salões). TypeScript, Express, Prisma, PostgreSQL.

---

## Motivação

Comecei esse projeto porque vi que a maioria das barbearias aqui perto ainda marca horário por WhatsApp. Funciona até ter duplo agendamento e o cliente ficar sem corte. Quis fazer algo simples — uma API que qualquer dev consegue plugar num frontend e já sai funcionando com auth, detecção de conflito de horário e notificação por email.

## Features

- **Auth multi-role** — cliente, profissional e admin com JWT (access + refresh)
- **Agendamentos com conflito** — não deixa marcar em cima de outro horário
- **Calcula o fim automaticamente** baseado na duração do serviço
- **CRUD de negócios e serviços** com preço e duração
- **Envio de email** de confirmação e cancelamento (Nodemailer)
- **Sugestão de horários via IA** — OpenAI com fallback se a key não estiver setada
- **Stats** — total de agendamentos, taxa de conclusão, receita
- **Rate limiting** e **Swagger docs** em `/api/docs`

## Tech

- TypeScript + Express + Zod (validação runtime)
- Prisma ORM → PostgreSQL
- Redis (ioredis) pra cache
- Socket.IO pra notificações real-time (parcialmente integrado)
- Pino pra logs estruturados em JSON
- Jest + Supertest nos testes
- Docker + GitHub Actions (CI)

## Arquitetura

Clean Architecture em 4 camadas. Tem um doc mais detalhado em [`docs/architecture.md`](docs/architecture.md).

```
src/
├── domain/          → entidades, interfaces dos repos
├── application/     → use cases, DTOs
├── infrastructure/  → Prisma, Redis, email, IA
├── presentation/    → rotas, controllers, middleware
└── shared/          → JWT, logger, erros, validators
```

## Como rodar

```bash
git clone https://github.com/CarlosAlbertoFurtado/smart-booking.git
cd smart-booking
cp .env.example .env      # preenche DATABASE_URL, JWT_SECRET etc

# com docker
docker-compose up -d && npx prisma migrate deploy

# sem docker
npm install && npx prisma migrate deploy && npm run dev
```

Swagger em http://localhost:3000/api/docs

## Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

POST   /api/bookings               (cria, detecta conflito)
GET    /api/bookings               (filtros + paginação)
GET    /api/bookings/:id
PATCH  /api/bookings/:id/confirm
PATCH  /api/bookings/:id/cancel
GET    /api/bookings/stats

POST   /api/businesses
GET    /api/businesses
GET    /api/businesses/:id
PATCH  /api/businesses/:id
DELETE /api/businesses/:id
```

## Testes

```bash
npm test
npm run test:coverage
```

39 testes passando (entidades, use cases com mock, integração da API).

## TODO

- [ ] Emitir eventos Socket.IO nos controllers de booking
- [ ] Deploy no Render

## Licença

MIT
