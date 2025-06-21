---
applyTo: '**'
---

We use docker to manage our development environment and ensure consistency across different setups. Below are the instructions for using Docker.

---

description: Docker containerization guidelines and best practices
globs:
alwaysApply: true

---

# Docker Guidelines

## Container Strategy

### Core Principles

- **All services must be containerized** for consistent development and deployment
- **Multi-stage builds** for optimized production images
- **Security-first approach** with non-root users and minimal base images
- **Environment parity** between development, staging, and production

## Dockerfile Best Practices

### Frontend (React/Next.js) Dockerfile

```dockerfile
# Multi-stage build for React/Next.js application
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=false

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn build

FROM node:18-alpine AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

### Backend (NestJS) Dockerfile

```dockerfile
# Multi-stage build for NestJS application
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=false

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn build

FROM node:18-alpine AS runner
WORKDIR /app

# Install dumb-init for signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy package.json for production dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production && yarn cache clean

# Copy built application
COPY --from=builder /app/dist ./dist

# Change ownership to non-root user
RUN chown -R nestjs:nodejs /app
USER nestjs

EXPOSE 3001
ENV PORT 3001

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main"]
```

### Development Dockerfile

```dockerfile
FROM node:18-alpine
WORKDIR /app

# Install dependencies
COPY package.json yarn.lock ./
RUN yarn install

# Copy source code
COPY . .

# Install development tools
RUN yarn global add @nestjs/cli

EXPOSE 3000 3001
CMD ["yarn", "start:dev"]
```

## Docker Compose Configuration

### Development Environment

```yaml
# docker-compose.dev.yml
version: "3.8"

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.dev
      target: frontend
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - NEXT_PUBLIC_API_URL=http://localhost:3001
    depends_on:
      - backend

  backend:
    build:
      context: .
      dockerfile: Dockerfile.dev
      target: backend
    ports:
      - "3001:3001"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - DATABASE_URL=mongodb://mongo:27017/dev
      - REDIS_URL=redis://redis:6379
    depends_on:
      - mongo
      - redis

  mongo:
    image: mongo:6-focal
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
      - ./scripts/mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password
      - MONGO_INITDB_DATABASE=dev

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes

  mongo-express:
    image: mongo-express:latest
    ports:
      - "8081:8081"
    environment:
      - ME_CONFIG_MONGODB_ADMINUSERNAME=admin
      - ME_CONFIG_MONGODB_ADMINPASSWORD=password
      - ME_CONFIG_MONGODB_URL=mongodb://admin:password@mongo:27017/
    depends_on:
      - mongo

volumes:
  mongo_data:
  redis_data:
```

### Production Environment

```yaml
# docker-compose.prod.yml
version: "3.8"

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
      target: frontend-runner
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=${API_URL}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  backend:
    build:
      context: .
      dockerfile: Dockerfile
      target: backend-runner
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - JWT_SECRET=${JWT_SECRET}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    build:
      context: ./nginx
      dockerfile: Dockerfile
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
    restart: unless-stopped
```

## Image Optimization

### Build Optimization

```dockerfile
# Use specific versions
FROM node:18.17.0-alpine

# Combine RUN commands to reduce layers
RUN apk add --no-cache \
    git \
    curl \
    && rm -rf /var/cache/apk/*

# Use .dockerignore to exclude unnecessary files
# .dockerignore
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.nyc_output
coverage
.coverage
.cache
test-images
demo-videos
```

### Security Hardening

```dockerfile
# Use non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

# Set secure file permissions
COPY --chown=nextjs:nodejs . .

# Use COPY instead of ADD
COPY package.json ./
COPY --from=builder /app/dist ./dist

# Minimize attack surface
RUN rm -rf /tmp/* /var/tmp/*
```

## Health Checks

### Application Health Checks

```dockerfile
# Add health check to Dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
```

### Health Check Endpoints

```typescript
// NestJS health check
@Controller("health")
export class HealthController {
  constructor(
    private readonly healthCheckService: HealthCheckService,
    private readonly mongooseHealthIndicator: MongooseHealthIndicator
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.healthCheckService.check([
      () => this.mongooseHealthIndicator.pingCheck("database"),
    ]);
  }
}
```

## Development Workflow

### Local Development Setup

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f backend

# Execute commands in running container
docker-compose -f docker-compose.dev.yml exec backend yarn test

# Stop and cleanup
docker-compose -f docker-compose.dev.yml down -v
```

### Database Management

```bash
# Backup database
docker exec mongo mongodump --host localhost --db dev --out /backup

# Restore database
docker exec mongo mongorestore --host localhost --db dev /backup/dev

# Connect to MongoDB
docker-compose exec mongo mongo -u admin -p password
```

## Production Deployment

### Container Registry

```bash
# Build and tag images
docker build -t myapp/frontend:latest -t myapp/frontend:1.0.0 .
docker build -t myapp/backend:latest -t myapp/backend:1.0.0 .

# Push to registry
docker push myapp/frontend:1.0.0
docker push myapp/backend:1.0.0
```

### Rolling Updates

```yaml
# docker-compose.prod.yml with rolling updates
deploy:
  replicas: 3
  update_config:
    parallelism: 1
    delay: 10s
    failure_action: rollback
  restart_policy:
    condition: on-failure
    delay: 5s
    max_attempts: 3
```

## Monitoring and Logging

### Container Monitoring

```yaml
# Add monitoring to docker-compose
prometheus:
  image: prom/prometheus:latest
  ports:
    - "9090:9090"
  volumes:
    - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml

grafana:
  image: grafana/grafana:latest
  ports:
    - "3030:3000"
  environment:
    - GF_SECURITY_ADMIN_PASSWORD=admin
```

### Logging Configuration

```dockerfile
# Configure logging driver
LABEL logging="json-file"
ENV LOGGING_DRIVER=json-file
ENV LOGGING_OPTS="max-size=10m,max-file=3"
```

## Security Best Practices

### Image Security

```dockerfile
# Scan for vulnerabilities
RUN npm audit --audit-level high

# Use specific base image versions
FROM node:18.17.0-alpine@sha256:abc123...

# Remove unnecessary packages
RUN apk del .build-deps
```

### Runtime Security

```yaml
# docker-compose security settings
security_opt:
  - no-new-privileges:true
cap_drop:
  - ALL
cap_add:
  - CHOWN
  - SETGID
  - SETUID
read_only: true
tmpfs:
  - /tmp
  - /var/tmp
```

## Environment Management

### Environment Variables

```bash
# .env.docker
NODE_ENV=development
DATABASE_URL=mongodb://mongo:27017/dev
REDIS_URL=redis://redis:6379
JWT_SECRET=your-secret-key
LOG_LEVEL=debug
```

### Secrets Management

```yaml
# Using Docker secrets
secrets:
  jwt_secret:
    external: true
  db_password:
    external: true

services:
  backend:
    secrets:
      - jwt_secret
      - db_password
```

## Troubleshooting

### Common Issues

```bash
# Debug container issues
docker logs <container_id>
docker exec -it <container_id> /bin/sh

# Check container resources
docker stats

# Inspect container configuration
docker inspect <container_id>

# Clean up unused resources
docker system prune -a
```

### Performance Optimization

```dockerfile
# Optimize layer caching
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Use multi-stage builds
FROM builder AS final
COPY --from=builder /app/dist ./dist
```

This Docker configuration ensures consistent, secure, and scalable containerized applications across all environments.
