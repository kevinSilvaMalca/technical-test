# Master Prompts

Use these prompts in order. Wait for human approval before moving to the next phase.

---

## Prompt 1 — Bootstrap

```
Read AGENT.md and use it as the architectural contract for this entire project.

Tasks:
1. Initialize a NestJS project with TypeScript (strict mode)
2. Install all required dependencies:
   - @nestjs/jwt, @nestjs/passport, passport, passport-jwt
   - mongoose, @nestjs/mongoose
   - bcrypt, @types/bcrypt
   - class-validator, class-transformer
   - @nestjs/config
3. Create the base folder structure following Hexagonal Architecture:
   src/
   ├── auth/
   │   ├── domain/
   │   ├── application/
   │   └── infrastructure/
   ├── products/
   │   ├── domain/
   │   ├── application/
   │   └── infrastructure/
   ├── orders/
   │   ├── domain/
   │   ├── application/
   │   └── infrastructure/
   └── shared/
4. Create AppModule with ConfigModule and MongooseModule connected via MONGODB_URI env var
5. Create a GET /health endpoint returning { status: 'ok', timestamp, uptime }

Do not implement business logic yet.
Summarize every file created.
```

---

## Prompt 2 — Domain Layer

```
Follow AGENT.md strictly. Do not use NestJS decorators or Mongoose in this layer.

Create the domain layer for all three modules using pure TypeScript.

For each entity write the test FIRST, then the implementation.

User domain:
- Entity: User (id, email, passwordHash, role, status, createdAt, updatedAt)
- Roles enum: admin | manager | customer
- Port interface: IUserRepository (findByEmail, findById, save, update, delete)
- Domain exceptions: UserAlreadyExistsException, UserNotFoundException, InvalidCredentialsException

Product domain:
- Entity: Product (id, name, sku, description, picture, price, currency, stock, category, status, tags, createdAt, updatedAt)
- Currency is always USD
- Port interface: IProductRepository (findById, findAll, findBySku, save, update, delete)
- Domain exceptions: ProductNotFoundException, DuplicateSkuException, InvalidPriceException

Order domain:
- Entity: Order (id, identifier as UUID, clientName, clientEmail, items, subtotal, tax, total, status, createdAt, updatedAt)
- Entity: OrderItem (productId, sku, name, picture, unitPrice, quantity, discount, lineTotal)
- lineTotal = (unitPrice * quantity) - discount
- subtotal = sum of lineTotals
- total = subtotal + tax
- OrderStatus enum: pending | confirmed | shipped | delivered | cancelled
- Port interface: IOrderRepository (findById, findAll, findByStatus, save, update)
- Domain exceptions: OrderNotFoundException, EmptyOrderException, InvalidStatusTransitionException

Coverage goal: 85% on domain layer.
```

---

## Prompt 3 — Application Layer

```
Follow AGENT.md strictly. Use cases must only depend on domain ports, never on NestJS or Mongoose.

For each use case write the test FIRST using mocked ports, then the implementation.

Auth use cases:
- RegisterUserUseCase: validate email not taken, hash password with bcrypt, save user
- LoginUserUseCase: find user by email, validate password, return JWT token
- GetCurrentUserUseCase: find user by id from token payload

Product use cases:
- CreateProductUseCase: validate unique sku, save product (admin/manager only)
- GetProductUseCase: find by id, throw if not found
- SearchProductsUseCase: filter by category, status, price with pagination and sorting
- UpdateProductUseCase: find, update fields, save (admin/manager only)
- DeleteProductUseCase: find, delete (admin only)

Order use cases:
- CreateOrderUseCase: validate items not empty, calculate totals, set status to pending, save
- UpdateOrderUseCase: find order, update allowed fields, recalculate totals if items changed, save
- GetOrderUseCase: find by id, throw if not found
- ListOrdersUseCase: return all orders
- GetMonthTotalUseCase: sum totals of orders in current month
- GetHighestTotalUseCase: return the order with the highest total

Coverage goal: 85% on application layer.
```

---

## Prompt 4 — Infrastructure Layer

```
Follow AGENT.md. This layer implements the domain ports using Mongoose.

Tasks:
1. Create Mongoose schemas for User, Product, Order (with embedded OrderItem)
2. Implement repositories:
   - MongoUserRepository implements IUserRepository
   - MongoProductRepository implements IProductRepository
   - MongoOrderRepository implements IOrderRepository
3. Register schemas and repositories in each NestJS module
4. Configure MongooseModule with MONGODB_URI from ConfigService

Product schema indexes: sku (unique), category, price, status

Write tests for repositories using mocked Mongoose models.
Coverage goal: 85%.
```

---

## Prompt 5 — HTTP Layer

```
Follow AGENT.md. Controllers must not contain business logic. All logic lives in use cases.

Tasks:
1. Auth controller:
   - POST /auth/register → RegisterUserUseCase
   - POST /auth/login → LoginUserUseCase
   - GET /auth/me → GetCurrentUserUseCase (JWT required)

2. Products controller:
   - POST /products → CreateProductUseCase (admin | manager)
   - GET /products → SearchProductsUseCase (public)
   - GET /products/:id → GetProductUseCase (public)
   - PATCH /products/:id → UpdateProductUseCase (admin | manager)
   - DELETE /products/:id → DeleteProductUseCase (admin only)

3. Orders controller:
   - POST /orders → CreateOrderUseCase (authenticated)
   - GET /orders → ListOrdersUseCase (authenticated)
   - GET /orders/:id → GetOrderUseCase (authenticated)
   - PATCH /orders/:id → UpdateOrderUseCase (authenticated)
   - GET /orders/stats/month-total → GetMonthTotalUseCase (authenticated)
   - GET /orders/stats/highest-total → GetHighestTotalUseCase (authenticated)

4. Guards:
   - JwtAuthGuard using @nestjs/jwt and @nestjs/passport
   - RolesGuard with @Roles() decorator

5. DTOs with class-validator for all endpoints

Role permissions:
- admin: full access
- manager: create and update (no delete)
- customer: read only
```

---

## Prompt 6 — DevOps (Docker)

```
Follow AGENT.md.

Tasks:
1. Create Dockerfile (multi-stage):
   - Stage 1 (builder): node:20-alpine, install deps, compile TypeScript
   - Stage 2 (production): node:20-alpine, production deps only, copy dist/

2. Create docker-compose.yml with services:
   - api: build local, port 3000, env from .env file
   - mongo: mongo:7, port 27017, persistent volume
   - mongo-express: port 8081, connected to mongo

3. Create .dockerignore: node_modules, dist, .env, coverage, *.md

4. Create .env.example with all required variables:
   NODE_ENV, API_PORT, JWT_SECRET,
   MONGO_HOST, MONGO_PORT, MONGO_DATABASE, MONGO_USERNAME, MONGO_PASSWORD,
   MONGODB_URI, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD
```

---

## Prompt 7 — Cloud (AWS CDK)

```
Follow AGENT.md. This is a POC — keep the setup minimal and cost-effective.

MongoDB runs on Atlas M0 (external). ECS only runs the API.

Tasks:
1. Initialize CDK project in infra/ folder
2. Create ECS stack (infra/lib/ecs-stack.ts) with:
   - VPC (2 AZs, public subnets only for POC)
   - ECR repository for the API image
   - ECS Fargate cluster
   - Task definition: 256 CPU, 512 MB memory
   - ECS service: 1 task, no auto-scaling
   - ALB: port 80 → container port 3000
   - Secrets Manager: JWT_SECRET and MONGODB_URI (Atlas connection string)
   - CloudWatch log group

3. Health check: GET /health must return 200
```

---

## Prompt 8 — Pipeline (GitHub Actions)

```
Follow AGENT.md.

Create two workflows:

ci.yml (runs on every push and PR):
1. Checkout
2. Setup Node 20
3. npm install
4. ESLint
5. Jest with --coverage (fail if below 85%)
6. TypeScript build

cd.yml (runs on push to main only):
1. Run CI steps
2. Configure AWS credentials from GitHub secrets
3. Login to AWS ECR
4. Build Docker image
5. Push to ECR with commit SHA as tag
6. Deploy CDK (cdk deploy --require-approval never)
7. Update ECS service with new image

Required GitHub secrets:
AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION,
AWS_ACCOUNT_ID, ECR_REPOSITORY, ECS_CLUSTER, ECS_SERVICE
```

---

## Prompt 9 — Seed

```
Follow AGENT.md.

Create a seed script runnable with: npm run seed

The script must:
1. Connect to MongoDB via MONGODB_URI
2. Clear existing data (users, products, orders)
3. Create 1 admin user:
   - email from SEED_ADMIN_EMAIL (default: admin@technical-test.com)
   - password from SEED_ADMIN_PASSWORD (default: Admin123!)
4. Create 5 customer users with realistic names and emails
5. Create 40 products distributed across tech categories:
   Smartphones, Laptops, Tablets, Accessories, Gaming, Audio, Networking, Monitors
   Each with realistic name, sku, price in USD, stock, description
6. Create 25 orders assigned randomly to the 5 customer users
   Each order must have 1-5 items, realistic discounts, tax at 10%

Disconnect after seeding and log a summary of created records.
```
