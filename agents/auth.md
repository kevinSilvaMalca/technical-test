# Agente: Auth

## Responsabilidad
Gestionar autenticación y autorización de usuarios mediante JWT usando @nestjs/jwt y @nestjs/passport.

## Dominio

### Entidades
- `User`: id, email, passwordHash, role, status, createdAt, updatedAt

### Value Objects
- `Email`: validación de formato
- `Password`: hashing con bcrypt (no almacenar en texto plano)
- `Role`: enum `admin | manager | customer`
- `UserStatus`: enum `active | inactive`

### Puertos (interfaces)
- `IUserRepository`: findByEmail, findById, save, update, delete

### Excepciones de dominio
- `UserAlreadyExistsException`
- `InvalidCredentialsException`
- `UserNotFoundException`
- `UnauthorizedRoleAssignmentException`

## Reglas de negocio — Roles

- `POST /auth/register` sin autenticación → crea siempre como `customer`
- Solo `admin` puede crear usuarios con rol `admin` o `manager`
- `manager` solo puede crear usuarios con rol `customer`
- `customer` no puede asignar roles

## Casos de uso

| Caso de uso | Descripción |
|-------------|-------------|
| `RegisterUserUseCase` | Registra usuario. Si no hay rol en el request → customer. Si hay rol → valida permisos del solicitante |
| `LoginUserUseCase` | Valida credenciales, retorna JWT |
| `GetCurrentUserUseCase` | Retorna el usuario autenticado por token |

## Infraestructura

### Persistencia
- Schema Mongoose: `UserSchema` en `user.schema.ts`
- Repositorio: `MongoUserRepository` implementa `IUserRepository`

### HTTP
- `POST /auth/register` → `RegisterUserUseCase` (público, sin JWT)
- `POST /auth/login` → `LoginUserUseCase` (público, sin JWT)
- `GET /auth/me` → `GetCurrentUserUseCase` (requiere JWT)
- Guard: `JwtAuthGuard` usando `@nestjs/passport` y `@nestjs/jwt`
- Guard: `RolesGuard` con decorator `@Roles()`
- Decorator: `@CurrentUser()` para extraer usuario del request

### DTOs
- `RegisterDto`: email, password, role? (opcional, default customer)
- `LoginDto`: email, password

## Tests requeridos

- `RegisterUserUseCase`: customer por defecto OK, admin crea manager OK, customer intenta crear admin lanza excepción, email duplicado lanza excepción
- `LoginUserUseCase`: credenciales válidas OK, inválidas lanza excepción
- `GetCurrentUserUseCase`: token válido retorna usuario, usuario no encontrado lanza excepción
- `MongoUserRepository`: mock de Mongoose model

## Dependencias externas
- `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`
- `bcrypt`
- `class-validator`, `class-transformer`
