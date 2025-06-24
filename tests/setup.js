const fs = require('fs');
const path = require('path');

// Global test configuration
global.TEST_TIMEOUT = 30000;
global.TEST_ROOT = path.join(__dirname, '../test-results');

// Ensure test results directory exists
if (!fs.existsSync(global.TEST_ROOT)) {
  fs.mkdirSync(global.TEST_ROOT, { recursive: true });
}

// Global test utilities
global.testUtils = {
  // Clean up test directories
  cleanupTestDirectories: (directories) => {
    directories.forEach(dir => {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    });
  },
  
  // Create test directory structure
  createTestStructure: (basePath, structure) => {
    fs.mkdirSync(basePath, { recursive: true });
    
    if (Array.isArray(structure)) {
      structure.forEach(dir => {
        fs.mkdirSync(path.join(basePath, dir), { recursive: true });
      });
    } else if (typeof structure === 'object') {
      Object.keys(structure).forEach(key => {
        const fullPath = path.join(basePath, key);
        if (typeof structure[key] === 'string') {
          // It's a file
          fs.writeFileSync(fullPath, structure[key]);
        } else {
          // It's a directory
          fs.mkdirSync(fullPath, { recursive: true });
          if (structure[key]) {
            global.testUtils.createTestStructure(fullPath, structure[key]);
          }
        }
      });
    }
  },
  
  // Wait for condition
  waitFor: async (condition, timeout = 5000, interval = 100) => {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      if (await condition()) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    throw new Error(`Condition not met within ${timeout}ms`);
  },
  
  // Mock file system operations
  mockFs: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
    exists: jest.fn(),
    mkdir: jest.fn(),
    rmdir: jest.fn()
  }
};

// Console override for testing
let originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn
};

global.mockConsole = () => {
  const logs = {
    log: [],
    error: [],
    warn: []
  };
  
  console.log = (...args) => logs.log.push(args.join(' '));
  console.error = (...args) => logs.error.push(args.join(' '));
  console.warn = (...args) => logs.warn.push(args.join(' '));
  
  return logs;
};

global.restoreConsole = () => {
  console.log = originalConsole.log;
  console.error = originalConsole.error;
  console.warn = originalConsole.warn;
};

// Custom matchers
expect.extend({
  toBeValidTicketId(received) {
    const pass = /^TICKET-[\w-]+$/.test(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid ticket ID`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid ticket ID (format: TICKET-xxx-xxx)`,
        pass: false,
      };
    }
  },
  
  toHaveValidPackageJson(received) {
    try {
      const packagePath = path.join(received, 'package.json');
      if (!fs.existsSync(packagePath)) {
        return {
          message: () => `expected ${received} to have a package.json file`,
          pass: false,
        };
      }
      
      const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      const hasName = packageContent.name;
      const hasVersion = packageContent.version;
      
      if (hasName && hasVersion) {
        return {
          message: () => `expected ${received} not to have a valid package.json`,
          pass: true,
        };
      } else {
        return {
          message: () => `expected ${received} to have a valid package.json with name and version`,
          pass: false,
        };
      }
    } catch (error) {
      return {
        message: () => `expected ${received} to have a valid package.json, but got error: ${error.message}`,
        pass: false,
      };
    }
  },
  
  toHaveDockerfile(received) {
    const dockerfileDev = path.join(received, 'Dockerfile.dev');
    const dockerfile = path.join(received, 'Dockerfile');
    
    const hasDockerfileDev = fs.existsSync(dockerfileDev);
    const hasDockerfile = fs.existsSync(dockerfile);
    
    if (hasDockerfileDev && hasDockerfile) {
      return {
        message: () => `expected ${received} not to have Dockerfiles`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to have both Dockerfile.dev and Dockerfile`,
        pass: false,
      };
    }
  }
});

// Global error handler for tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Test environment validation
beforeAll(() => {
  // Ensure required dependencies are available
  const requiredPackages = ['js-yaml', 'commander', 'uuid'];
  
  requiredPackages.forEach(pkg => {
    try {
      require(pkg);
    } catch (error) {
      throw new Error(`Required test dependency '${pkg}' is not available. Please run 'yarn install' first.`);
    }
  });
  
  console.log('🧪 Test environment initialized successfully');
});

// Global cleanup
afterAll(() => {
  global.restoreConsole();
  console.log('🧹 Test environment cleaned up');
}); 