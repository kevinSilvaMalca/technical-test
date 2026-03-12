# Agente: Infraestructura

## Responsabilidad
Contenerización, despliegue en AWS y pipelines de CI/CD.

---

## Docker

### Archivos requeridos
- `Dockerfile`: multi-stage (build + production)
- `docker-compose.yml`: api + mongo + mongo-express para desarrollo local
- `.dockerignore`: exclusiones para imagen de producción

### Dockerfile (multi-stage)
```
Stage 1 (builder): node:20-alpine, instala deps, compila TypeScript
Stage 2 (production): node:20-alpine, solo deps de producción, copia dist/
```

### docker-compose.yml servicios
- `api`: build local, puerto 3000, depende de mongo, carga variables desde .env
- `mongo`: imagen mongo:7, volumen persistente, puerto 27017
- `mongo-express`: puerto 8081, conectado a mongo, interfaz visual de la BD

### .dockerignore
```
node_modules
dist
.env
coverage
*.md
*.log
.git
test/
```

---

## Variables de entorno

Archivo `.env.example` con todas las variables requeridas:

```
# App
NODE_ENV=development
API_PORT=3000

# JWT
JWT_SECRET=your-secret-here
JWT_EXPIRES_IN=7d

# MongoDB (individual — para docker-compose)
MONGO_HOST=mongo
MONGO_PORT=27017
MONGO_DATABASE=technical-test
MONGO_USERNAME=root
MONGO_PASSWORD=root

# MongoDB (URI — para Atlas en producción o conexión directa)
MONGODB_URI=mongodb://root:root@mongo:27017/technical-test

# Seed
SEED_ADMIN_EMAIL=admin@technical-test.com
SEED_ADMIN_PASSWORD=Admin123!

# AWS (solo producción)
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=
```

### Nota
- En desarrollo local se usa `MONGODB_URI` construida desde las variables individuales
- En producción (ECS) se usa `MONGODB_URI` con la connection string de Atlas M0

---

## Seed

El seed **no corre en el pipeline**. Se ejecuta manualmente una sola vez:

```bash
npm run seed
```

Requiere que `MONGODB_URI` esté configurado en el `.env` local o en el entorno de destino.

---

## AWS ECS + CDK

POC setup — un solo servicio ECS para el API. MongoDB corre en Atlas M0 (externo, gratuito).

### Stack CDK (`infra/`)
- `infra/bin/app.ts`: entry point CDK
- `infra/lib/ecs-stack.ts`: define el stack ECS

### Recursos AWS a crear
- **ECR**: repositorio de imágenes Docker
- **ECS Fargate**: cluster + task definition + service (solo API)
- **ALB**: Application Load Balancer (puerto 80 → 3000)
- **VPC**: subnets públicas (mínimo para POC)
- **Secrets Manager**: JWT_SECRET y MONGODB_URI (Atlas connection string)
- **CloudWatch Logs**: log group para la aplicación

### Configuración ECS
- CPU: 256, Memory: 512 (mínimo viable para POC)
- Min tasks: 1, Max tasks: 1 (sin auto-scaling en POC)
- Health check: `GET /health`

---

## GitHub Actions (CI/CD)

### `.github/workflows/ci.yml` — en cada push y PR
```
1. Checkout
2. Setup Node 20
3. Install dependencies (npm ci)
4. Lint (ESLint config por defecto NestJS)
5. Tests con cobertura (jest --coverage) — falla si baja del 85%
6. Build TypeScript
```

### `.github/workflows/cd.yml` — solo en push a main
```
1. Ejecuta todos los pasos de ci.yml
2. Configurar credenciales AWS desde GitHub Secrets
3. Login a AWS ECR
4. Build imagen Docker
5. Push a ECR con tag del commit SHA
6. CDK deploy (cdk deploy --require-approval never)
7. Actualizar servicio ECS con la nueva imagen
```

### Secrets requeridos en GitHub
```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION
AWS_ACCOUNT_ID
ECR_REPOSITORY
ECS_CLUSTER
ECS_SERVICE
```

---

## Health Check

Endpoint: `GET /health`
Respuesta: `{ status: 'ok', timestamp: ISO_DATE, uptime: seconds }`

Sin autenticación. Usado por ALB y ECS para verificar que el contenedor está vivo.

---

## Tests de infraestructura

- `cdk synth` debe completar sin errores antes de cada deploy
- Smoke test del endpoint `/health` tras deploy en CD
