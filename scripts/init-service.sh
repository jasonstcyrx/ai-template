#!/bin/bash

# Service Initialization Script
# Creates new services and integrates them into the Docker infrastructure

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}[INIT]${NC} $1"
}

# Function to validate service name
validate_service_name() {
    local name=$1
    if [[ ! $name =~ ^[a-z][a-z0-9-]*$ ]]; then
        print_error "Invalid service name. Use lowercase letters, numbers, and hyphens only. Must start with a letter."
        exit 1
    fi
    
    if [ -d "apps/$name" ]; then
        print_error "Service '$name' already exists in apps/ directory."
        exit 1
    fi
}

# Function to show help
show_help() {
    echo "Service Initialization Script"
    echo ""
    echo "Usage: $0 <service-type> <service-name> [options]"
    echo ""
    echo "Service Types:"
    echo "  nestjs-backend     Create a new NestJS backend service"
    echo "  react-frontend     Create a new React frontend application"
    echo "  microservice      Create a generic Node.js microservice"
    echo "  worker            Create a background worker service"
    echo ""
    echo "Options:"
    echo "  --port <port>     Specify custom port (default: auto-assigned)"
    echo "  --database        Include database connection (for backends)"
    echo "  --auth           Include authentication setup"
    echo "  --dry-run        Show what would be created without creating"
    echo ""
    echo "Examples:"
    echo "  $0 nestjs-backend user-service --port 3001 --database"
    echo "  $0 react-frontend admin-dashboard --port 5174"
    echo "  $0 microservice notification-service --port 3002"
    echo "  $0 worker email-worker"
    echo ""
}

# Function to get next available port
get_next_port() {
    local service_type=$1
    local custom_port=$2
    
    if [ -n "$custom_port" ]; then
        echo $custom_port
        return
    fi
    
    case $service_type in
        "nestjs-backend"|"microservice")
            # Start from 3001 for backend services
            for port in {3001..3099}; do
                if ! grep -q "$port:" docker-compose.yml 2>/dev/null; then
                    echo $port
                    return
                fi
            done
            ;;
        "react-frontend")
            # Start from 5174 for frontend services
            for port in {5174..5199}; do
                if ! grep -q "$port:" docker-compose.yml 2>/dev/null; then
                    echo $port
                    return
                fi
            done
            ;;
        "worker")
            # Workers don't need exposed ports
            echo ""
            return
            ;;
    esac
    
    print_error "No available ports found for service type: $service_type"
    exit 1
}

# Function to create NestJS backend service
create_nestjs_backend() {
    local service_name=$1
    local port=$2
    local include_db=$3
    local include_auth=$4
    
    print_header "Creating NestJS Backend Service: $service_name"
    
    local service_dir="apps/$service_name"
    mkdir -p "$service_dir"
    
    # Create package.json
    cat > "$service_dir/package.json" << EOF
{
  "name": "$service_name",
  "version": "0.0.1",
  "description": "$service_name backend service",
  "author": "",
  "private": true,
  "license": "UNLICENSED",
  "scripts": {
    "build": "nest build",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  },
  "dependencies": {
    "@nestjs/common": "^10.3.0",
    "@nestjs/core": "^10.3.0",
    "@nestjs/platform-express": "^10.3.0",
    "@nestjs/config": "^3.1.1",
    "@nestjs/swagger": "^7.1.17"$([ "$include_db" = "true" ] && echo ',
    "@nestjs/mongoose": "^10.0.4",
    "mongoose": "^8.0.3"')$([ "$include_auth" = "true" ] && echo ',
    "@nestjs/jwt": "^10.2.0",
    "@nestjs/passport": "^10.0.2",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1"'),
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1",
    "reflect-metadata": "^0.1.14",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.3.0",
    "@nestjs/schematics": "^10.1.0",
    "@nestjs/testing": "^10.3.0",
    "@types/express": "^4.17.21",
    "@types/jest": "^29.5.8",
    "@types/node": "^18.19.0",
    "@types/supertest": "^2.0.16"$([ "$include_auth" = "true" ] && echo ',
    "@types/passport-jwt": "^4.0.0"'),
    "@typescript-eslint/eslint-plugin": "^6.12.0",
    "@typescript-eslint/parser": "^6.12.0",
    "eslint": "^8.54.0",
    "eslint-config-prettier": "^9.0.0",
    "eslint-plugin-prettier": "^5.0.1",
    "jest": "^29.7.0",
    "prettier": "^3.1.0",
    "source-map-support": "^0.5.21",
    "supertest": "^6.3.3",
    "ts-jest": "^29.1.1",
    "ts-loader": "^9.5.1",
    "ts-node": "^10.9.1",
    "tsconfig-paths": "^4.2.0",
    "typescript": "^5.3.2"
  }
}
EOF

    # Create TypeScript config
    mkdir -p "$service_dir/src"
    cat > "$service_dir/tsconfig.json" << EOF
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": false,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "forceConsistentCasingInFileNames": false,
    "noFallthroughCasesInSwitch": false
  }
}
EOF

    cat > "$service_dir/tsconfig.build.json" << EOF
{
  "extends": "./tsconfig.json",
  "exclude": ["node_modules", "test", "dist", "**/*spec.ts"]
}
EOF

    # Create main.ts
    cat > "$service_dir/src/main.ts" << EOF
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // API prefix
  app.setGlobalPrefix('api');

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('$service_name API')
    .setDescription('$service_name service API documentation')
    .setVersion('1.0')
    .addTag('${service_name}')
    .addBearerAuth()
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || $port;
  await app.listen(port);
  
  console.log(\`🚀 $service_name service running on http://localhost:\${port}\`);
  console.log(\`📚 API Documentation available at http://localhost:\${port}/api/docs\`);
}

bootstrap();
EOF

    # Create app.module.ts
    cat > "$service_dir/src/app.module.ts" << EOF
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';$([ "$include_db" = "true" ] && echo '
import { MongooseModule } from '"'"'@nestjs/mongoose'"'"';')
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),$([ "$include_db" = "true" ] && echo '
    MongooseModule.forRoot(process.env.MONGODB_URI || '"'"'mongodb://admin:procurement_password@mongodb:27017/'"$service_name"'_db?authSource=admin'"'"'),')
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
EOF

    # Create app.controller.ts
    cat > "$service_dir/src/app.controller.ts" << EOF
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Get service status' })
  @ApiResponse({ status: 200, description: 'Service is running' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: '$service_name',
      version: '1.0.0',
    };
  }
}
EOF

    # Create app.service.ts
    cat > "$service_dir/src/app.service.ts" << EOF
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return '$service_name service is running!';
  }
}
EOF

    # Create Dockerfiles
    create_nestjs_dockerfiles "$service_name" "$port"
    
    print_success "NestJS backend service '$service_name' created successfully!"
}

# Function to create React frontend service
create_react_frontend() {
    local service_name=$1
    local port=$2
    
    print_header "Creating React Frontend Service: $service_name"
    
    local service_dir="apps/$service_name"
    
    # Use Vite to create React app
    print_status "Initializing React application with Vite..."
    cd apps
    yarn create vite "$service_name" --template react-ts
    cd ..
    
    # Install additional dependencies
    print_status "Installing additional dependencies..."
    cd "$service_dir"
    yarn add @mui/material @emotion/react @emotion/styled @mui/icons-material swr zustand "react-router-dom@^6.26.0"
    cd ../..
    
    # Create Dockerfiles
    create_react_dockerfiles "$service_name" "$port"
    
    # Create nginx.conf
    cat > "$service_dir/nginx.conf" << EOF
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html index.htm;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;

    # Handle React Router (SPA routing)
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Static assets caching
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg)\$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\\n";
        add_header Content-Type text/plain;
    }
}
EOF

    print_success "React frontend service '$service_name' created successfully!"
}

# Function to create generic microservice
create_microservice() {
    local service_name=$1
    local port=$2
    
    print_header "Creating Microservice: $service_name"
    
    local service_dir="apps/$service_name"
    mkdir -p "$service_dir/src"
    
    # Create package.json
    cat > "$service_dir/package.json" << EOF
{
  "name": "$service_name",
  "version": "1.0.0",
  "description": "$service_name microservice",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "start:dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint src/**/*.ts --fix"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/morgan": "^1.9.9",
    "@types/node": "^18.19.0",
    "typescript": "^5.3.2",
    "ts-node-dev": "^2.0.0",
    "eslint": "^8.54.0",
    "@typescript-eslint/eslint-plugin": "^6.12.0",
    "@typescript-eslint/parser": "^6.12.0",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.8"
  }
}
EOF

    # Create TypeScript config
    cat > "$service_dir/tsconfig.json" << EOF
{
  "compilerOptions": {
    "target": "ES2021",
    "module": "commonjs",
    "lib": ["ES2021"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF

    # Create main service file
    cat > "$service_dir/src/index.ts" << EOF
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

const app = express();
const port = process.env.PORT || $port;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: '$service_name',
    version: '1.0.0',
  });
});

// Main route
app.get('/', (req, res) => {
  res.json({
    message: '$service_name microservice is running!',
    service: '$service_name',
    version: '1.0.0',
  });
});

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(port, () => {
  console.log(\`🚀 $service_name microservice running on http://localhost:\${port}\`);
});
EOF

    # Create Dockerfiles
    create_microservice_dockerfiles "$service_name" "$port"
    
    print_success "Microservice '$service_name' created successfully!"
}

# Function to create worker service
create_worker() {
    local service_name=$1
    
    print_header "Creating Worker Service: $service_name"
    
    local service_dir="apps/$service_name"
    mkdir -p "$service_dir/src"
    
    # Create package.json
    cat > "$service_dir/package.json" << EOF
{
  "name": "$service_name",
  "version": "1.0.0",
  "description": "$service_name worker service",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "start:dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "test": "jest",
    "lint": "eslint src/**/*.ts --fix"
  },
  "dependencies": {
    "bullmq": "^4.15.0",
    "ioredis": "^5.3.2",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "@types/node": "^18.19.0",
    "typescript": "^5.3.2",
    "ts-node-dev": "^2.0.0",
    "eslint": "^8.54.0",
    "@typescript-eslint/eslint-plugin": "^6.12.0",
    "@typescript-eslint/parser": "^6.12.0",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.8"
  }
}
EOF

    # Create worker service
    cat > "$service_dir/src/index.ts" << EOF
import { Worker, Queue } from 'bullmq';
import Redis from 'ioredis';
import * as dotenv from 'dotenv';

dotenv.config();

const redis = new Redis(process.env.REDIS_URL || 'redis://redis:6379');

// Create worker
const worker = new Worker('$service_name-queue', async (job) => {
  console.log(\`Processing job \${job.id} with data:\`, job.data);
  
  // Add your job processing logic here
  switch (job.name) {
    case 'example-task':
      await processExampleTask(job.data);
      break;
    default:
      console.log(\`Unknown job type: \${job.name}\`);
  }
}, {
  connection: redis,
});

async function processExampleTask(data: any) {
  console.log('Processing example task:', data);
  // Simulate work
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('Example task completed');
}

worker.on('completed', (job) => {
  console.log(\`Job \${job.id} completed successfully\`);
});

worker.on('failed', (job, err) => {
  console.error(\`Job \${job?.id} failed:\`, err);
});

worker.on('error', (err) => {
  console.error('Worker error:', err);
});

console.log(\`🚀 $service_name worker started\`);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down worker...');
  await worker.close();
  await redis.quit();
  process.exit(0);
});
EOF

    # Create Dockerfiles
    create_worker_dockerfiles "$service_name"
    
    print_success "Worker service '$service_name' created successfully!"
}

# Helper functions to create Dockerfiles
create_nestjs_dockerfiles() {
    local service_name=$1
    local port=$2
    local service_dir="apps/$service_name"
    
    # Production Dockerfile
    cat > "$service_dir/Dockerfile" << EOF
# Production Dockerfile for $service_name
FROM node:18-alpine AS builder

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=false
COPY . .
RUN yarn build

FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=true

FROM node:18-alpine AS production
RUN apk add --no-cache curl
WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \\
    adduser -S $service_name -u 1001 -G nodejs

COPY --from=builder --chown=$service_name:nodejs /app/dist ./dist
COPY --from=deps --chown=$service_name:nodejs /app/node_modules ./node_modules
COPY --chown=$service_name:nodejs package.json ./

RUN chown -R $service_name:nodejs /app
USER $service_name

EXPOSE $port

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:$port/health || exit 1

CMD ["node", "dist/main.js"]
EOF

    # Development Dockerfile
    cat > "$service_dir/Dockerfile.dev" << EOF
# Development Dockerfile for $service_name
FROM node:18-alpine

RUN apk add --no-cache curl
WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \\
    adduser -S $service_name -u 1001 -G nodejs

RUN chown -R $service_name:nodejs /app
USER $service_name

COPY --chown=$service_name:nodejs package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY --chown=$service_name:nodejs . .

EXPOSE $port

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \\
  CMD curl -f http://localhost:$port/health || exit 1

CMD ["yarn", "start:dev"]
EOF
}

create_react_dockerfiles() {
    local service_name=$1
    local port=$2
    local service_dir="apps/$service_name"
    
    # Production Dockerfile
    cat > "$service_dir/Dockerfile" << EOF
# Production Dockerfile for $service_name
FROM node:18-alpine AS builder

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=false
COPY . .
RUN yarn build

FROM nginx:alpine AS production
RUN apk add --no-cache curl

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

RUN addgroup -g 1001 -S nodejs && \\
    adduser -S $service_name -u 1001 -G nodejs

RUN chown -R $service_name:nodejs /usr/share/nginx/html && \\
    chown -R $service_name:nodejs /var/cache/nginx && \\
    chown -R $service_name:nodejs /var/log/nginx && \\
    chown -R $service_name:nodejs /etc/nginx/conf.d

USER $service_name

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:80 || exit 1

CMD ["nginx", "-g", "daemon off;"]
EOF

    # Development Dockerfile
    cat > "$service_dir/Dockerfile.dev" << EOF
# Development Dockerfile for $service_name
FROM node:18-alpine

RUN apk add --no-cache curl
WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \\
    adduser -S $service_name -u 1001 -G nodejs

RUN chown -R $service_name:nodejs /app
USER $service_name

COPY --chown=$service_name:nodejs package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY --chown=$service_name:nodejs . .

EXPOSE $port

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:$port || exit 1

CMD ["yarn", "dev", "--host", "0.0.0.0"]
EOF
}

create_microservice_dockerfiles() {
    local service_name=$1
    local port=$2
    local service_dir="apps/$service_name"
    
    # Production Dockerfile
    cat > "$service_dir/Dockerfile" << EOF
# Production Dockerfile for $service_name
FROM node:18-alpine AS builder

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=false
COPY . .
RUN yarn build

FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=true

FROM node:18-alpine AS production
RUN apk add --no-cache curl
WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \\
    adduser -S $service_name -u 1001 -G nodejs

COPY --from=builder --chown=$service_name:nodejs /app/dist ./dist
COPY --from=deps --chown=$service_name:nodejs /app/node_modules ./node_modules
COPY --chown=$service_name:nodejs package.json ./

RUN chown -R $service_name:nodejs /app
USER $service_name

EXPOSE $port

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:$port/health || exit 1

CMD ["node", "dist/index.js"]
EOF

    # Development Dockerfile
    cat > "$service_dir/Dockerfile.dev" << EOF
# Development Dockerfile for $service_name
FROM node:18-alpine

RUN apk add --no-cache curl
WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \\
    adduser -S $service_name -u 1001 -G nodejs

RUN chown -R $service_name:nodejs /app
USER $service_name

COPY --chown=$service_name:nodejs package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY --chown=$service_name:nodejs . .

EXPOSE $port

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \\
  CMD curl -f http://localhost:$port/health || exit 1

CMD ["yarn", "start:dev"]
EOF
}

create_worker_dockerfiles() {
    local service_name=$1
    local service_dir="apps/$service_name"
    
    # Production Dockerfile
    cat > "$service_dir/Dockerfile" << EOF
# Production Dockerfile for $service_name
FROM node:18-alpine AS builder

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=false
COPY . .
RUN yarn build

FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=true

FROM node:18-alpine AS production
WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \\
    adduser -S $service_name -u 1001 -G nodejs

COPY --from=builder --chown=$service_name:nodejs /app/dist ./dist
COPY --from=deps --chown=$service_name:nodejs /app/node_modules ./node_modules
COPY --chown=$service_name:nodejs package.json ./

RUN chown -R $service_name:nodejs /app
USER $service_name

CMD ["node", "dist/index.js"]
EOF

    # Development Dockerfile
    cat > "$service_dir/Dockerfile.dev" << EOF
# Development Dockerfile for $service_name
FROM node:18-alpine

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \\
    adduser -S $service_name -u 1001 -G nodejs

RUN chown -R $service_name:nodejs /app
USER $service_name

COPY --chown=$service_name:nodejs package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY --chown=$service_name:nodejs . .

CMD ["yarn", "start:dev"]
EOF
}

# Parse command line arguments
SERVICE_TYPE=""
SERVICE_NAME=""
CUSTOM_PORT=""
INCLUDE_DATABASE=false
INCLUDE_AUTH=false
DRY_RUN=false

while [[ $# -gt 0 ]]; do
    case $1 in
        nestjs-backend|react-frontend|microservice|worker)
            if [ -z "$SERVICE_TYPE" ]; then
                SERVICE_TYPE=$1
            elif [ -z "$SERVICE_NAME" ]; then
                SERVICE_NAME=$1
            fi
            ;;
        --port)
            CUSTOM_PORT="$2"
            shift
            ;;
        --database)
            INCLUDE_DATABASE=true
            ;;
        --auth)
            INCLUDE_AUTH=true
            ;;
        --dry-run)
            DRY_RUN=true
            ;;
        --help|-h)
            show_help
            exit 0
            ;;
        *)
            if [ -z "$SERVICE_TYPE" ]; then
                SERVICE_TYPE=$1
            elif [ -z "$SERVICE_NAME" ]; then
                SERVICE_NAME=$1
            else
                print_error "Unknown option: $1"
                show_help
                exit 1
            fi
            ;;
    esac
    shift
done

# Validate arguments
if [ -z "$SERVICE_TYPE" ] || [ -z "$SERVICE_NAME" ]; then
    print_error "Both service type and service name are required."
    show_help
    exit 1
fi

# Validate service name
validate_service_name "$SERVICE_NAME"

# Get port for the service
SERVICE_PORT=$(get_next_port "$SERVICE_TYPE" "$CUSTOM_PORT")

if [ "$DRY_RUN" = true ]; then
    print_status "DRY RUN MODE - No files will be created"
    print_status "Would create:"
    print_status "  Service Type: $SERVICE_TYPE"
    print_status "  Service Name: $SERVICE_NAME"
    print_status "  Port: $SERVICE_PORT"
    print_status "  Database: $INCLUDE_DATABASE"
    print_status "  Auth: $INCLUDE_AUTH"
    exit 0
fi

# Create the service based on type
case $SERVICE_TYPE in
    "nestjs-backend")
        create_nestjs_backend "$SERVICE_NAME" "$SERVICE_PORT" "$INCLUDE_DATABASE" "$INCLUDE_AUTH"
        ;;
    "react-frontend")
        create_react_frontend "$SERVICE_NAME" "$SERVICE_PORT"
        ;;
    "microservice")
        create_microservice "$SERVICE_NAME" "$SERVICE_PORT"
        ;;
    "worker")
        create_worker "$SERVICE_NAME"
        ;;
    *)
        print_error "Unknown service type: $SERVICE_TYPE"
        show_help
        exit 1
        ;;
esac

# Add to Docker Compose
print_status "Adding service to Docker Compose configuration..."
node scripts/add-to-docker-compose.js "$SERVICE_TYPE" "$SERVICE_NAME" "$SERVICE_PORT"

print_success "Service '$SERVICE_NAME' has been created and added to Docker infrastructure!"
print_status "Next steps:"
echo "  1. Review the generated code in apps/$SERVICE_NAME"
echo "  2. Install dependencies: cd apps/$SERVICE_NAME && yarn install"
echo "  3. Start the service: yarn docker:rebuild $SERVICE_NAME"
echo "  4. Access at: http://localhost:$SERVICE_PORT" 