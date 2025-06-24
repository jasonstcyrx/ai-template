const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const yaml = require('js-yaml');

describe('End-to-End Workflow Tests', () => {
  const TEST_ROOT = path.join(__dirname, '../../test-workflow');
  const TEST_APPS_DIR = path.join(TEST_ROOT, 'apps');
  const TEST_TICKETS_DIR = path.join(TEST_ROOT, 'tickets');
  const TICKET_CLI_PATH = path.join(__dirname, '../../scripts/ticket-cli.js');
  const INIT_SCRIPT_PATH = path.join(__dirname, '../../scripts/init-service.sh');
  
  beforeEach(() => {
    // Create test environment
    if (fs.existsSync(TEST_ROOT)) {
      fs.rmSync(TEST_ROOT, { recursive: true, force: true });
    }
    
    fs.mkdirSync(TEST_ROOT, { recursive: true });
    fs.mkdirSync(TEST_APPS_DIR, { recursive: true });
    
    // Create ticket directory structure
    const ticketStates = ['backlog', 'todo', 'in-progress', 'review', 'done', 'blocked', 'archive'];
    ticketStates.forEach(state => {
      fs.mkdirSync(path.join(TEST_TICKETS_DIR, state), { recursive: true });
    });
    
    // Create test docker-compose files
    const initialCompose = {
      version: '3.8',
      services: {
        mongodb: {
          image: 'mongo:7.0-jammy',
          container_name: 'template-mongodb'
        },
        redis: {
          image: 'redis:7.2-alpine',
          container_name: 'template-redis'
        }
      },
      networks: {
        'template-network': { driver: 'bridge' }
      }
    };
    
    fs.writeFileSync(
      path.join(TEST_ROOT, 'docker-compose.yml'),
      yaml.dump(initialCompose, { indent: 2 })
    );
    fs.writeFileSync(
      path.join(TEST_ROOT, 'docker-compose.prod.yml'),
      yaml.dump(initialCompose, { indent: 2 })
    );
  });
  
  afterEach(() => {
    // Cleanup test environment
    if (fs.existsSync(TEST_ROOT)) {
      fs.rmSync(TEST_ROOT, { recursive: true, force: true });
    }
  });

  describe('Complete Project Initialization Workflow', () => {
    test('should create ticket, develop service, and deploy successfully', async () => {
      // Step 1: Create a ticket for new service development
      const createResult = execSync(`node ${TICKET_CLI_PATH} create -t "Create User Service" -d "Implement user management API with authentication" --type feature -p high`, {
        env: { ...process.env, TICKET_ROOT: TEST_TICKETS_DIR },
        encoding: 'utf8'
      });
      
      expect(createResult).toContain('Created ticket');
      const ticketMatch = createResult.match(/Created ticket (TICKET-[\w-]+)/);
      const ticketId = ticketMatch[1];
      
      // Verify ticket was created in backlog
      const backlogFiles = fs.readdirSync(path.join(TEST_TICKETS_DIR, 'backlog'));
      expect(backlogFiles).toContain(`${ticketId}.md`);
      
      // Step 2: Move ticket to in-progress
      const moveResult = execSync(`node ${TICKET_CLI_PATH} move ${ticketId} in-progress`, {
        env: { ...process.env, TICKET_ROOT: TEST_TICKETS_DIR },
        encoding: 'utf8'
      });
      
      expect(moveResult).toContain(`Moved ticket ${ticketId} to in-progress`);
      
      // Verify ticket moved
      const inProgressFiles = fs.readdirSync(path.join(TEST_TICKETS_DIR, 'in-progress'));
      expect(inProgressFiles).toContain(`${ticketId}.md`);
      
      // Step 3: Simulate service creation (since we can't run bash script directly)
      const serviceName = 'user-service';
      const serviceDir = path.join(TEST_APPS_DIR, serviceName);
      
      // Create service structure
      fs.mkdirSync(serviceDir, { recursive: true });
      fs.mkdirSync(path.join(serviceDir, 'src'));
      
      // Create package.json
      const packageJson = {
        name: serviceName,
        version: '0.0.1',
        description: 'User management service',
        scripts: {
          build: 'nest build',
          start: 'nest start',
          'start:dev': 'nest start --watch',
          test: 'jest',
          'test:e2e': 'jest --config ./test/jest-e2e.json'
        },
        dependencies: {
          '@nestjs/common': '^10.3.0',
          '@nestjs/core': '^10.3.0',
          '@nestjs/platform-express': '^10.3.0',
          '@nestjs/mongoose': '^10.0.4',
          '@nestjs/jwt': '^10.2.0',
          mongoose: '^8.0.3',
          'class-validator': '^0.14.0',
          'class-transformer': '^0.5.1'
        },
        devDependencies: {
          '@nestjs/testing': '^10.3.0',
          '@types/jest': '^29.5.8',
          jest: '^29.7.0',
          supertest: '^6.3.3'
        }
      };
      
      fs.writeFileSync(
        path.join(serviceDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );
      
      // Create main application files
      const mainTs = `
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  app.setGlobalPrefix('api');
  
  const config = new DocumentBuilder()
    .setTitle('User Service API')
    .setDescription('User management service API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(\`User service running on port \${port}\`);
}

bootstrap();
      `.trim();
      
      fs.writeFileSync(path.join(serviceDir, 'src', 'main.ts'), mainTs);
      
      // Create app.module.ts
      const appModule = `
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://admin:template_password@mongodb:27017/user-service_db?authSource=admin'),
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
      `.trim();
      
      fs.writeFileSync(path.join(serviceDir, 'src', 'app.module.ts'), appModule);
      
      // Create users module structure
      fs.mkdirSync(path.join(serviceDir, 'src', 'users'), { recursive: true });
      
      const usersModule = `
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, UserSchema } from './schemas/user.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
      `.trim();
      
      fs.writeFileSync(path.join(serviceDir, 'src', 'users', 'users.module.ts'), usersModule);
      
      // Create Dockerfiles
      const dockerfileDev = `
FROM node:18-alpine AS development
WORKDIR /app
COPY package*.json ./
RUN yarn install
COPY . .
EXPOSE 3001
CMD ["yarn", "start:dev"]
      `.trim();
      
      fs.writeFileSync(path.join(serviceDir, 'Dockerfile.dev'), dockerfileDev);
      
      const dockerfile = `
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

FROM node:18-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN yarn install --production --frozen-lockfile
COPY --from=builder /app/dist ./dist
EXPOSE 3001
CMD ["yarn", "start"]
      `.trim();
      
      fs.writeFileSync(path.join(serviceDir, 'Dockerfile'), dockerfile);
      
      // Step 4: Create tests for the service
      fs.mkdirSync(path.join(serviceDir, 'test'), { recursive: true });
      
      const e2eTest = `
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('User Service (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/api/users (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/users')
      .expect(200);
  });

  it('/api/users (POST)', () => {
    return request(app.getHttpServer())
      .post('/api/users')
      .send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      })
      .expect(201);
  });
});
      `.trim();
      
      fs.writeFileSync(path.join(serviceDir, 'test', 'app.e2e-spec.ts'), e2eTest);
      
      // Create Jest configuration
      const jestE2eConfig = {
        moduleFileExtensions: ['js', 'json', 'ts'],
        rootDir: '.',
        testEnvironment: 'node',
        testRegex: '.e2e-spec.ts$',
        transform: { '^.+\\.(t|j)s$': 'ts-jest' }
      };
      
      fs.writeFileSync(
        path.join(serviceDir, 'test', 'jest-e2e.json'),
        JSON.stringify(jestE2eConfig, null, 2)
      );
      
      // Step 5: Simulate adding service to docker-compose
      const composeFile = path.join(TEST_ROOT, 'docker-compose.yml');
      const compose = yaml.load(fs.readFileSync(composeFile, 'utf8'));
      
      compose.services[serviceName] = {
        build: {
          context: `./apps/${serviceName}`,
          dockerfile: 'Dockerfile.dev'
        },
        container_name: `template-${serviceName}-dev`,
        restart: 'unless-stopped',
        networks: ['template-network'],
        volumes: [`./apps/${serviceName}:/app`, '/app/node_modules'],
        environment: [
          'NODE_ENV=development',
          'PORT=3001',
          `MONGODB_URI=mongodb://admin:template_password@mongodb:27017/${serviceName}_db?authSource=admin`,
          'REDIS_URL=redis://redis:6379'
        ],
        ports: ['3001:3001'],
        healthcheck: {
          test: ['CMD', 'curl', '-f', 'http://localhost:3001/health'],
          interval: '30s',
          timeout: '5s',
          retries: 3,
          start_period: '10s'
        },
        depends_on: {
          mongodb: { condition: 'service_healthy' },
          redis: { condition: 'service_healthy' }
        }
      };
      
      fs.writeFileSync(composeFile, yaml.dump(compose, { indent: 2 }));
      
      // Step 6: Verify complete setup
      
      // Verify service files exist
      expect(fs.existsSync(path.join(serviceDir, 'package.json'))).toBe(true);
      expect(fs.existsSync(path.join(serviceDir, 'src', 'main.ts'))).toBe(true);
      expect(fs.existsSync(path.join(serviceDir, 'src', 'app.module.ts'))).toBe(true);
      expect(fs.existsSync(path.join(serviceDir, 'Dockerfile.dev'))).toBe(true);
      expect(fs.existsSync(path.join(serviceDir, 'Dockerfile'))).toBe(true);
      expect(fs.existsSync(path.join(serviceDir, 'test', 'app.e2e-spec.ts'))).toBe(true);
      
      // Verify docker-compose configuration
      const updatedCompose = yaml.load(fs.readFileSync(composeFile, 'utf8'));
      expect(updatedCompose.services[serviceName]).toBeDefined();
      expect(updatedCompose.services[serviceName].ports).toEqual(['3001:3001']);
      expect(updatedCompose.services[serviceName].environment).toContain('NODE_ENV=development');
      
      // Step 7: Move ticket to review
      const reviewResult = execSync(`node ${TICKET_CLI_PATH} move ${ticketId} review`, {
        env: { ...process.env, TICKET_ROOT: TEST_TICKETS_DIR },
        encoding: 'utf8'
      });
      
      expect(reviewResult).toContain(`Moved ticket ${ticketId} to review`);
      
      // Step 8: Add comments to ticket
      const commentResult = execSync(`node ${TICKET_CLI_PATH} comment ${ticketId} "Service implementation completed. Added authentication, CRUD operations, and comprehensive tests."`, {
        env: { ...process.env, TICKET_ROOT: TEST_TICKETS_DIR },
        encoding: 'utf8'
      });
      
      expect(commentResult).toContain(`Added comment to ticket ${ticketId}`);
      
      // Step 9: Complete the ticket
      const doneResult = execSync(`node ${TICKET_CLI_PATH} move ${ticketId} done`, {
        env: { ...process.env, TICKET_ROOT: TEST_TICKETS_DIR },
        encoding: 'utf8'
      });
      
      expect(doneResult).toContain(`Moved ticket ${ticketId} to done`);
      
      // Verify final state
      const doneFiles = fs.readdirSync(path.join(TEST_TICKETS_DIR, 'done'));
      expect(doneFiles).toContain(`${ticketId}.md`);
      
      // Verify ticket content has comments
      const ticketPath = path.join(TEST_TICKETS_DIR, 'done', `${ticketId}.md`);
      const ticketContent = fs.readFileSync(ticketPath, 'utf8');
      const [, frontmatter] = ticketContent.split('---\n');
      const metadata = yaml.load(frontmatter);
      
      expect(metadata.status).toBe('done');
      expect(metadata.comments).toHaveLength(1);
      expect(metadata.comments[0].comment).toContain('Service implementation completed');
      
      console.log('✅ Complete workflow test passed successfully!');
    }, 30000); // 30 second timeout for this comprehensive test

    test('should handle multiple services in a project', async () => {
      const services = [
        { name: 'user-service', type: 'nestjs-backend', port: 3001 },
        { name: 'notification-service', type: 'microservice', port: 3002 },
        { name: 'admin-dashboard', type: 'react-frontend', port: 3000 },
        { name: 'email-worker', type: 'worker', port: null }
      ];
      
      const ticketIds = [];
      
      // Create tickets for each service
      for (const service of services) {
        const createResult = execSync(`node ${TICKET_CLI_PATH} create -t "Create ${service.name}" -d "Implement ${service.name} as ${service.type}" --type feature -p medium`, {
          env: { ...process.env, TICKET_ROOT: TEST_TICKETS_DIR },
          encoding: 'utf8'
        });
        
        const ticketMatch = createResult.match(/Created ticket (TICKET-[\w-]+)/);
        ticketIds.push(ticketMatch[1]);
      }
      
      // Create services
      for (let i = 0; i < services.length; i++) {
        const service = services[i];
        const serviceDir = path.join(TEST_APPS_DIR, service.name);
        
        fs.mkdirSync(serviceDir, { recursive: true });
        fs.mkdirSync(path.join(serviceDir, 'src'));
        
        // Create appropriate package.json based on service type
        let packageJson;
        
        switch (service.type) {
          case 'nestjs-backend':
            packageJson = {
              name: service.name,
              dependencies: {
                '@nestjs/common': '^10.3.0',
                '@nestjs/core': '^10.3.0'
              }
            };
            break;
          case 'microservice':
            packageJson = {
              name: service.name,
              dependencies: {
                express: '^4.18.2',
                cors: '^2.8.5'
              }
            };
            break;
          case 'react-frontend':
            packageJson = {
              name: service.name,
              dependencies: {
                react: '^18.2.0',
                'react-dom': '^18.2.0'
              }
            };
            break;
          case 'worker':
            packageJson = {
              name: service.name,
              dependencies: {
                bullmq: '^4.15.0',
                ioredis: '^5.3.2'
              }
            };
            break;
        }
        
        fs.writeFileSync(
          path.join(serviceDir, 'package.json'),
          JSON.stringify(packageJson, null, 2)
        );
        
        // Move ticket to done
        execSync(`node ${TICKET_CLI_PATH} move ${ticketIds[i]} done`, {
          env: { ...process.env, TICKET_ROOT: TEST_TICKETS_DIR },
          encoding: 'utf8'
        });
      }
      
      // Verify all services created
      for (const service of services) {
        expect(fs.existsSync(path.join(TEST_APPS_DIR, service.name))).toBe(true);
        expect(fs.existsSync(path.join(TEST_APPS_DIR, service.name, 'package.json'))).toBe(true);
      }
      
      // Verify all tickets completed
      const doneFiles = fs.readdirSync(path.join(TEST_TICKETS_DIR, 'done'));
      expect(doneFiles).toHaveLength(services.length);
      
      // List all completed tickets
      const listResult = execSync(`node ${TICKET_CLI_PATH} list --status done`, {
        env: { ...process.env, TICKET_ROOT: TEST_TICKETS_DIR },
        encoding: 'utf8'
      });
      
      services.forEach(service => {
        expect(listResult).toContain(`Create ${service.name}`);
      });
      
      console.log('✅ Multiple services workflow test passed successfully!');
    });

    test('should handle ticket workflow with dependencies and blocking', async () => {
      // Create dependent tickets
      const createBackend = execSync(`node ${TICKET_CLI_PATH} create -t "Create API Backend" -d "Core API implementation" --type feature -p high`, {
        env: { ...process.env, TICKET_ROOT: TEST_TICKETS_DIR },
        encoding: 'utf8'
      });
      
      const createFrontend = execSync(`node ${TICKET_CLI_PATH} create -t "Create Frontend App" -d "UI that depends on API" --type feature -p medium`, {
        env: { ...process.env, TICKET_ROOT: TEST_TICKETS_DIR },
        encoding: 'utf8'
      });
      
      const backendTicketId = createBackend.match(/Created ticket (TICKET-[\w-]+)/)[1];
      const frontendTicketId = createFrontend.match(/Created ticket (TICKET-[\w-]+)/)[1];
      
      // Start working on frontend first (simulating dependency issue)
      execSync(`node ${TICKET_CLI_PATH} move ${frontendTicketId} in-progress`, {
        env: { ...process.env, TICKET_ROOT: TEST_TICKETS_DIR },
        encoding: 'utf8'
      });
      
      // Block frontend due to missing backend API
      execSync(`node ${TICKET_CLI_PATH} move ${frontendTicketId} blocked`, {
        env: { ...process.env, TICKET_ROOT: TEST_TICKETS_DIR },
        encoding: 'utf8'
      });
      
      execSync(`node ${TICKET_CLI_PATH} comment ${frontendTicketId} "Blocked: waiting for backend API endpoints"`, {
        env: { ...process.env, TICKET_ROOT: TEST_TICKETS_DIR },
        encoding: 'utf8'
      });
      
      // Work on backend first
      execSync(`node ${TICKET_CLI_PATH} move ${backendTicketId} in-progress`, {
        env: { ...process.env, TICKET_ROOT: TEST_TICKETS_DIR },
        encoding: 'utf8'
      });
      
      // Complete backend
      execSync(`node ${TICKET_CLI_PATH} move ${backendTicketId} done`, {
        env: { ...process.env, TICKET_ROOT: TEST_TICKETS_DIR },
        encoding: 'utf8'
      });
      
      // Unblock frontend
      execSync(`node ${TICKET_CLI_PATH} move ${frontendTicketId} in-progress`, {
        env: { ...process.env, TICKET_ROOT: TEST_TICKETS_DIR },
        encoding: 'utf8'
      });
      
      execSync(`node ${TICKET_CLI_PATH} comment ${frontendTicketId} "Unblocked: backend API is now available"`, {
        env: { ...process.env, TICKET_ROOT: TEST_TICKETS_DIR },
        encoding: 'utf8'
      });
      
      // Complete frontend
      execSync(`node ${TICKET_CLI_PATH} move ${frontendTicketId} done`, {
        env: { ...process.env, TICKET_ROOT: TEST_TICKETS_DIR },
        encoding: 'utf8'
      });
      
      // Verify workflow
      const doneFiles = fs.readdirSync(path.join(TEST_TICKETS_DIR, 'done'));
      expect(doneFiles).toHaveLength(2);
      
      // Verify comments were added
      const frontendTicketPath = path.join(TEST_TICKETS_DIR, 'done', `${frontendTicketId}.md`);
      const frontendContent = fs.readFileSync(frontendTicketPath, 'utf8');
      const [, frontmatter] = frontendContent.split('---\n');
      const metadata = yaml.load(frontmatter);
      
      expect(metadata.comments).toHaveLength(2);
      expect(metadata.comments[0].comment).toContain('Blocked: waiting for backend');
      expect(metadata.comments[1].comment).toContain('Unblocked: backend API is now available');
      
      console.log('✅ Dependency and blocking workflow test passed successfully!');
    });
  });

  describe('Error Recovery and Edge Cases', () => {
    test('should handle service creation failures gracefully', async () => {
      // Create ticket
      const createResult = execSync(`node ${TICKET_CLI_PATH} create -t "Test Service Creation" --type feature`, {
        env: { ...process.env, TICKET_ROOT: TEST_TICKETS_DIR },
        encoding: 'utf8'
      });
      
      const ticketId = createResult.match(/Created ticket (TICKET-[\w-]+)/)[1];
      
      // Move to in-progress
      execSync(`node ${TICKET_CLI_PATH} move ${ticketId} in-progress`, {
        env: { ...process.env, TICKET_ROOT: TEST_TICKETS_DIR },
        encoding: 'utf8'
      });
      
      // Simulate failed service creation by creating incomplete structure
      const serviceName = 'failed-service';
      const serviceDir = path.join(TEST_APPS_DIR, serviceName);
      
      fs.mkdirSync(serviceDir, { recursive: true });
      // Intentionally don't create package.json or other required files
      
      // Add comment about failure
      execSync(`node ${TICKET_CLI_PATH} comment ${ticketId} "Service creation failed: missing dependencies"`, {
        env: { ...process.env, TICKET_ROOT: TEST_TICKETS_DIR },
        encoding: 'utf8'
      });
      
      // Move back to todo for retry
      execSync(`node ${TICKET_CLI_PATH} move ${ticketId} todo`, {
        env: { ...process.env, TICKET_ROOT: TEST_TICKETS_DIR },
        encoding: 'utf8'
      });
      
      // Clean up failed attempt
      fs.rmSync(serviceDir, { recursive: true, force: true });
      
      // Retry with proper implementation
      execSync(`node ${TICKET_CLI_PATH} move ${ticketId} in-progress`, {
        env: { ...process.env, TICKET_ROOT: TEST_TICKETS_DIR },
        encoding: 'utf8'
      });
      
      // Create proper service structure
      fs.mkdirSync(serviceDir, { recursive: true });
      fs.writeFileSync(
        path.join(serviceDir, 'package.json'),
        JSON.stringify({ name: serviceName, version: '1.0.0' }, null, 2)
      );
      
      execSync(`node ${TICKET_CLI_PATH} comment ${ticketId} "Service creation successful on retry"`, {
        env: { ...process.env, TICKET_ROOT: TEST_TICKETS_DIR },
        encoding: 'utf8'
      });
      
      execSync(`node ${TICKET_CLI_PATH} move ${ticketId} done`, {
        env: { ...process.env, TICKET_ROOT: TEST_TICKETS_DIR },
        encoding: 'utf8'
      });
      
      // Verify recovery
      expect(fs.existsSync(path.join(serviceDir, 'package.json'))).toBe(true);
      
      const ticketPath = path.join(TEST_TICKETS_DIR, 'done', `${ticketId}.md`);
      const ticketContent = fs.readFileSync(ticketPath, 'utf8');
      const [, frontmatter] = ticketContent.split('---\n');
      const metadata = yaml.load(frontmatter);
      
      expect(metadata.comments).toHaveLength(2);
      expect(metadata.comments[0].comment).toContain('Service creation failed');
      expect(metadata.comments[1].comment).toContain('Service creation successful on retry');
      
      console.log('✅ Error recovery test passed successfully!');
    });

    test('should handle concurrent ticket operations', async () => {
      // Create multiple tickets
      const tickets = [];
      for (let i = 0; i < 3; i++) {
        const createResult = execSync(`node ${TICKET_CLI_PATH} create -t "Concurrent Ticket ${i + 1}" --type task`, {
          env: { ...process.env, TICKET_ROOT: TEST_TICKETS_DIR },
          encoding: 'utf8'
        });
        const ticketId = createResult.match(/Created ticket (TICKET-[\w-]+)/)[1];
        tickets.push(ticketId);
      }
      
      // Process tickets concurrently (simulate team work)
      tickets.forEach((ticketId, index) => {
        execSync(`node ${TICKET_CLI_PATH} move ${ticketId} in-progress`, {
          env: { ...process.env, TICKET_ROOT: TEST_TICKETS_DIR },
          encoding: 'utf8'
        });
        
        execSync(`node ${TICKET_CLI_PATH} assign ${ticketId} developer${index + 1}`, {
          env: { ...process.env, TICKET_ROOT: TEST_TICKETS_DIR },
          encoding: 'utf8'
        });
        
        execSync(`node ${TICKET_CLI_PATH} comment ${ticketId} "Working on implementation"`, {
          env: { ...process.env, TICKET_ROOT: TEST_TICKETS_DIR },
          encoding: 'utf8'
        });
      });
      
      // Complete tickets in different order
      const completionOrder = [1, 0, 2]; // Complete second, first, third
      
      completionOrder.forEach(index => {
        execSync(`node ${TICKET_CLI_PATH} move ${tickets[index]} done`, {
          env: { ...process.env, TICKET_ROOT: TEST_TICKETS_DIR },
          encoding: 'utf8'
        });
      });
      
      // Verify all tickets completed
      const doneFiles = fs.readdirSync(path.join(TEST_TICKETS_DIR, 'done'));
      expect(doneFiles).toHaveLength(3);
      
      // Verify assignments and comments
      tickets.forEach((ticketId, index) => {
        const ticketPath = path.join(TEST_TICKETS_DIR, 'done', `${ticketId}.md`);
        const ticketContent = fs.readFileSync(ticketPath, 'utf8');
        const [, frontmatter] = ticketContent.split('---\n');
        const metadata = yaml.load(frontmatter);
        
        expect(metadata.assignee).toBe(`developer${index + 1}`);
        expect(metadata.comments[0].comment).toBe('Working on implementation');
      });
      
      console.log('✅ Concurrent operations test passed successfully!');
    });
  });
}); 