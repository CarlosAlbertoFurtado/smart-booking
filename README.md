<div align="center">

# 🗓️ SmartBooking

### Sistema Inteligente de Agendamento para Negócios Locais

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)

**API REST completa para gerenciamento de agendamentos, construída com Clean Architecture**

[📚 Documentação API](#-api-documentation) · [🚀 Quick Start](#-quick-start) · [🏗️ Arquitetura](#️-arquitetura) · [🧪 Testes](#-testes)

</div>

---

## 🎯 O Problema

Pequenos negócios locais (barbearias, salões, clínicas, studios) ainda dependem de **WhatsApp** ou **agendas de papel** para gerenciar seus agendamentos. Isso causa:

- ❌ Conflitos de horário (dois clientes no mesmo horário)
- ❌ No-shows sem controle ou penalidade
- ❌ Perda de receita por falta de organização
- ❌ Impossibilidade de analisar dados do negócio

## 💡 A Solução

**SmartBooking** é uma API REST robusta que resolve esses problemas oferecendo:

- ✅ **Agendamento com detecção de conflitos** em tempo real
- ✅ **Dashboard com métricas** (faturamento, no-shows, taxa de ocupação)
- ✅ **Notificações por email** (confirmação, cancelamento, lembrete)
- ✅ **Sugestões inteligentes de horários** com IA (OpenAI)
- ✅ **Atualizações em tempo real** via WebSocket
- ✅ **Multi-negócios** (um admin pode gerenciar vários estabelecimentos)

---

## ✨ Features

| Feature | Descrição | Status |
|---------|-----------|--------|
| 🔐 **Auth JWT + OAuth** | Login com email/senha ou Google, refresh tokens | ✅ |
| 👥 **RBAC** | Roles: Admin, Profissional, Cliente | ✅ |
| 📅 **Booking System** | CRUD completo com detecção de conflitos | ✅ |
| 🏢 **Multi-Business** | Suporte a múltiplos negócios | ✅ |
| 💇 **Services** | Cadastro de serviços com duração e preço | ✅ |
| 📊 **Dashboard/Stats** | Métricas de faturamento, no-shows, etc. | ✅ |
| 🔔 **Email Notifications** | Confirmação, cancelamento, lembrete | ✅ |
| ⚡ **WebSocket** | Atualizações em tempo real | ✅ |
| 🧠 **AI Suggestions** | Horários ótimos via OpenAI | ✅ |
| 🗃️ **Cache Redis** | Rate limiting + cache de consultas | ✅ |
| 📝 **Swagger Docs** | Documentação interativa automática | ✅ |
| 🐳 **Docker** | Docker Compose com PostgreSQL + Redis | ✅ |
| 🧪 **Tests** | Jest + Supertest (unit + integration) | ✅ |
| 🔄 **CI/CD** | GitHub Actions (lint, test, build, deploy) | ✅ |

---

## 🏗️ Arquitetura

O projeto segue **Clean Architecture** com separação clara de responsabilidades:

```
src/
├── domain/               # 🧩 Entidades e regras de negócio
│   ├── entities/         #    User, Booking, Business, Service
│   └── interfaces/       #    Contratos (Repository Pattern)
│
├── application/          # 📋 Casos de uso
│   ├── use-cases/        #    CreateBooking, RegisterUser, LoginUser...
│   └── dtos/             #    Data Transfer Objects
│
├── infrastructure/       # 🔧 Implementações concretas
│   ├── database/         #    Prisma (PostgreSQL)
│   ├── cache/            #    Redis
│   ├── repositories/     #    Implementações dos repositórios
│   └── services/         #    Email, AI (OpenAI)
│
├── presentation/         # 🌐 Interface HTTP
│   ├── controllers/      #    AuthController, BookingController
│   ├── routes/           #    Express routes
│   └── middlewares/      #    Auth, Error Handler, Validation
│
└── shared/               # 🔗 Utilitários compartilhados
    ├── errors/           #    Custom error classes
    ├── utils/            #    JWT, Logger
    └── validators/       #    Zod schemas
```

### Design Patterns Utilizados

| Pattern | Uso |
|---------|-----|
| **Repository Pattern** | Abstrai acesso a dados (troca Prisma por outro ORM sem mudar use cases) |
| **Dependency Injection** | Use cases recebem interfaces, não implementações |
| **Factory Pattern** | Geração de entidades com validação |
| **Middleware Pattern** | Auth, error handling, rate limiting |
| **Observer Pattern** | WebSocket para eventos em tempo real |

---

## 🚀 Quick Start

### Pré-requisitos

- Node.js 20+
- Docker & Docker Compose
- Git

### 1. Clone o repositório

```bash
git clone https://github.com/CarlosAlbertoFurtado/smart-booking.git
cd smart-booking
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
# Edite o .env com suas chaves
```

### 3. Rode com Docker (recomendado)

```bash
# Sobe PostgreSQL + Redis + App
docker-compose up -d

# Rode as migrations
npm run prisma:migrate
```

### 4. Ou rode localmente

```bash
# Instale dependências
npm install

# Gere o client Prisma
npx prisma generate

# Rode as migrations
npx prisma migrate dev

# Inicie em modo desenvolvimento
npm run dev
```

### 5. Acesse

- 🌐 **API:** http://localhost:3000
- 📚 **Swagger:** http://localhost:3000/api/docs
- 💚 **Health:** http://localhost:3000/api/health

---

## 📚 API Documentation

A documentação interativa está disponível em `/api/docs` (Swagger UI).

### Principais Endpoints

#### Auth
```
POST   /api/auth/register    # Registro de usuário
POST   /api/auth/login       # Login (retorna JWT)
GET    /api/auth/me           # Dados do usuário autenticado
```

#### Bookings
```
POST   /api/bookings          # Criar agendamento
GET    /api/bookings          # Listar (com filtros e paginação)
GET    /api/bookings/:id      # Buscar por ID
PATCH  /api/bookings/:id/confirm  # Confirmar agendamento
PATCH  /api/bookings/:id/cancel   # Cancelar agendamento
GET    /api/bookings/stats    # Estatísticas do negócio
```

#### Exemplo de Request

```bash
# Registro
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "carlos@email.com",
    "password": "minhasenha123",
    "name": "Carlos Jr"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "carlos@email.com",
    "password": "minhasenha123"
  }'

# Criar agendamento (autenticado)
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "professionalId": "uuid-do-profissional",
    "serviceId": "uuid-do-servico",
    "businessId": "uuid-do-negocio",
    "date": "2026-03-15",
    "startTime": "14:00"
  }'
```

---

## 🧪 Testes

```bash
# Rodar todos os testes
npm test

# Testes em modo watch
npm run test:watch

# Com coverage
npm run test:coverage
```

### Cobertura de Testes

Os testes cobrem:
- ✅ Entidades de domínio (validação, regras de negócio)
- ✅ Casos de uso (lógica de aplicação)
- ✅ Detecção de conflitos de horário
- ✅ Autenticação e autorização

---

## 🐳 Docker

```bash
# Subir todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f app

# Derrubar
docker-compose down

# Limpar volumes (reset banco)
docker-compose down -v
```

### Serviços

| Serviço | Porta | Detalhes |
|---------|-------|----------|
| **API** | 3000 | Node.js + Express |
| **PostgreSQL** | 5432 | Banco principal |
| **Redis** | 6379 | Cache + Rate Limiting |

---

## 🔄 CI/CD

O projeto usa **GitHub Actions** para:

1. **Lint** — Verifica qualidade do código
2. **Test** — Roda testes com PostgreSQL e Redis reais (service containers)
3. **Build** — Compila TypeScript
4. **Docker Build** — Constrói imagem Docker
5. **Coverage** — Envia relatório para Codecov

---

## 🛠️ Tech Stack

| Tecnologia | Propósito |
|-----------|-----------|
| **TypeScript** | Tipagem estática e autocompletação |
| **Express** | Framework HTTP |
| **Prisma** | ORM type-safe para PostgreSQL |
| **PostgreSQL** | Banco de dados relacional |
| **Redis** | Cache, rate limiting, sessões |
| **Socket.io** | WebSocket para real-time |
| **Zod** | Validação de schemas |
| **JWT** | Autenticação stateless |
| **Pino** | Logging estruturado |
| **Jest** | Framework de testes |
| **Docker** | Containerização |
| **GitHub Actions** | CI/CD |
| **Swagger** | Documentação automática |

---

## 📖 Desafios Técnicos Superados

### 1. Detecção de Conflitos de Horário
Implementei um algoritmo que verifica sobreposição de intervalos de tempo para garantir que nenhum profissional tenha dois agendamentos no mesmo horário.

### 2. Clean Architecture em Node.js
Apliquei separação clara entre camadas (Domain, Application, Infrastructure, Presentation) permitindo trocar o banco de dados ou framework sem alterar regras de negócio.

### 3. Cache Inteligente
Redis é usado não apenas para cache, mas também para rate limiting por IP e invalidação seletiva de cache quando um agendamento é criado/alterado.

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie sua branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

---

<div align="center">

**Feito com ❤️ por [Carlos Alberto Furtado](https://github.com/CarlosAlbertoFurtado)**

⭐ Se este projeto te ajudou, deixe uma estrela!

</div>
