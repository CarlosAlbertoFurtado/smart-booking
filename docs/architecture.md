# Arquitetura

Clean Architecture em 4 camadas. Cada camada depende só da de baixo.

```
Presentation  → rotas Express, controllers, middlewares
Application   → use cases, DTOs
Domain        → entidades, interfaces (ports)
Infrastructure → Prisma, Redis, email, IA
```

## Domain

Regras de negócio puras, sem import de framework.

- Entidades: `User`, `Booking`, `Business`, `Service`
- Validação no construtor, campos readonly
- Métodos de domínio: `conflictsWith()`, `canBeCancelled()`
- Interfaces: `IUserRepository`, `IBookingRepository`, `ICacheService`

## Application

Use cases orquestram as entidades:

- `RegisterUserUseCase` — hash senha, cria user, retorna tokens
- `LoginUserUseCase` — valida credenciais, emite JWT
- `CreateBookingUseCase` — valida serviço, checa conflito, cria agendamento

DTOs são o contrato entre presentation e application.

## Infrastructure

Implementações concretas das interfaces do domain:

- PostgreSQL via Prisma (repos de User, Booking, Business)
- Redis via ioredis (cache com reconnect)
- Nodemailer (email de confirmação/cancelamento)
- OpenAI GPT-3.5 (sugestão de horários, com fallback)

## Presentation

Camada HTTP com Express:

- Controllers traduzem HTTP <> use case
- Middlewares de auth (JWT), RBAC, rate limit, error handler
- Routes fazem o wiring (`router.post('/register', ctrl.register)`)

## Fluxo

```
Request → Express → Controller → UseCase → Repository → PostgreSQL
                                   ↓
                              Redis (cache)
                                   ↓
                            Email / IA service
```
