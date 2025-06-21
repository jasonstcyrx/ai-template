# Service Initialization System

## Overview

The Service Initialization System allows you to quickly scaffold new services and automatically integrate them into the Docker infrastructure. This system supports multiple service types and automatically handles all the boilerplate code, Docker configuration, and service registration.

## Supported Service Types

### 1. NestJS Backend (`nestjs-backend`)
Creates a full-featured NestJS backend service with:
- ✅ TypeScript configuration
- ✅ Swagger/OpenAPI documentation
- ✅ Health check endpoints
- ✅ Database integration (optional)
- ✅ JWT authentication (optional)
- ✅ Validation pipes
- ✅ CORS configuration
- ✅ Production-ready Dockerfiles

### 2. React Frontend (`react-frontend`)
Creates a modern React frontend application with:
- ✅ Vite build system
- ✅ TypeScript support
- ✅ Material-UI components
- ✅ Zustand state management
- ✅ SWR data fetching
- ✅ React Router navigation
- ✅ Nginx production configuration
- ✅ Hot reloading in development

### 3. Microservice (`microservice`)
Creates a lightweight Node.js microservice with:
- ✅ Express.js framework
- ✅ TypeScript support
- ✅ Health check endpoints
- ✅ Security middleware (Helmet, CORS)
- ✅ Logging with Morgan
- ✅ Production-ready setup

### 4. Worker Service (`worker`)
Creates a background worker service with:
- ✅ BullMQ job processing
- ✅ Redis integration
- ✅ TypeScript support
- ✅ Graceful shutdown handling
- ✅ Job queue management

## Quick Start

### Using NPM Scripts (Recommended)

```bash
# Create a new NestJS backend
yarn init:backend user-service --port 3001 --database --auth

# Create a new React frontend
yarn init:frontend admin-dashboard --port 5174

# Create a microservice
yarn init:microservice notification-service --port 3002

# Create a worker service
yarn init:worker email-worker

# Get help
yarn service:help
```

### Using the Script Directly

```bash
# Basic usage
./scripts/init-service.sh <service-type> <service-name> [options]

# Examples
./scripts/init-service.sh nestjs-backend api-gateway --port 3001 --database
./scripts/init-service.sh react-frontend mobile-app --port 5175
./scripts/init-service.sh microservice analytics-service
./scripts/init-service.sh worker data-processor
```

## Command Options

### Global Options
- `--port <port>` - Specify custom port (auto-assigned if not provided)
- `--dry-run` - Show what would be created without creating files
- `--help` - Show detailed help information

### NestJS Backend Options
- `--database` - Include MongoDB database connection
- `--auth` - Include JWT authentication setup

### Automatic Features

All services automatically include:
- 🐳 **Docker Integration** - Development and production Dockerfiles
- 🔒 **Security** - Non-root containers, security headers
- 🏥 **Health Checks** - Proper health monitoring
- 📊 **Logging** - Structured logging configuration
- 🔗 **Service Discovery** - Automatic Docker Compose integration
- 📚 **Documentation** - Generated README files

## Port Management

The system automatically assigns ports to avoid conflicts:

| Service Type | Port Range | Default Start |
|--------------|------------|---------------|
| NestJS Backend | 3001-3099 | 3001 |
| Microservice | 3001-3099 | 3001 |
| React Frontend | 5174-5199 | 5174 |
| Worker | No ports | N/A |

## Generated Project Structure

### NestJS Backend
```
apps/your-service/
├── src/
│   ├── main.ts              # Application entry point
│   ├── app.module.ts        # Root module
│   ├── app.controller.ts    # Health check controller
│   └── app.service.ts       # Basic service
├── Dockerfile               # Production build
├── Dockerfile.dev           # Development build
├── package.json             # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── tsconfig.build.json     # Build configuration
```

### React Frontend
```
apps/your-frontend/
├── src/                     # Vite-generated React app
├── Dockerfile               # Production build with Nginx
├── Dockerfile.dev           # Development build
├── nginx.conf              # Nginx configuration
└── package.json            # Dependencies and scripts
```

### Microservice
```
apps/your-microservice/
├── src/
│   └── index.ts            # Express application
├── Dockerfile              # Production build
├── Dockerfile.dev          # Development build
├── package.json            # Dependencies and scripts
└── tsconfig.json          # TypeScript configuration
```

### Worker Service
```
apps/your-worker/
├── src/
│   └── index.ts            # BullMQ worker
├── Dockerfile              # Production build
├── Dockerfile.dev          # Development build
├── package.json            # Dependencies and scripts
└── tsconfig.json          # TypeScript configuration
```

## Docker Integration

Each service is automatically added to both development and production Docker Compose files:

### Development (`docker-compose.yml`)
- Hot reloading enabled
- Volume mounts for live development
- Debug capabilities
- Development environment variables

### Production (`docker-compose.prod.yml`)
- Optimized multi-stage builds
- Resource limits
- Production environment variables
- Health checks with increased timeouts
- Restart policies

## Environment Variables

Services are automatically configured with appropriate environment variables:

### Backend Services
```bash
NODE_ENV=development|production
PORT=3001
MONGODB_URI=mongodb://user:pass@mongodb:27017/service_db?authSource=admin
REDIS_URL=redis://redis:6379
JWT_SECRET=${JWT_SECRET}
```

### Frontend Services
```bash
NODE_ENV=development|production
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=service-name
VITE_NODE_ENV=development|production
```

### Worker Services
```bash
NODE_ENV=development|production
REDIS_URL=redis://redis:6379
MONGODB_URI=mongodb://user:pass@mongodb:27017/service_db?authSource=admin
```

## Development Workflow

### 1. Create a New Service

```bash
# Create a new backend service
yarn init:backend order-service --port 3003 --database

# The system will:
# ✅ Create the service directory structure
# ✅ Generate all boilerplate code
# ✅ Create Docker configurations
# ✅ Add to docker-compose files
# ✅ Set up proper networking
```

### 2. Install Dependencies

```bash
cd apps/order-service
yarn install
```

### 3. Start Development

```bash
# Start all services including the new one
yarn dev

# Or start just the new service
yarn docker:rebuild order-service
```

### 4. Access Your Service

- **Backend**: http://localhost:3003
- **API Docs**: http://localhost:3003/api/docs
- **Health Check**: http://localhost:3003/health

## Advanced Configuration

### Custom Dockerfile

You can customize the generated Dockerfiles after creation:

```dockerfile
# Add custom dependencies or configurations
RUN apk add --no-cache some-package

# Add custom build steps
COPY custom-config.json ./
```

### Custom Environment Variables

Add custom environment variables to the Docker Compose files:

```yaml
environment:
  - NODE_ENV=development
  - CUSTOM_API_KEY=${CUSTOM_API_KEY}
  - FEATURE_FLAG_X=true
```

### Database Collections

For services with database integration, collections are automatically created:

```javascript
// Automatically configured in app.module.ts
MongooseModule.forRoot(
  process.env.MONGODB_URI || 
  'mongodb://admin:password@mongodb:27017/service_db?authSource=admin'
)
```

## Service Dependencies

The system automatically configures service dependencies:

### Backend Services
- Depends on: MongoDB, Redis
- Health checks ensure dependencies are ready

### Frontend Services  
- Depends on: Backend services
- Waits for API to be available

### Worker Services
- Depends on: Redis (and optionally MongoDB)
- Connects to job queues automatically

## Monitoring and Health Checks

All services include comprehensive health monitoring:

```typescript
// Automatic health check endpoint
@Get('health')
getHealth() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'service-name',
    version: '1.0.0',
  };
}
```

### Health Check Configuration
- **Interval**: 30 seconds
- **Timeout**: 3-5 seconds
- **Retries**: 3-5 times
- **Start Period**: 5-30 seconds (varies by service type)

## Production Deployment

Services created with the initialization system are production-ready:

### Optimizations
- ✅ Multi-stage Docker builds
- ✅ Non-root containers
- ✅ Resource limits
- ✅ Security headers
- ✅ Gzip compression
- ✅ Static asset caching

### Scaling
```bash
# Scale a backend service
docker-compose up -d --scale order-service=3

# Scale with production compose
docker-compose -f docker-compose.prod.yml up -d --scale order-service=3
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   lsof -i :3001
   
   # Or specify a different port
   yarn init:backend my-service --port 3005
   ```

2. **Service Won't Start**
   ```bash
   # Check logs
   yarn docker:logs my-service
   
   # Check health
   yarn docker:status
   ```

3. **Dependencies Not Ready**
   ```bash
   # Services wait for dependencies, check if they're healthy
   docker-compose ps
   
   # Restart if needed
   yarn docker:restart
   ```

### Debugging

```bash
# Access service container
yarn docker:shell my-service

# View service logs
yarn docker:logs my-service

# Check Docker Compose configuration
docker-compose config
```

## Best Practices

### Service Naming
- Use lowercase with hyphens: `user-service`, `admin-dashboard`
- Be descriptive: `notification-worker`, `analytics-api`
- Avoid generic names: `service1`, `app2`

### Port Selection
- Let the system auto-assign ports when possible
- Reserve specific ports for well-known services
- Document custom port assignments

### Environment Configuration
- Use the `.env` file for development settings
- Never commit sensitive production values
- Use Docker secrets for production passwords

### Code Organization
- Follow the generated structure
- Keep services focused on single responsibilities
- Use shared libraries for common functionality

## Examples

### E-commerce Platform Services

```bash
# Core API
yarn init:backend product-service --port 3001 --database --auth
yarn init:backend order-service --port 3002 --database --auth
yarn init:backend user-service --port 3003 --database --auth

# Frontend Applications
yarn init:frontend customer-app --port 5174
yarn init:frontend admin-dashboard --port 5175

# Microservices
yarn init:microservice payment-gateway --port 3004
yarn init:microservice notification-service --port 3005

# Background Workers
yarn init:worker email-worker
yarn init:worker order-processor
yarn init:worker analytics-worker
```

### Development Team Services

```bash
# API Gateway
yarn init:backend api-gateway --port 3001 --auth

# Service mesh
yarn init:microservice service-discovery --port 3010
yarn init:microservice config-service --port 3011

# Monitoring
yarn init:microservice metrics-collector --port 3020
yarn init:worker log-processor

# Frontend
yarn init:frontend dev-portal --port 5180
```

## Integration with Existing Services

The initialization system works seamlessly with existing services:

1. **Existing Docker Compose** - Automatically adds to existing configurations
2. **Network Integration** - Uses the same Docker network
3. **Environment Variables** - Shares the same `.env` configuration
4. **Database Access** - Connects to existing MongoDB instance
5. **Cache Sharing** - Uses the same Redis instance

## Next Steps

After creating services with the initialization system:

1. **Customize Business Logic** - Add your specific functionality
2. **Add Tests** - Include unit and integration tests
3. **API Documentation** - Expand Swagger documentation
4. **Security** - Add authentication and authorization
5. **Monitoring** - Add application-specific metrics
6. **Deployment** - Configure CI/CD pipelines

---

The Service Initialization System provides a solid foundation for rapid service development while maintaining consistency, security, and production readiness across your entire platform. 