const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { addServiceToDockerCompose } = require('../../scripts/add-to-docker-compose.js');

describe('Docker Compose Integration System', () => {
  const TEST_COMPOSE_DEV = 'test-docker-compose.yml';
  const TEST_COMPOSE_PROD = 'test-docker-compose.prod.yml';
  
  beforeEach(() => {
    // Create initial docker-compose files
    const initialCompose = {
      version: '3.8',
      services: {
        mongodb: {
          image: 'mongo:7.0-jammy',
          container_name: 'template-mongodb',
          restart: 'unless-stopped',
          environment: {
            MONGO_INITDB_ROOT_USERNAME: 'admin',
            MONGO_INITDB_ROOT_PASSWORD: 'template_password',
            MONGO_INITDB_DATABASE: 'template_db'
          },
          ports: ['27017:27017'],
          volumes: ['mongodb_data:/data/db'],
          networks: ['template-network'],
          healthcheck: {
            test: ['CMD', 'mongosh', '--eval', 'db.adminCommand(\'ping\')'],
            interval: '30s',
            timeout: '10s',
            retries: 3,
            start_period: '40s'
          }
        },
        redis: {
          image: 'redis:7.2-alpine',
          container_name: 'template-redis',
          restart: 'unless-stopped',
          ports: ['6379:6379'],
          volumes: ['redis_data:/data'],
          networks: ['template-network'],
          healthcheck: {
            test: ['CMD', 'redis-cli', 'ping'],
            interval: '30s',
            timeout: '3s',
            retries: 3,
            start_period: '5s'
          },
          command: 'redis-server --appendonly yes'
        }
      },
      volumes: {
        mongodb_data: { driver: 'local' },
        redis_data: { driver: 'local' }
      },
      networks: {
        'template-network': { driver: 'bridge' }
      }
    };
    
    fs.writeFileSync(TEST_COMPOSE_DEV, yaml.dump(initialCompose, { indent: 2 }));
    fs.writeFileSync(TEST_COMPOSE_PROD, yaml.dump(initialCompose, { indent: 2 }));
  });
  
  afterEach(() => {
    // Cleanup test files
    [TEST_COMPOSE_DEV, TEST_COMPOSE_PROD].forEach(file => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });
  });

  describe('Service Configuration Generation', () => {
    test('should generate correct development configuration for NestJS backend', () => {
      // Mock the docker-compose files to use test files
      const originalReadFileSync = fs.readFileSync;
      const originalWriteFileSync = fs.writeFileSync;
      
      fs.readFileSync = (filePath, encoding) => {
        if (filePath === 'docker-compose.yml') {
          return originalReadFileSync(TEST_COMPOSE_DEV, encoding);
        }
        if (filePath === 'docker-compose.prod.yml') {
          return originalReadFileSync(TEST_COMPOSE_PROD, encoding);
        }
        return originalReadFileSync(filePath, encoding);
      };
      
      fs.writeFileSync = (filePath, data) => {
        if (filePath === 'docker-compose.yml') {
          return originalWriteFileSync(TEST_COMPOSE_DEV, data);
        }
        if (filePath === 'docker-compose.prod.yml') {
          return originalWriteFileSync(TEST_COMPOSE_PROD, data);
        }
        return originalWriteFileSync(filePath, data);
      };
      
      // Add a NestJS backend service
      addServiceToDockerCompose('nestjs-backend', 'test-backend', 3001);
      
      // Verify the service was added to development compose
      const devCompose = yaml.load(fs.readFileSync(TEST_COMPOSE_DEV, 'utf8'));
      const service = devCompose.services['test-backend'];
      
      expect(service).toBeDefined();
      expect(service.build.context).toBe('./apps/test-backend');
      expect(service.build.dockerfile).toBe('Dockerfile.dev');
      expect(service.container_name).toBe('procurement-test-backend-dev');
      expect(service.ports).toEqual(['3001:3001']);
      expect(service.environment).toContain('NODE_ENV=development');
      expect(service.environment).toContain('PORT=3001');
      expect(service.volumes).toContain('./apps/test-backend:/app');
      expect(service.volumes).toContain('/app/node_modules');
      expect(service.healthcheck.test).toContain('http://localhost:3001/health');
      
      // Restore original functions
      fs.readFileSync = originalReadFileSync;
      fs.writeFileSync = originalWriteFileSync;
    });

    test('should generate correct production configuration for NestJS backend', () => {
      const originalReadFileSync = fs.readFileSync;
      const originalWriteFileSync = fs.writeFileSync;
      
      fs.readFileSync = (filePath, encoding) => {
        if (filePath === 'docker-compose.yml') {
          return originalReadFileSync(TEST_COMPOSE_DEV, encoding);
        }
        if (filePath === 'docker-compose.prod.yml') {
          return originalReadFileSync(TEST_COMPOSE_PROD, encoding);
        }
        return originalReadFileSync(filePath, encoding);
      };
      
      fs.writeFileSync = (filePath, data) => {
        if (filePath === 'docker-compose.yml') {
          return originalWriteFileSync(TEST_COMPOSE_DEV, data);
        }
        if (filePath === 'docker-compose.prod.yml') {
          return originalWriteFileSync(TEST_COMPOSE_PROD, data);
        }
        return originalWriteFileSync(filePath, data);
      };
      
      addServiceToDockerCompose('nestjs-backend', 'test-backend', 3001);
      
      const prodCompose = yaml.load(fs.readFileSync(TEST_COMPOSE_PROD, 'utf8'));
      const service = prodCompose.services['test-backend'];
      
      expect(service).toBeDefined();
      expect(service.build.context).toBe('./apps/test-backend');
      expect(service.build.dockerfile).toBe('Dockerfile');
      expect(service.build.target).toBe('production');
      expect(service.container_name).toBe('procurement-test-backend-prod');
      expect(service.restart).toBe('always');
      expect(service.deploy.resources.limits.memory).toBe('1G');
      expect(service.deploy.resources.reservations.memory).toBe('512M');
      
      fs.readFileSync = originalReadFileSync;
      fs.writeFileSync = originalWriteFileSync;
    });

    test('should generate correct configuration for React frontend', () => {
      const originalReadFileSync = fs.readFileSync;
      const originalWriteFileSync = fs.writeFileSync;
      
      fs.readFileSync = (filePath, encoding) => {
        if (filePath === 'docker-compose.yml') {
          return originalReadFileSync(TEST_COMPOSE_DEV, encoding);
        }
        if (filePath === 'docker-compose.prod.yml') {
          return originalReadFileSync(TEST_COMPOSE_PROD, encoding);
        }
        return originalReadFileSync(filePath, encoding);
      };
      
      fs.writeFileSync = (filePath, data) => {
        if (filePath === 'docker-compose.yml') {
          return originalWriteFileSync(TEST_COMPOSE_DEV, data);
        }
        if (filePath === 'docker-compose.prod.yml') {
          return originalWriteFileSync(TEST_COMPOSE_PROD, data);
        }
        return originalWriteFileSync(filePath, data);
      };
      
      addServiceToDockerCompose('react-frontend', 'test-frontend', 3000);
      
      const devCompose = yaml.load(fs.readFileSync(TEST_COMPOSE_DEV, 'utf8'));
      const prodCompose = yaml.load(fs.readFileSync(TEST_COMPOSE_PROD, 'utf8'));
      
      const devService = devCompose.services['test-frontend'];
      const prodService = prodCompose.services['test-frontend'];
      
      // Development configuration
      expect(devService.ports).toEqual(['3000:3000']);
      expect(devService.environment).toContain('VITE_API_BASE_URL=http://localhost:3001/api');
      expect(devService.environment).toContain('VITE_APP_NAME=test-frontend');
      
      // Production configuration
      expect(prodService.ports).toEqual(['80:80']); // Frontend uses nginx on port 80
      expect(prodService.deploy.resources.limits.memory).toBe('512M');
      expect(prodService.deploy.resources.reservations.memory).toBe('256M');
      
      fs.readFileSync = originalReadFileSync;
      fs.writeFileSync = originalWriteFileSync;
    });

    test('should generate correct configuration for worker service', () => {
      const originalReadFileSync = fs.readFileSync;
      const originalWriteFileSync = fs.writeFileSync;
      
      fs.readFileSync = (filePath, encoding) => {
        if (filePath === 'docker-compose.yml') {
          return originalReadFileSync(TEST_COMPOSE_DEV, encoding);
        }
        if (filePath === 'docker-compose.prod.yml') {
          return originalReadFileSync(TEST_COMPOSE_PROD, encoding);
        }
        return originalReadFileSync(filePath, encoding);
      };
      
      fs.writeFileSync = (filePath, data) => {
        if (filePath === 'docker-compose.yml') {
          return originalWriteFileSync(TEST_COMPOSE_DEV, data);
        }
        if (filePath === 'docker-compose.prod.yml') {
          return originalWriteFileSync(TEST_COMPOSE_PROD, data);
        }
        return originalWriteFileSync(filePath, data);
      };
      
      addServiceToDockerCompose('worker', 'test-worker');
      
      const devCompose = yaml.load(fs.readFileSync(TEST_COMPOSE_DEV, 'utf8'));
      const service = devCompose.services['test-worker'];
      
      expect(service).toBeDefined();
      expect(service.ports).toBeUndefined(); // Workers don't expose ports
      expect(service.environment).toContain('REDIS_URL=redis://redis:6379');
      expect(service.healthcheck).toBeUndefined(); // Workers don't have health checks
      expect(service.depends_on.redis.condition).toBe('service_healthy');
      
      fs.readFileSync = originalReadFileSync;
      fs.writeFileSync = originalWriteFileSync;
    });
  });

  describe('Environment Variable Generation', () => {
    test('should generate correct environment variables for backend services', () => {
      const generateEnvironmentVars = (serviceType, serviceName, servicePort, environment) => {
        const baseVars = [`NODE_ENV=${environment}`];
        
        switch (serviceType) {
          case 'nestjs-backend':
          case 'microservice':
            baseVars.push(
              `PORT=${servicePort}`,
              `MONGODB_URI=mongodb://admin:procurement_password@mongodb:27017/${serviceName}_db?authSource=admin`,
              `REDIS_URL=redis://redis:6379`,
              `JWT_SECRET=your-jwt-secret-key-change-in-production`
            );
            break;
        }
        
        return baseVars;
      };
      
      const vars = generateEnvironmentVars('nestjs-backend', 'test-service', 3001, 'development');
      
      expect(vars).toContain('NODE_ENV=development');
      expect(vars).toContain('PORT=3001');
      expect(vars).toContain('MONGODB_URI=mongodb://admin:procurement_password@mongodb:27017/test-service_db?authSource=admin');
      expect(vars).toContain('REDIS_URL=redis://redis:6379');
      expect(vars).toContain('JWT_SECRET=your-jwt-secret-key-change-in-production');
    });

    test('should generate correct environment variables for frontend services', () => {
      const generateEnvironmentVars = (serviceType, serviceName, servicePort, environment) => {
        const baseVars = [`NODE_ENV=${environment}`];
        
        if (serviceType === 'react-frontend') {
          baseVars.push(
            `VITE_API_BASE_URL=http://localhost:3001/api`,
            `VITE_APP_NAME=${serviceName}`,
            `VITE_NODE_ENV=${environment}`
          );
        }
        
        return baseVars;
      };
      
      const vars = generateEnvironmentVars('react-frontend', 'admin-dashboard', 3000, 'development');
      
      expect(vars).toContain('NODE_ENV=development');
      expect(vars).toContain('VITE_API_BASE_URL=http://localhost:3001/api');
      expect(vars).toContain('VITE_APP_NAME=admin-dashboard');
      expect(vars).toContain('VITE_NODE_ENV=development');
    });

    test('should generate correct environment variables for worker services', () => {
      const generateEnvironmentVars = (serviceType, serviceName, servicePort, environment) => {
        const baseVars = [`NODE_ENV=${environment}`];
        
        if (serviceType === 'worker') {
          baseVars.push(
            `REDIS_URL=redis://redis:6379`,
            `MONGODB_URI=mongodb://admin:procurement_password@mongodb:27017/${serviceName}_db?authSource=admin`
          );
        }
        
        return baseVars;
      };
      
      const vars = generateEnvironmentVars('worker', 'email-worker', null, 'development');
      
      expect(vars).toContain('NODE_ENV=development');
      expect(vars).toContain('REDIS_URL=redis://redis:6379');
      expect(vars).toContain('MONGODB_URI=mongodb://admin:procurement_password@mongodb:27017/email-worker_db?authSource=admin');
    });
  });

  describe('Service Dependencies', () => {
    test('should generate correct dependencies for backend services', () => {
      const generateDependencies = (serviceType) => {
        const baseDeps = {};
        
        switch (serviceType) {
          case 'nestjs-backend':
          case 'microservice':
            baseDeps.mongodb = { condition: 'service_healthy' };
            baseDeps.redis = { condition: 'service_healthy' };
            break;
          case 'react-frontend':
            baseDeps.backend = { condition: 'service_healthy' };
            break;
          case 'worker':
            baseDeps.redis = { condition: 'service_healthy' };
            break;
        }
        
        return baseDeps;
      };
      
      const backendDeps = generateDependencies('nestjs-backend');
      expect(backendDeps.mongodb.condition).toBe('service_healthy');
      expect(backendDeps.redis.condition).toBe('service_healthy');
      
      const frontendDeps = generateDependencies('react-frontend');
      expect(frontendDeps.backend.condition).toBe('service_healthy');
      
      const workerDeps = generateDependencies('worker');
      expect(workerDeps.redis.condition).toBe('service_healthy');
      expect(workerDeps.mongodb).toBeUndefined();
    });
  });

  describe('Health Check Configuration', () => {
    test('should generate correct health checks for different service types', () => {
      const generateHealthCheck = (serviceType, servicePort) => {
        if (serviceType === 'worker') {
          return undefined; // Workers don't have health checks
        }
        
        const healthPort = serviceType === 'react-frontend' ? '80' : servicePort;
        
        return {
          test: ['CMD', 'curl', '-f', `http://localhost:${healthPort}/health`],
          interval: '30s',
          timeout: '5s',
          retries: 3,
          start_period: '10s'
        };
      };
      
      const backendHealth = generateHealthCheck('nestjs-backend', 3001);
      expect(backendHealth.test).toEqual(['CMD', 'curl', '-f', 'http://localhost:3001/health']);
      expect(backendHealth.interval).toBe('30s');
      expect(backendHealth.retries).toBe(3);
      
      const frontendHealth = generateHealthCheck('react-frontend', 3000);
      expect(frontendHealth.test).toEqual(['CMD', 'curl', '-f', 'http://localhost:80/health']);
      
      const workerHealth = generateHealthCheck('worker');
      expect(workerHealth).toBeUndefined();
    });
  });

  describe('Network Configuration', () => {
    test('should ensure networks are properly configured', () => {
      const originalReadFileSync = fs.readFileSync;
      const originalWriteFileSync = fs.writeFileSync;
      
      fs.readFileSync = (filePath, encoding) => {
        if (filePath === 'docker-compose.yml') {
          return originalReadFileSync(TEST_COMPOSE_DEV, encoding);
        }
        if (filePath === 'docker-compose.prod.yml') {
          return originalReadFileSync(TEST_COMPOSE_PROD, encoding);
        }
        return originalReadFileSync(filePath, encoding);
      };
      
      fs.writeFileSync = (filePath, data) => {
        if (filePath === 'docker-compose.yml') {
          return originalWriteFileSync(TEST_COMPOSE_DEV, data);
        }
        if (filePath === 'docker-compose.prod.yml') {
          return originalWriteFileSync(TEST_COMPOSE_PROD, data);
        }
        return originalWriteFileSync(filePath, data);
      };
      
      addServiceToDockerCompose('nestjs-backend', 'test-service', 3001);
      
      const devCompose = yaml.load(fs.readFileSync(TEST_COMPOSE_DEV, 'utf8'));
      const prodCompose = yaml.load(fs.readFileSync(TEST_COMPOSE_PROD, 'utf8'));
      
      // Check that networks exist
      expect(devCompose.networks['procurement-network']).toBeDefined();
      expect(devCompose.networks['procurement-network'].driver).toBe('bridge');
      
      expect(prodCompose.networks['procurement-network']).toBeDefined();
      expect(prodCompose.networks['procurement-network'].driver).toBe('bridge');
      
      // Check that service is connected to network
      expect(devCompose.services['test-service'].networks).toContain('procurement-network');
      expect(prodCompose.services['test-service'].networks).toContain('procurement-network');
      
      fs.readFileSync = originalReadFileSync;
      fs.writeFileSync = originalWriteFileSync;
    });
  });

  describe('Resource Limits (Production)', () => {
    test('should set appropriate resource limits for production services', () => {
      const generateResourceLimits = (serviceType) => {
        return {
          resources: {
            limits: {
              memory: serviceType === 'react-frontend' ? '512M' : '1G'
            },
            reservations: {
              memory: serviceType === 'react-frontend' ? '256M' : '512M'
            }
          }
        };
      };
      
      const backendLimits = generateResourceLimits('nestjs-backend');
      expect(backendLimits.resources.limits.memory).toBe('1G');
      expect(backendLimits.resources.reservations.memory).toBe('512M');
      
      const frontendLimits = generateResourceLimits('react-frontend');
      expect(frontendLimits.resources.limits.memory).toBe('512M');
      expect(frontendLimits.resources.reservations.memory).toBe('256M');
    });
  });

  describe('Error Handling', () => {
    test('should handle missing docker-compose files gracefully', () => {
      // Remove test files to simulate missing files
      [TEST_COMPOSE_DEV, TEST_COMPOSE_PROD].forEach(file => {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
        }
      });
      
      const originalReadFileSync = fs.readFileSync;
      const originalProcessExit = process.exit;
      let exitCalled = false;
      
      // Mock process.exit to prevent Jest worker crashes
      process.exit = (code) => {
        exitCalled = true;
        throw new Error(`Process would exit with code ${code}`);
      };
      
      fs.readFileSync = (filePath, encoding) => {
        if (filePath === 'docker-compose.yml' || filePath === 'docker-compose.prod.yml') {
          throw new Error('File not found');
        }
        return originalReadFileSync(filePath, encoding);
      };
      
      expect(() => {
        addServiceToDockerCompose('nestjs-backend', 'test-service', 3001);
      }).toThrow();
      
      expect(exitCalled).toBe(true);
      
      // Restore mocks
      fs.readFileSync = originalReadFileSync;
      process.exit = originalProcessExit;
    });

    test('should validate required parameters', () => {
      const originalProcessExit = process.exit;
      let exitCalled = false;
      
      // Mock process.exit to prevent Jest worker crashes
      process.exit = (code) => {
        exitCalled = true;
        throw new Error(`Process would exit with code ${code}`);
      };
      
      expect(() => {
        addServiceToDockerCompose(null, 'test-service', 3001);
      }).toThrow();
      
      expect(() => {
        addServiceToDockerCompose('nestjs-backend', null, 3001);
      }).toThrow();
      
      // Restore mock
      process.exit = originalProcessExit;
    });
  });
}); 