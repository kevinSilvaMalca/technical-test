# AI Tasks Roadmap

## Phase 1 — Bootstrap

- [ ] Initialize NestJS project
- [ ] Install dependencies
- [ ] Create base structure

## Phase 2 — Domain

- [ ] Create entities: User, Product, Order, OrderItem
- [ ] Create repository interfaces
- [ ] Write unit tests first

## Phase 3 — Application

Auth use cases:
- [ ] RegisterUserUseCase
- [ ] LoginUserUseCase
- [ ] GetCurrentUserUseCase

Product use cases:
- [ ] CreateProductUseCase
- [ ] GetProductUseCase
- [ ] SearchProductsUseCase
- [ ] UpdateProductUseCase
- [ ] DeleteProductUseCase

Order use cases:
- [ ] CreateOrderUseCase
- [ ] UpdateOrderUseCase
- [ ] GetOrderUseCase
- [ ] ListOrdersUseCase
- [ ] GetMonthTotalUseCase
- [ ] GetHighestTotalUseCase

## Phase 4 — Infrastructure

Implement:
- [ ] Mongoose schemas
- [ ] Mongo repositories
- [ ] Mongo config

## Phase 5 — HTTP Layer

- [ ] Controllers
- [ ] DTO validation
- [ ] JWT guards

## Phase 6 — DevOps

- [ ] Dockerfile
- [ ] docker-compose

## Phase 7 — Cloud

AWS CDK — Create:
- [ ] ECS cluster
- [ ] API service (MongoDB runs on Atlas M0, no ECS mongo service needed)

## Phase 8 — Pipeline

GitHub Actions pipeline with stages:
- [ ] install
- [ ] lint
- [ ] test
- [ ] build
- [ ] docker build
- [ ] deploy

## Phase 9 — Seed

- [ ] Seed script (`npm run seed`)
- [ ] Create 1 admin user (credentials from env vars)
- [ ] Create 5 customer users
- [ ] Create 40 products across tech categories
- [ ] Create 25 orders assigned to customer users
