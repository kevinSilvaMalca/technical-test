# Agente: Orders

## Responsabilidad
Gestión de órdenes de compra con cálculo de totales, control de acceso y estadísticas.

## Dominio

### Entidades
- `Order`: id, identifier (UUID), clientName, clientEmail, items[], subtotal, tax, total, status, createdAt, updatedAt
- `OrderItem`: productId, sku, name, picture, unitPrice, quantity, discount, lineTotal

### Value Objects
- `OrderStatus`: enum `pending | confirmed | shipped | delivered | cancelled`
- `Quantity`: entero positivo mayor a 0

### Cálculo de totales
- `lineTotal = (unitPrice * quantity) - discount`
- `subtotal = suma de lineTotals`
- `total = subtotal + tax`

### Puertos (interfaces)
- `IOrderRepository`: findById, findAll, findByStatus, save, update
- `IProductPort`: getById (anti-corrupción hacia módulo Products, solo lectura)

### Excepciones de dominio
- `OrderNotFoundException`
- `InsufficientStockException`
- `InvalidOrderStatusTransitionException`
- `EmptyOrderException`

## Reglas de negocio

- Una orden debe tener al menos un item
- El stock del producto se descuenta al **crear** la orden (status inicial: `pending`)
- Transiciones de estado válidas para `UpdateOrderUseCase`:
  - `pending` → `confirmed` | `cancelled`
  - `confirmed` → `shipped` | `cancelled`
  - `shipped` → `delivered`
  - `delivered` → (estado final, no transiciona)
  - `cancelled` → (estado final, no transiciona)
- Cualquier otro campo de la orden puede actualizarse mientras el status sea `pending`
- Una vez `confirmed` o superior solo se puede cambiar el status

## Casos de uso

| Caso de uso | Acceso | Descripción |
|-------------|--------|-------------|
| `CreateOrderUseCase` | autenticado | Valida items, descuenta stock, calcula totales, crea orden en `pending` |
| `UpdateOrderUseCase` | autenticado | Actualiza orden completa. Si status cambia, valida transición |
| `GetOrderUseCase` | autenticado | Obtiene orden por ID |
| `ListOrdersUseCase` | autenticado | Lista todas las órdenes |
| `GetMonthTotalUseCase` | autenticado | Suma de totales de órdenes del mes actual |
| `GetHighestTotalUseCase` | autenticado | Retorna la orden con el total más alto |

## Infraestructura

### Persistencia
- Schema Mongoose: `OrderSchema` en `order.schema.ts`
- Embedded: `OrderItemSchema`
- Repositorio: `MongoOrderRepository` implementa `IOrderRepository`

### HTTP
- `POST /orders` → `CreateOrderUseCase` (autenticado)
- `GET /orders` → `ListOrdersUseCase` (autenticado)
- `GET /orders/:id` → `GetOrderUseCase` (autenticado)
- `PATCH /orders/:id` → `UpdateOrderUseCase` (autenticado)
- `GET /orders/stats/month-total` → `GetMonthTotalUseCase` (autenticado, todos los roles)
- `GET /orders/stats/highest-total` → `GetHighestTotalUseCase` (autenticado, todos los roles)

### DTOs
- `CreateOrderDto`: clientName, clientEmail, items[{ productId, quantity, discount? }], tax
- `UpdateOrderDto`: clientName?, clientEmail?, items?[{ productId, quantity, discount? }], tax?, status?
- `OrderResponseDto`: id, identifier, clientName, clientEmail, items[], subtotal, tax, total, status, createdAt, updatedAt

## Tests requeridos

### CreateOrderUseCase
- Orden creada con items y totales calculados correctamente
- `lineTotal = (unitPrice * quantity) - discount` correcto
- `subtotal` = suma de lineTotals correcto
- `total = subtotal + tax` correcto
- Lista de items vacía lanza `EmptyOrderException`
- Stock insuficiente lanza `InsufficientStockException`
- Producto inexistente lanza excepción via `IProductPort`

### UpdateOrderUseCase
- Actualiza campos permitidos en status `pending` OK
- Transición `pending → confirmed` OK
- Transición `pending → cancelled` OK
- Transición `confirmed → shipped` OK
- Transición `shipped → delivered` OK
- Transición inválida `delivered → pending` lanza `InvalidOrderStatusTransitionException`
- Transición inválida `cancelled → confirmed` lanza `InvalidOrderStatusTransitionException`
- Orden inexistente lanza `OrderNotFoundException`
- Recalcula totales si items cambian

### GetOrderUseCase
- Retorna orden por ID OK
- ID inexistente lanza `OrderNotFoundException`

### ListOrdersUseCase
- Retorna lista de todas las órdenes

### GetMonthTotalUseCase
- Suma correcta de totales del mes actual
- Retorna 0 si no hay órdenes en el mes

### GetHighestTotalUseCase
- Retorna la orden con el total más alto
- Retorna null si no hay órdenes

### MongoOrderRepository
- Mock de Mongoose model en todos los métodos
- findAll retorna array vacío si no hay órdenes

## Dependencias
- Módulo Auth (guards + usuario actual)
- Módulo Products via `IProductPort` (sin acoplamiento directo)
