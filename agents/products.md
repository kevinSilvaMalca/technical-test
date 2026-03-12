# Agente: Products

## Responsabilidad
Gestión del catálogo de productos (CRUD completo con control de acceso por rol).

## Dominio

### Entidades
- `Product`: id, name, sku, description, picture, price, currency, stock, category, status, tags, createdAt, updatedAt

### Value Objects
- `Price`: número positivo mayor a 0
- `Stock`: entero no negativo
- `Currency`: siempre USD
- `ProductStatus`: enum `active | inactive | out_of_stock`

### Puertos (interfaces)
- `IProductRepository`: findById, findBySku, findAll, save, update, delete

### Excepciones de dominio
- `ProductNotFoundException`
- `DuplicateSkuException`
- `InvalidPriceException`
- `InvalidStockException`

## Casos de uso

| Caso de uso | Acceso | Descripción |
|-------------|--------|-------------|
| `CreateProductUseCase` | admin, manager | Valida SKU único, crea producto |
| `GetProductUseCase` | todos | Obtiene producto por ID |
| `SearchProductsUseCase` | todos | Filtra por category, status, price con paginación y sorting |
| `UpdateProductUseCase` | admin, manager | Actualiza campos del producto |
| `DeleteProductUseCase` | admin only | Elimina un producto |

## Infraestructura

### Persistencia
- Schema Mongoose: `ProductSchema` en `product.schema.ts`
- Repositorio: `MongoProductRepository` implementa `IProductRepository`
- Indexes: sku (unique), category, price, status

### HTTP
- `POST /products` → `CreateProductUseCase` (admin | manager)
- `GET /products` → `SearchProductsUseCase` (público)
- `GET /products/:id` → `GetProductUseCase` (público)
- `PATCH /products/:id` → `UpdateProductUseCase` (admin | manager)
- `DELETE /products/:id` → `DeleteProductUseCase` (admin only)

### DTOs
- `CreateProductDto`: name, description, sku, picture?, price, currency (default USD), stock, category, status?, tags?
- `UpdateProductDto`: Partial de CreateProductDto
- `SearchProductsDto`: category?, status?, minPrice?, maxPrice?, page (default 1), limit (default 10), sortBy?, sortOrder (asc | desc)
- `ProductResponseDto`: id, name, sku, description, picture, price, currency, stock, category, status, tags, createdAt, updatedAt

### Paginación y filtros
- Query params: `page` (default 1), `limit` (default 10)
- Filtros: `category`, `status`, `minPrice`, `maxPrice`
- Sorting: `sortBy` (name | price | stock | createdAt), `sortOrder` (asc | desc)
- Respuesta: `{ data: Product[], total: number, page: number, limit: number }`

## Tests requeridos

### CreateProductUseCase
- Creación exitosa con todos los campos OK
- SKU duplicado lanza `DuplicateSkuException`
- Precio inválido (negativo o cero) lanza `InvalidPriceException`
- Stock inválido (negativo) lanza `InvalidStockException`

### GetProductUseCase
- Retorna producto por ID OK
- ID inexistente lanza `ProductNotFoundException`

### SearchProductsUseCase
- Retorna lista paginada sin filtros
- Filtra correctamente por category
- Filtra correctamente por status
- Filtra por rango de precio (minPrice / maxPrice)
- Ordena por precio ascendente y descendente
- Retorna página 2 correctamente

### UpdateProductUseCase
- Actualización de campos OK
- Producto inexistente lanza `ProductNotFoundException`
- SKU duplicado al actualizar lanza `DuplicateSkuException`

### DeleteProductUseCase
- Eliminación OK
- Producto inexistente lanza `ProductNotFoundException`

### MongoProductRepository
- Mock de Mongoose model en todos los métodos
- findBySku retorna null si no existe

## Dependencias
- Módulo Auth (para guards de roles)
- `class-validator`, `class-transformer`
