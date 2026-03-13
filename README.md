# Technical Test API

REST API built with **NestJS + TypeScript** following **Hexagonal Architecture** and **Clean Architecture** principles.

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20 + TypeScript (strict) |
| Framework | NestJS 11 |
| Database | MongoDB 7 (local via Docker) / MongoDB Atlas M0 (production) |
| ODM | Mongoose 9 |
| Auth | JWT (`@nestjs/jwt`) + bcrypt |
| Validation | class-validator + class-transformer |
| Testing | Jest (TDD, 85 % coverage threshold) |
| Containerization | Docker (multi-stage) + docker-compose |
| Cloud | AWS ECS Fargate + ECR + ALB + Secrets Manager |
| IaC | AWS CDK v2 |
| CI/CD | GitHub Actions |

---

## Table of Contents

1. [Project structure](#project-structure)
2. [Local development](#local-development)
3. [Seed](#seed)
4. [API Reference](#api-reference)
   - [Health](#health)
   - [Auth](#auth)
   - [Products](#products)
   - [Orders](#orders)
5. [Role permissions matrix](#role-permissions-matrix)
6. [Order status transitions](#order-status-transitions)
7. [Order total calculation](#order-total-calculation)
8. [Swagger UI](#swagger-ui)
9. [Running tests](#running-tests)
10. [Cloud deployment (AWS)](#cloud-deployment-aws)
11. [CI/CD pipeline](#cicd-pipeline)
12. [Environment variables reference](#environment-variables-reference)

---

## Project structure

```
src/
├── auth/
│   ├── domain/           # User entity, Role/UserStatus enums, IUserRepository port, domain exceptions
│   ├── application/      # RegisterUserUseCase, LoginUserUseCase, GetCurrentUserUseCase, IJwtService port
│   └── infrastructure/   # MongoUserRepository, NestJwtService, AuthController, DTOs
├── products/
│   ├── domain/           # Product entity, ProductStatus enum, IProductRepository port, domain exceptions
│   ├── application/      # Create/Get/Search/Update/DeleteProductUseCase
│   └── infrastructure/   # MongoProductRepository, ProductsController, DTOs, Mongoose schema
├── orders/
│   ├── domain/           # Order/OrderItem entities, OrderStatus enum, IOrderRepository + IProductPort, exceptions
│   ├── application/      # Create/Update/Get/List/GetMonthTotal/GetHighestTotalOrderUseCase
│   └── infrastructure/   # MongoOrderRepository, ProductAdapter, OrdersController, DTOs, schemas
├── shared/
│   ├── guards/           # JwtAuthGuard, RolesGuard
│   └── decorators/       # @Roles(), @CurrentUser()
├── health/               # GET /health
├── app.module.ts
└── main.ts               # Bootstrap + Swagger setup
infra/
├── bin/app.ts            # CDK entry point
└── lib/ecs-stack.ts      # Full ECS stack definition
.github/
└── workflows/
    ├── ci.yml            # Runs on every push and PR
    └── cd.yml            # Runs on push to main only
```

---

## Local development

### Prerequisites

- Docker Desktop running
- Node.js 20 (only needed if you want to run outside Docker)

### 1 — Copy environment file

```bash
cp .env.example .env
```

The default values in `.env.example` are already configured for local docker-compose. No changes needed to get started.

### 2 — Start all services

```bash
docker compose up -d
```

This starts:

| Service | URL | Description |
|---|---|---|
| API | http://localhost:3000 | NestJS application |
| MongoDB | localhost:27017 | MongoDB 7 |
| Mongo Express | http://localhost:8081 | MongoDB visual admin UI |

Wait for the health check to pass (~10 seconds):

```bash
curl http://localhost:3000/health
# {"status":"ok","timestamp":"...","uptime":12.3}
```

### 3 — Run the seed (first time only)

```bash
MONGODB_URI=mongodb://root:root@localhost:27017/technical-test?authSource=admin npm run seed
```

The seed creates:
- **1 admin user** — `admin@technical-test.com` / `Admin123!`
- **5 customer users** — realistic names and emails, all with password `Customer123!`
- **40 products** — distributed across 8 categories
- **25 orders** — randomly assigned to the 5 customers

### 4 — Open Swagger UI

```
http://localhost:3000/docs
```

Click **Authorize**, paste the JWT token from `POST /auth/login` to test protected endpoints.

---

## Seed

```bash
# Using docker-compose mongo (from the host machine)
MONGODB_URI=mongodb://root:root@localhost:27017/technical-test?authSource=admin npm run seed

# Using Atlas (production target)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/technical-test npm run seed
```

The seed **clears all existing data** before inserting. Run it only once, or deliberately to reset the database.

---

## API Reference

### Base URL (local)

```
http://localhost:3000
```

### Authentication

All protected endpoints require:

```
Authorization: Bearer <JWT>
```

Obtain the token via `POST /auth/login`.

---

### Health

#### `GET /health`

No authentication required.

**Response 200**

```json
{
  "status": "ok",
  "timestamp": "2026-03-13T00:00:00.000Z",
  "uptime": 42.3
}
```

---

### Auth

#### `POST /auth/register`

Creates a new user account. Public endpoint — no token needed.

| Rule | Behavior |
|---|---|
| No token provided | Role is always **customer** regardless of request body |
| Token present, role = **admin** | Can create users with any role (admin, manager, customer) |
| Token present, role = **manager** | Can only create **customer** users |
| Token present, role = **customer** | Cannot assign roles — forbidden |

**Request body**

```json
{
  "email": "user@example.com",
  "password": "Secret123!",
  "role": "customer"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| email | string | yes | Valid email address |
| password | string | yes | Minimum 6 characters |
| role | string (enum) | no | `admin` \| `manager` \| `customer` — defaults to `customer` |

**Response 201**

```json
{
  "id": "64a1b2c3d4e5f6a7b8c9d0e1",
  "email": "user@example.com",
  "role": "customer",
  "status": "active"
}
```

**Errors**

| Code | Reason |
|---|---|
| 400 | Validation error or email already registered |
| 403 | Trying to assign a role above your own permissions |

---

#### `POST /auth/login`

Validates credentials and returns a signed JWT.

**Request body**

```json
{
  "email": "admin@technical-test.com",
  "password": "Admin123!"
}
```

**Response 200**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors**

| Code | Reason |
|---|---|
| 401 | Invalid credentials |

---

#### `GET /auth/me`

Returns the profile of the authenticated user. **Requires JWT.**

**Response 200**

```json
{
  "id": "64a1b2c3d4e5f6a7b8c9d0e1",
  "email": "admin@technical-test.com",
  "role": "admin",
  "status": "active"
}
```

---

### Products

#### `POST /products`

Creates a new product. **Requires JWT — admin or manager.**

**Request body**

```json
{
  "name": "iPhone 15 Pro",
  "sku": "SPH-001",
  "description": "Apple iPhone 15 Pro with A17 Pro chip and titanium design",
  "picture": "https://example.com/iphone15pro.jpg",
  "price": 999.99,
  "stock": 50,
  "category": "Smartphones",
  "status": "active",
  "tags": ["apple", "ios", "flagship"]
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| name | string | yes | Product display name |
| sku | string | yes | Unique identifier — duplicate SKU returns 400 |
| description | string | yes | Full product description |
| picture | string (URL) | no | Image URL |
| price | number | yes | Must be positive. Currency is always USD |
| stock | number (int) | yes | Must be 0 or more |
| category | string | yes | Free text. Suggested: Smartphones, Laptops, Tablets, Accessories, Gaming, Audio, Networking, Monitors |
| status | string (enum) | no | `active` \| `inactive` \| `out_of_stock` — defaults to `active` |
| tags | string[] | no | Array of searchable tags |

**Response 201** — full Product object

**Errors**

| Code | Reason |
|---|---|
| 400 | Validation error or duplicate SKU |
| 401 | Missing or invalid token |
| 403 | Customer cannot create products |

---

#### `GET /products`

Returns a paginated, filterable product list. **Public endpoint — no token required.**

**Query parameters**

| Param | Type | Default | Description |
|---|---|---|---|
| category | string | — | Exact match filter |
| status | string (enum) | — | `active` \| `inactive` \| `out_of_stock` |
| minPrice | number | — | Minimum price (inclusive) |
| maxPrice | number | — | Maximum price (inclusive) |
| page | integer | 1 | Page number (1-based) |
| limit | integer | 10 | Items per page |
| sortBy | string | createdAt | `name` \| `price` \| `stock` \| `createdAt` |
| sortOrder | string | asc | `asc` \| `desc` |

**Example**

```
GET /products?category=Smartphones&minPrice=500&maxPrice=1200&sortBy=price&sortOrder=asc&page=1&limit=5
```

**Response 200**

```json
{
  "data": [
    {
      "id": "...",
      "name": "iPhone 15 Pro",
      "sku": "SPH-001",
      "price": 999.99,
      "currency": "USD",
      "stock": 50,
      "category": "Smartphones",
      "status": "active",
      "tags": ["apple", "ios"],
      "createdAt": "2026-03-13T00:00:00.000Z",
      "updatedAt": "2026-03-13T00:00:00.000Z"
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 5
}
```

---

#### `GET /products/:id`

Returns a single product. **Public endpoint.**

**Path parameter**

| Param | Description |
|---|---|
| id | MongoDB ObjectId of the product |

**Response 200** — full Product object

**Errors**

| Code | Reason |
|---|---|
| 404 | Product not found |

---

#### `PATCH /products/:id`

Partial update of a product. **Requires JWT — admin or manager.**

All fields from `POST /products` are optional. Send only the fields you want to change.

**Example**

```json
{
  "price": 899.99,
  "stock": 35,
  "status": "active"
}
```

**Response 200** — updated Product object

**Errors**

| Code | Reason |
|---|---|
| 400 | Duplicate SKU |
| 401 | Missing or invalid token |
| 403 | Customer cannot update products |
| 404 | Product not found |

---

#### `DELETE /products/:id`

Permanently deletes a product. **Requires JWT — admin only.**

**Response 204** — no content

**Errors**

| Code | Reason |
|---|---|
| 401 | Missing or invalid token |
| 403 | Manager and customer cannot delete |
| 404 | Product not found |

---

### Orders

All order endpoints require a valid JWT token.

#### `POST /orders`

Creates a new order with status **pending**.

**Request body**

```json
{
  "clientName": "Alice Johnson",
  "clientEmail": "alice.johnson@example.com",
  "tax": 0.1,
  "items": [
    {
      "productId": "64a1b2c3d4e5f6a7b8c9d0e1",
      "quantity": 2,
      "discount": 10.00
    },
    {
      "productId": "64a1b2c3d4e5f6a7b8c9d0e2",
      "quantity": 1
    }
  ]
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| clientName | string | yes | Full name of the customer |
| clientEmail | string | yes | Valid email |
| tax | number | yes | Tax amount added to subtotal (e.g. `0.1` = add 10% of subtotal) |
| items | array | yes | At least 1 item required |
| items[].productId | string | yes | MongoDB ObjectId of the product |
| items[].quantity | integer | yes | Minimum 1 |
| items[].discount | number | no | Fixed discount applied to this line item (default 0) |

**Total calculation**

```
lineTotal  = (unitPrice × quantity) − discount
subtotal   = Σ lineTotal
total      = subtotal + tax
```

**Response 201**

```json
{
  "id": "...",
  "identifier": "550e8400-e29b-41d4-a716-446655440000",
  "clientName": "Alice Johnson",
  "clientEmail": "alice.johnson@example.com",
  "items": [
    {
      "productId": "...",
      "sku": "SPH-001",
      "name": "iPhone 15 Pro",
      "unitPrice": 999.99,
      "quantity": 2,
      "discount": 10.00,
      "lineTotal": 1989.98
    }
  ],
  "subtotal": 1989.98,
  "tax": 198.99,
  "total": 2188.97,
  "status": "pending",
  "createdAt": "2026-03-13T00:00:00.000Z",
  "updatedAt": "2026-03-13T00:00:00.000Z"
}
```

**Errors**

| Code | Reason |
|---|---|
| 400 | Empty items array, product not found, or insufficient stock |
| 401 | Missing or invalid token |

---

#### `GET /orders`

Returns all orders. **All authenticated roles.**

**Response 200** — array of Order objects

---

#### `GET /orders/stats/month-total`

Returns the sum of `total` for all orders created in the **current calendar month**. **All authenticated roles.**

**Response 200**

```json
{
  "total": 24580.45
}
```

Returns `{ "total": 0 }` if no orders exist in the current month.

---

#### `GET /orders/stats/highest-total`

Returns the order with the highest `total` amount. **All authenticated roles.**

**Response 200** — full Order object, or `null` if no orders exist.

---

#### `GET /orders/:id`

Returns a single order. **All authenticated roles.**

**Path parameter**

| Param | Description |
|---|---|
| id | MongoDB ObjectId of the order |

**Response 200** — full Order object

**Errors**

| Code | Reason |
|---|---|
| 404 | Order not found |

---

#### `PATCH /orders/:id`

Updates an order. **All authenticated roles.**

**Business rules:**

- Fields `clientName`, `clientEmail`, `items`, `tax` can only be modified when status is `pending`
- Once the order is `confirmed` or beyond, only `status` can be changed
- `delivered` and `cancelled` are **final states** — no further updates allowed

**Request body** (all fields optional)

```json
{
  "status": "confirmed"
}
```

```json
{
  "clientName": "Bob Martinez",
  "tax": 0.15,
  "items": [
    { "productId": "...", "quantity": 3, "discount": 5.00 }
  ]
}
```

**Response 200** — updated Order object

**Errors**

| Code | Reason |
|---|---|
| 400 | Invalid status transition |
| 401 | Missing or invalid token |
| 404 | Order not found |

---

## Role permissions matrix

| Endpoint | customer | manager | admin |
|---|:---:|:---:|:---:|
| `POST /auth/register` | ✓ | ✓ | ✓ |
| `POST /auth/login` | ✓ | ✓ | ✓ |
| `GET /auth/me` | ✓ | ✓ | ✓ |
| `GET /products` | ✓ | ✓ | ✓ |
| `GET /products/:id` | ✓ | ✓ | ✓ |
| `POST /products` | ✗ | ✓ | ✓ |
| `PATCH /products/:id` | ✗ | ✓ | ✓ |
| `DELETE /products/:id` | ✗ | ✗ | ✓ |
| `POST /orders` | ✓ | ✓ | ✓ |
| `GET /orders` | ✓ | ✓ | ✓ |
| `GET /orders/:id` | ✓ | ✓ | ✓ |
| `PATCH /orders/:id` | ✓ | ✓ | ✓ |
| `GET /orders/stats/month-total` | ✓ | ✓ | ✓ |
| `GET /orders/stats/highest-total` | ✓ | ✓ | ✓ |

---

## Order status transitions

```
pending ──► confirmed ──► shipped ──► delivered (final)
   │              │
   └──────────────┴──────────────────► cancelled (final)
```

Valid transitions:

| From | To |
|---|---|
| `pending` | `confirmed`, `cancelled` |
| `confirmed` | `shipped`, `cancelled` |
| `shipped` | `delivered` |
| `delivered` | — (final state) |
| `cancelled` | — (final state) |

Any other transition returns HTTP 400.

---

## Order total calculation

```
lineTotal  = (unitPrice × quantity) − discount
subtotal   = sum of all lineTotals
total      = subtotal + tax
```

Example with 2 items:

| Product | Unit price | Qty | Discount | Line total |
|---|---|---|---|---|
| iPhone 15 Pro | $999.99 | 2 | $10.00 | $1,989.98 |
| AirPods Pro 2 | $249.99 | 1 | $0.00 | $249.99 |

```
subtotal = 1989.98 + 249.99 = 2239.97
tax      = 2239.97 × 0.10 = 223.99   (if tax = 0.1 * subtotal)
total    = 2239.97 + 223.99 = 2463.96
```

> **Note:** The `tax` field in the request is a flat amount added to the subtotal, not a percentage. The seed script calculates it as `subtotal × 0.10`.

---

## Swagger UI

The interactive API documentation is available when the API is running:

```
http://localhost:3000/docs
```

### How to authenticate in Swagger

1. Call `POST /auth/login` with admin credentials
2. Copy the `accessToken` value from the response
3. Click the **Authorize** button (top right of the Swagger UI)
4. Paste the token in the **Value** field (without the `Bearer` prefix — Swagger adds it automatically)
5. Click **Authorize** and close the dialog
6. All protected endpoints will now send the token automatically

---

## Running tests

```bash
# Run all tests
npm test

# Run with coverage report
npm run test:cov

# Watch mode
npm run test:watch
```

Coverage threshold: **85 % lines** — the CI pipeline fails if coverage drops below this.

Test strategy:
- All tests use **pure mocks** — no real database, no mongodb-memory-server
- Domain tests — entity logic and exceptions
- Application tests — use cases with mocked ports
- Infrastructure tests — repositories with mocked Mongoose models

---

## Cloud deployment (AWS)

### Architecture overview

```
Internet
    │
    ▼
Application Load Balancer (port 80)
    │
    ▼
ECS Fargate Service (port 3000)
    │  └── reads secrets from AWS Secrets Manager (JWT_SECRET, MONGODB_URI)
    │  └── logs to CloudWatch (/technical-test/api)
    │
    ▼
MongoDB Atlas M0 (external, free tier)
```

All infrastructure is defined as code in `infra/` using AWS CDK v2.

### AWS resources created by CDK

| Resource | Name / Value |
|---|---|
| VPC | 2 AZs, public subnets only (POC — no NAT Gateway) |
| ECR Repository | `technical-test-api` |
| ECS Cluster | `technical-test-cluster` |
| ECS Service | `technical-test-api`, 1 task, no auto-scaling |
| Task definition | 256 CPU units, 512 MB memory |
| ALB | `technical-test-alb`, port 80 → container 3000 |
| Secret — JWT | `technical-test/jwt-secret` (auto-generated 64 chars) |
| Secret — MongoDB | `technical-test/mongodb-uri` (set manually after deploy) |
| CloudWatch Log Group | `/technical-test/api`, 7-day retention |

### Manual steps before first deploy

1. **Create an AWS account** and configure credentials locally:
   ```bash
   aws configure
   ```

2. **Bootstrap CDK** (one time per account/region):
   ```bash
   cd infra
   npm install
   npx cdk bootstrap aws://<ACCOUNT_ID>/<REGION>
   ```

3. **Deploy the stack:**
   ```bash
   npx cdk deploy
   ```

4. **Set the MongoDB URI secret** in AWS Secrets Manager after deploy:
   ```bash
   aws secretsmanager put-secret-value \
     --secret-id technical-test/mongodb-uri \
     --secret-string "mongodb+srv://user:pass@cluster.mongodb.net/technical-test"
   ```

5. **Force ECS to pick up the new secret** (restart the task):
   ```bash
   aws ecs update-service \
     --cluster technical-test-cluster \
     --service technical-test-api \
     --force-new-deployment
   ```

6. **Run the seed against Atlas** (optional, one time):
   ```bash
   MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/technical-test" npm run seed
   ```

### Deploy outputs

After `cdk deploy` the stack prints:

| Output | Description |
|---|---|
| `ApiUrl` | Public URL of the ALB — `http://<alb-dns-name>` |
| `EcrRepositoryUri` | ECR URI to tag and push Docker images |
| `EcsClusterName` | ECS cluster name |
| `EcsServiceName` | ECS service name |

### Health check

The ALB performs a health check on `GET /health` every 30 seconds. The ECS task is only registered as healthy after 2 consecutive 200 responses (with a 60-second grace period on startup).

---

## CI/CD pipeline

### `ci.yml` — runs on every push and pull request

```
1. Checkout
2. Setup Node 20
3. npm ci
4. ESLint
5. Jest --coverage  (fails if below 85%)
6. TypeScript build
```

### `cd.yml` — runs on push to main only

```
1. All CI steps (same job)
2. Configure AWS credentials from GitHub Secrets
3. Login to Amazon ECR
4. Docker build + push  (tagged with commit SHA)
5. CDK deploy  (--require-approval never)
6. Register new ECS task definition with updated image
7. Update ECS service  (force new deployment)
8. Wait for service stability
```

### Required GitHub Secrets

Go to **Settings → Secrets and variables → Actions** and add:

| Secret | Description |
|---|---|
| `AWS_ACCESS_KEY_ID` | IAM user access key |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret key |
| `AWS_REGION` | e.g. `us-east-1` |
| `AWS_ACCOUNT_ID` | 12-digit AWS account ID |
| `ECR_REPOSITORY` | ECR repository name: `technical-test-api` |
| `ECS_CLUSTER` | `technical-test-cluster` |
| `ECS_SERVICE` | `technical-test-api` |

---

## Environment variables reference

| Variable | Required | Default | Description |
|---|---|---|---|
| `NODE_ENV` | no | `development` | Application environment |
| `API_PORT` | no | `3000` | HTTP port the server listens on |
| `JWT_SECRET` | yes | — | Secret key for signing JWT tokens |
| `JWT_EXPIRES_IN` | no | `7d` | Token expiration (e.g. `7d`, `24h`) |
| `MONGODB_URI` | yes | — | Full MongoDB connection string |
| `MONGO_HOST` | local only | `mongo` | MongoDB hostname (for docker-compose) |
| `MONGO_PORT` | local only | `27017` | MongoDB port |
| `MONGO_DATABASE` | local only | `technical-test` | Database name |
| `MONGO_USERNAME` | local only | `root` | MongoDB root username |
| `MONGO_PASSWORD` | local only | `root` | MongoDB root password |
| `SEED_ADMIN_EMAIL` | no | `admin@technical-test.com` | Admin email created by the seed |
| `SEED_ADMIN_PASSWORD` | no | `Admin123!` | Admin password created by the seed |
| `AWS_REGION` | production | `us-east-1` | AWS region for CDK and ECR |
| `AWS_ACCOUNT_ID` | production | — | AWS account ID for CDK |
