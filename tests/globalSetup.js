const fs = require('fs');
const path = require('path');

module.exports = async () => {
  console.log('🚀 Setting up global test environment...');
  
  // Create test results directory
  const testResultsDir = path.join(__dirname, '../test-results');
  if (!fs.existsSync(testResultsDir)) {
    fs.mkdirSync(testResultsDir, { recursive: true });
  }
  
  // Create subdirectories for different test outputs
  const subDirs = ['coverage', 'html', 'screenshots', 'logs'];
  subDirs.forEach(dir => {
    const dirPath = path.join(testResultsDir, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });
  
  // Set up environment variables for testing
  process.env.NODE_ENV = 'test';
  process.env.TEST_MODE = 'true';
  
  // Ensure required dependencies for scripts
  const scriptsDir = path.join(__dirname, '../scripts');
  const requiredFiles = [
    'ticket-cli.js',
    'add-to-docker-compose.js'
  ];
  
  requiredFiles.forEach(file => {
    const filePath = path.join(scriptsDir, file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Required script file not found: ${filePath}`);
    }
  });
  
  // Create test data directory
  const testDataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(testDataDir)) {
    fs.mkdirSync(testDataDir, { recursive: true });
  }
  
  // Create sample test data files
  const sampleTicket = {
    id: 'TICKET-sample-0001',
    title: 'Sample Test Ticket',
    status: 'backlog',
    priority: 'medium',
    type: 'feature',
    assignee: null,
    reporter: 'test-user',
    labels: ['testing'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    comments: []
  };
  
  fs.writeFileSync(
    path.join(testDataDir, 'sample-ticket.json'),
    JSON.stringify(sampleTicket, null, 2)
  );
  
  // Create sample package.json templates
  const samplePackageJsons = {
    'nestjs-backend': {
      name: 'test-backend',
      version: '0.0.1',
      scripts: {
        build: 'nest build',
        start: 'nest start',
        'start:dev': 'nest start --watch'
      },
      dependencies: {
        '@nestjs/common': '^10.3.0',
        '@nestjs/core': '^10.3.0'
      }
    },
    'react-frontend': {
      name: 'test-frontend',
      version: '0.0.0',
      type: 'module',
      scripts: {
        dev: 'vite',
        build: 'tsc && vite build'
      },
      dependencies: {
        react: '^18.2.0',
        'react-dom': '^18.2.0'
      }
    },
    microservice: {
      name: 'test-microservice',
      version: '1.0.0',
      scripts: {
        start: 'node dist/index.js',
        'start:dev': 'ts-node-dev src/index.ts'
      },
      dependencies: {
        express: '^4.18.2'
      }
    },
    worker: {
      name: 'test-worker',
      version: '1.0.0',
      scripts: {
        start: 'node dist/index.js'
      },
      dependencies: {
        bullmq: '^4.15.0'
      }
    }
  };
  
  Object.keys(samplePackageJsons).forEach(type => {
    fs.writeFileSync(
      path.join(testDataDir, `package-${type}.json`),
      JSON.stringify(samplePackageJsons[type], null, 2)
    );
  });
  
  console.log('✅ Global test environment setup complete');
}; 