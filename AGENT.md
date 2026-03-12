# Project Agent Context

## Project Name

technical-test

## Objective

Build a backend API using NestJS + TypeScript with Hexagonal Architecture and Clean Architecture.

The system must use:

- MongoDB
- Mongoose
- JWT Authentication
- TDD
- Docker
- AWS ECS
- AWS CDK
- GitHub Actions

The project must be structured so an AI agent can safely generate code without breaking architecture.

---

## Architecture

Hexagonal Architecture + Clean Architecture.

### Layers

- HTTP Layer
- Application Layer
- Domain Layer
- Infrastructure Layer

### Rules

- Domain cannot depend on NestJS or Mongoose
- Controllers cannot contain business logic
- Repositories are defined as interfaces
- Infrastructure implements persistence

---

## Technology Stack

### Backend
- Node.js
- NestJS
- TypeScript

### Database
- MongoDB
- Mongoose

### Testing
- Jest

### Infra
- Docker
- AWS ECS
- AWS CDK

### CI/CD
- GitHub Actions

---

## Deployment Model

This is a POC — optimized for simplicity and low cost.

- **MongoDB**: MongoDB Atlas M0 (free tier) — connects via MONGODB_URI, fully compatible with Mongoose
- **API**: AWS ECS Fargate — single service running the NestJS container
- **Registry**: AWS ECR — stores the Docker image

No mongo ECS service needed. Atlas handles the database externally.

---

## Domain Models

### User

Fields: id, email, passwordHash, role, status, createdAt, updatedAt

Roles and permissions:
- admin → full access (create, read, update, delete)
- manager → create, read, update (no delete)
- customer → read only

Role assignment rules:
- POST /auth/register with no role → always creates customer
- Only admin can assign admin or manager roles
- manager can only create customers

### Product

Fields: id, name, sku, description, picture, price, currency, stock, category, status, tags, createdAt, updatedAt

Notes:
- currency is always USD (no multi-currency)

Indexes: sku (unique), category, price, status

### Order

Fields: id, identifier, clientName, clientEmail, items, subtotal, tax, total, status, createdAt, updatedAt

Notes:
- identifier is a UUID
- status values: pending | confirmed | shipped | delivered | cancelled
- discount is applied at item level (see OrderItem)

### OrderItem

Fields: productId, sku, name, picture, unitPrice, quantity, discount, lineTotal

Notes:
- discount applied per item
- lineTotal = (unitPrice * quantity) - discount

---

## Endpoints

### Auth
- `POST /auth/register`
- `POST /auth/login`

### Products
- `POST /products`
- `GET /products` — supports pagination, sorting, filtering by category / status / price
- `GET /products/:id`

### Orders
- `POST /orders`
- `GET /orders` — list all orders (authenticated)
- `GET /orders/:id` — get order by id (authenticated)
- `PATCH /orders/:id` — update full order (authenticated)
- `GET /orders/stats/month-total` — authenticated, all roles
- `GET /orders/stats/highest-total` — authenticated, all roles

---

## Data Seed

Run with: `npm run seed`

Seed must generate:
- 1 admin user — credentials from env vars with dev fallbacks:
  - `SEED_ADMIN_EMAIL` (default: admin@technical-test.com)
  - `SEED_ADMIN_PASSWORD` (default: Admin123!)
- 5 customer users (fictional, for orders)
- 40 products across tech categories
- 25 orders assigned to customer users

### Product categories (tech store)
- Smartphones
- Laptops
- Tablets
- Accessories
- Gaming
- Audio
- Networking
- Monitors

---

## Testing Strategy

TDD mandatory.

Rules:
- Write tests first
- Use Jest
- All tests use pure mocks (no real DB, no mongodb-memory-server)
- No E2E tests
- Domain tests
- Use case tests
- Integration tests (mocked repositories)

Coverage goal: 85%
CI pipeline fails if coverage drops below 85%

---

## Docker

Local development must run with:
- api
- mongo
- mongo-express

using docker-compose.

---

## Pipeline

Two workflows:

### ci.yml — runs on every push and PR
1. Install dependencies
2. Lint (ESLint default NestJS config)
3. Run tests with coverage (fails if below 85%)
4. Build TypeScript

### cd.yml — runs on push to main only
5. Docker build
6. Push image to AWS ECR
7. Deploy CDK
8. Update ECS services

---

## Environment Variables

```
NODE_ENV
API_PORT
JWT_SECRET

MONGO_HOST
MONGO_PORT
MONGO_DATABASE
MONGO_USERNAME
MONGO_PASSWORD

SEED_ADMIN_EMAIL
SEED_ADMIN_PASSWORD
```

---

## AI Agent Rules

When generating code the AI must:

- Respect hexagonal architecture
- Place business logic in domain/use cases
- Implement repositories through interfaces
- Write tests before implementation
- Never place framework code in domain
