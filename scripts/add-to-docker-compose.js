#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  purple: '\x1b[35m',
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function addServiceToDockerCompose(serviceType, serviceName, servicePort) {
  // Validate required parameters
  if (!serviceType) {
    log('red', 'Error: serviceType is required');
    process.exit(1);
  }
  
  if (!serviceName) {
    log('red', 'Error: serviceName is required');
    process.exit(1);
  }

  const devComposeFile = 'docker-compose.yml';
  const prodComposeFile = 'docker-compose.prod.yml';

  // Read existing docker-compose files
  let devCompose, prodCompose;

  try {
    devCompose = yaml.load(fs.readFileSync(devComposeFile, 'utf8'));
    prodCompose = yaml.load(fs.readFileSync(prodComposeFile, 'utf8'));
  } catch (error) {
    log('red', `Error reading docker-compose files: ${error.message}`);
    process.exit(1);
  }

  // Generate service configuration based on type
  const devServiceConfig = generateDevServiceConfig(serviceType, serviceName, servicePort);
  const prodServiceConfig = generateProdServiceConfig(serviceType, serviceName, servicePort);

  // Add service to development compose
  devCompose.services[serviceName] = devServiceConfig;

  // Add service to production compose
  prodCompose.services[serviceName] = prodServiceConfig;

  // Update networks if needed
  if (!devCompose.networks) {
    devCompose.networks = {};
  }
  if (!devCompose.networks['procurement-network']) {
    devCompose.networks['procurement-network'] = { driver: 'bridge' };
  }

  if (!prodCompose.networks) {
    prodCompose.networks = {};
  }
  if (!prodCompose.networks['procurement-network']) {
    prodCompose.networks['procurement-network'] = {
      driver: 'bridge',
      ipam: {
        config: [{ subnet: '172.20.0.0/16' }]
      }
    };
  }

  // Write updated files
  try {
    fs.writeFileSync(devComposeFile, yaml.dump(devCompose, { indent: 2, lineWidth: 120 }));
    fs.writeFileSync(prodComposeFile, yaml.dump(prodCompose, { indent: 2, lineWidth: 120 }));
    
    log('green', `✅ Added ${serviceName} to docker-compose files`);
  } catch (error) {
    log('red', `Error writing docker-compose files: ${error.message}`);
    process.exit(1);
  }
}

function generateDevServiceConfig(serviceType, serviceName, servicePort) {
  const baseConfig = {
    build: {
      context: `./apps/${serviceName}`,
      dockerfile: 'Dockerfile.dev'
    },
    container_name: `procurement-${serviceName}-dev`,
    restart: 'unless-stopped',
    networks: ['procurement-network'],
    volumes: [
      `./apps/${serviceName}:/app`,
      '/app/node_modules'
    ]
  };

  // Add environment variables based on service type
  baseConfig.environment = generateEnvironmentVars(serviceType, serviceName, servicePort, 'development');

  // Add ports for services that need them
  if (servicePort && serviceType !== 'worker') {
    baseConfig.ports = [`${servicePort}:${servicePort}`];
  }

  // Add health checks
  if (serviceType !== 'worker') {
    baseConfig.healthcheck = {
      test: [`CMD`, `curl`, `-f`, `http://localhost:${servicePort}/health`],
      interval: '30s',
      timeout: '5s',
      retries: 3,
      start_period: '10s'
    };
  }

  // Add dependencies
  baseConfig.depends_on = generateDependencies(serviceType);

  return baseConfig;
}

function generateProdServiceConfig(serviceType, serviceName, servicePort) {
  const baseConfig = {
    build: {
      context: `./apps/${serviceName}`,
      dockerfile: 'Dockerfile',
      target: 'production'
    },
    container_name: `procurement-${serviceName}-prod`,
    restart: 'always',
    networks: ['procurement-network'],
  };

  // Add environment variables
  baseConfig.environment = generateEnvironmentVars(serviceType, serviceName, servicePort, 'production');

  // Add ports for services that need them
  if (servicePort && serviceType !== 'worker') {
    if (serviceType === 'react-frontend') {
      baseConfig.ports = ['80:80']; // Frontend services use nginx on port 80
    } else {
      baseConfig.ports = [`${servicePort}:${servicePort}`];
    }
  }

  // Add health checks
  if (serviceType !== 'worker') {
    const healthPort = serviceType === 'react-frontend' ? '80' : servicePort;
    baseConfig.healthcheck = {
      test: [`CMD`, `curl`, `-f`, `http://localhost:${healthPort}/health`],
      interval: '30s',
      timeout: '5s',
      retries: 5,
      start_period: '30s'
    };
  }

  // Add dependencies
  baseConfig.depends_on = generateDependencies(serviceType);

  // Add resource limits for production
  baseConfig.deploy = {
    resources: {
      limits: {
        memory: serviceType === 'react-frontend' ? '512M' : '1G'
      },
      reservations: {
        memory: serviceType === 'react-frontend' ? '256M' : '512M'
      }
    }
  };

  return baseConfig;
}

function generateEnvironmentVars(serviceType, serviceName, servicePort, environment) {
  const baseVars = [
    `NODE_ENV=${environment}`,
  ];

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
    
    case 'react-frontend':
      baseVars.push(
        `VITE_API_BASE_URL=http://localhost:3001/api`,
        `VITE_APP_NAME=${serviceName}`,
        `VITE_NODE_ENV=${environment}`
      );
      break;
    
    case 'worker':
      baseVars.push(
        `REDIS_URL=redis://redis:6379`,
        `MONGODB_URI=mongodb://admin:procurement_password@mongodb:27017/${serviceName}_db?authSource=admin`
      );
      break;
  }

  return baseVars;
}

function generateDependencies(serviceType) {
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
}

// Main execution
if (require.main === module) {
  const [,, serviceType, serviceName, servicePort] = process.argv;

  if (!serviceType || !serviceName) {
    log('red', 'Usage: node add-to-docker-compose.js <serviceType> <serviceName> [servicePort]');
    process.exit(1);
  }

  log('blue', `Adding ${serviceName} (${serviceType}) to Docker Compose files...`);
  addServiceToDockerCompose(serviceType, serviceName, servicePort);
}

module.exports = { addServiceToDockerCompose }; 