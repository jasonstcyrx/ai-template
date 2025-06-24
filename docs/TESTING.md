# 🧪 Comprehensive Testing Framework

This template includes a robust testing framework with **42 automated tests** covering unit, integration, and end-to-end scenarios. This guide explains the testing strategy, available tools, and how to maintain and extend the test suite.

## 📊 Testing Overview

### Test Suite Composition

Our testing strategy follows the **Testing Pyramid** principle:

```
        /\
       /  \
      / E2E \ ← 10% (4 tests)
     /______\
    /        \
   /Integration\ ← 20% (8 tests)
  /____________\
 /              \
/     Unit       \ ← 70% (30 tests)
/________________\
```

- **30 Unit Tests** (70%) - Fast, isolated component testing
- **8 Integration Tests** (20%) - Service interaction validation  
- **4 End-to-End Tests** (10%) - Complete workflow testing

### Testing Principles

1. **Test-Driven Development (TDD)** - Write tests before implementation
2. **Comprehensive Coverage** - Minimum 70% code coverage requirement
3. **Fast Feedback** - Unit tests complete in under 5 seconds
4. **Reliable Automation** - All tests run in CI/CD pipeline
5. **Maintainable Tests** - Clear, readable, and well-documented

## 🏗️ Test Architecture

### Test Organization

```
tests/
├── unit/                        # Unit tests (70%)
│   ├── ticket-cli.test.js      # Ticket management tests
│   ├── service-init.test.js    # Service generation tests
│   └── docker-compose.test.js  # Docker configuration tests
├── integration/                 # Integration tests (20%)
│   ├── api-endpoints.test.js   # API integration tests
│   ├── database.test.js        # Database operation tests
│   └── service-communication.test.js
├── e2e/                        # End-to-end tests (10%)
│   ├── workflow.test.js        # Complete user workflows
│   └── deployment.test.js      # Deployment scenarios
├── setup.js                   # Global test configuration
├── globalSetup.js             # Environment setup
├── globalTeardown.js          # Environment cleanup
├── testResultsProcessor.js    # Custom reporting
└── jest.config.js             # Jest configuration
```

### Test Configuration

**Jest Configuration** (`tests/jest.config.js`):
```javascript
module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Test patterns
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/tests/**/*.spec.js'
  ],
  
  // Coverage requirements
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  globalSetup: '<rootDir>/tests/globalSetup.js',
  globalTeardown: '<rootDir>/tests/globalTeardown.js',
  
  // Custom matchers
  testResultsProcessor: '<rootDir>/tests/testResultsProcessor.js',
  
  // Coverage reporting
  collectCoverageFrom: [
    'scripts/**/*.js',
    '!scripts/templates/**',
    '!**/node_modules/**'
  ]
};
```

## 🔬 Unit Tests (30 Tests)

Unit tests focus on testing individual components in isolation.

### Ticket CLI Tests (15 tests)

**File**: `tests/unit/ticket-cli.test.js`

```javascript
describe('Ticket CLI System', () => {
  describe('Ticket Creation', () => {
    test('should create ticket with valid parameters', () => {
      // Test ticket creation with proper validation
    });
    
    test('should reject invalid priority', () => {
      // Test validation of priority values
    });
    
    test('should reject invalid type', () => {
      // Test validation of ticket types
    });
    
    test('should handle labels correctly', () => {
      // Test label parsing and storage
    });
  });
  
  describe('Ticket Movement', () => {
    test('should move ticket between valid states', () => {
      // Test state transitions
    });
    
    test('should reject invalid state transitions', () => {
      // Test workflow validation
    });
    
    test('should handle non-existent ticket', () => {
      // Test error handling
    });
  });
  
  // Additional test suites for:
  // - Ticket Assignment
  // - Ticket Comments  
  // - Ticket Listing
  // - Ticket Archiving
  // - Ticket Show Details
});
```

### Service Initialization Tests (10 tests)

**File**: `tests/unit/service-init.test.js`

```javascript
describe('Service Initialization System', () => {
  describe('Service Creation Validation', () => {
    test('should validate service names correctly', () => {
      // Test service name validation
    });
    
    test('should reject duplicate service names', () => {
      // Test duplicate detection
    });
  });
  
  describe('NestJS Backend Service Creation', () => {
    test('should create complete NestJS project structure', () => {
      // Test file generation
    });
    
    test('should create TypeScript configuration', () => {
      // Test config file generation
    });
  });
  
  // Test suites for:
  // - React Frontend Service Creation
  // - Microservice Creation
  // - Worker Service Creation
  // - Port Assignment
  // - Docker Integration
});
```

### Docker Compose Tests (5 tests)

**File**: `tests/unit/docker-compose.test.js`

```javascript
describe('Docker Compose Integration System', () => {
  describe('Service Configuration Generation', () => {
    test('should generate correct development configuration', () => {
      // Test dev environment config
    });
    
    test('should generate correct production configuration', () => {
      // Test prod environment config
    });
  });
  
  describe('Error Handling', () => {
    test('should validate required parameters', () => {
      // Test parameter validation
    });
    
    test('should handle missing docker-compose files', () => {
      // Test graceful error handling
    });
  });
});
```

## 🔗 Integration Tests (8 Tests)

Integration tests validate how different components work together.

### API Endpoint Tests

```javascript
describe('API Integration Tests', () => {
  let app;
  
  beforeAll(async () => {
    // Setup test application
    app = await createTestApp();
  });
  
  afterAll(async () => {
    // Cleanup test app
    await app.close();
  });
  
  test('should handle user registration', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'securePassword123'
      })
      .expect(201);
      
    expect(response.body).toHaveProperty('token');
  });
  
  test('should validate health endpoints', async () => {
    await request(app)
      .get('/api/health')
      .expect(200)
      .expect(res => {
        expect(res.body.status).toBe('ok');
      });
  });
});
```

### Database Integration Tests

```javascript
describe('Database Integration', () => {
  let connection;
  
  beforeAll(async () => {
    connection = await createTestConnection();
  });
  
  afterAll(async () => {
    await connection.close();
  });
  
  test('should perform CRUD operations', async () => {
    // Test database operations
  });
  
  test('should handle transactions', async () => {
    // Test transaction handling
  });
});
```

### Service Communication Tests

```javascript
describe('Service Communication', () => {
  test('should communicate between services', async () => {
    // Test inter-service communication
  });
  
  test('should handle service failures gracefully', async () => {
    // Test error handling between services
  });
});
```

## 🌐 End-to-End Tests (4 Tests)

E2E tests validate complete user workflows and system behavior.

### Complete Workflow Tests

**File**: `tests/e2e/workflow.test.js`

```javascript
describe('End-to-End Workflow Tests', () => {
  describe('Complete Project Initialization Workflow', () => {
    test('should create ticket, develop service, and deploy successfully', async () => {
      // 1. Create a development ticket
      const ticketResult = execSync(
        `node ${TICKET_CLI_PATH} create -t "E2E Test Service" --type feature -p high`,
        { env: { ...process.env, TICKET_ROOT: TEST_TICKETS_DIR }, encoding: 'utf8' }
      );
      
      const ticketMatch = ticketResult.match(/Created ticket (TICKET-[\w-]+)/);
      const ticketId = ticketMatch[1];
      
      // 2. Move ticket to in-progress
      execSync(`node ${TICKET_CLI_PATH} move ${ticketId} in-progress`, {
        env: { ...process.env, TICKET_ROOT: TEST_TICKETS_DIR },
        encoding: 'utf8'
      });
      
      // 3. Generate a new service
      execSync(`node ${SERVICE_INIT_PATH} nestjs-backend test-e2e-service 3020`, {
        encoding: 'utf8'
      });
      
      // 4. Verify service was created and integrated
      expect(fs.existsSync('test-apps/test-e2e-service')).toBe(true);
      expect(fs.existsSync('test-apps/test-e2e-service/package.json')).toBe(true);
      
      // 5. Complete the ticket
      execSync(`node ${TICKET_CLI_PATH} move ${ticketId} done`, {
        env: { ...process.env, TICKET_ROOT: TEST_TICKETS_DIR },
        encoding: 'utf8'
      });
      
      console.log('✅ Complete workflow test passed successfully!');
    });
    
    test('should handle multiple services in a project', async () => {
      // Test multi-service project setup
    });
    
    test('should handle ticket workflow with dependencies', async () => {
      // Test complex ticket workflows
    });
  });
  
  describe('Error Recovery and Edge Cases', () => {
    test('should handle service creation failures gracefully', async () => {
      // Test error recovery
    });
    
    test('should handle concurrent ticket operations', async () => {
      // Test concurrent operations
    });
  });
});
```

## 🛠️ Test Utilities and Helpers

### Custom Test Matchers

**File**: `tests/setup.js`

```javascript
// Custom matchers for domain-specific testing
expect.extend({
  toBeValidTicketId(received) {
    const pass = /^TICKET-[\w-]+$/.test(received);
    return {
      message: () => pass 
        ? `expected ${received} not to be a valid ticket ID`
        : `expected ${received} to be a valid ticket ID (format: TICKET-xxx-xxx)`,
      pass,
    };
  },
  
  toHaveValidPackageJson(received) {
    try {
      const packagePath = path.join(received, 'package.json');
      const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      const hasRequired = packageContent.name && packageContent.version;
      
      return {
        message: () => hasRequired
          ? `expected ${received} not to have a valid package.json`
          : `expected ${received} to have a valid package.json with name and version`,
        pass: hasRequired,
      };
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
    const hasDockerfiles = fs.existsSync(dockerfileDev) && fs.existsSync(dockerfile);
    
    return {
      message: () => hasDockerfiles
        ? `expected ${received} not to have Dockerfiles`
        : `expected ${received} to have both Dockerfile.dev and Dockerfile`,
      pass: hasDockerfiles,
    };
  }
});
```

### Test Data Management

```javascript
// Test data factories
const createTestTicket = (overrides = {}) => ({
  title: 'Test Ticket',
  type: 'feature',
  priority: 'medium',
  description: 'Test description',
  ...overrides
});

const createTestService = (overrides = {}) => ({
  type: 'nestjs-backend',
  name: 'test-service',
  port: 3020,
  ...overrides
});

// Test environment helpers
const setupTestEnvironment = () => {
  const testDir = path.join(__dirname, '../test-data');
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }
  return testDir;
};

const cleanupTestEnvironment = (testDir) => {
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true, force: true });
  }
};
```

## 📊 Test Execution and Reporting

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit              # Unit tests only
npm run test:integration       # Integration tests only
npm run test:e2e              # End-to-end tests only

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- ticket-cli.test.js

# Run tests matching pattern
npm test -- --testNamePattern="authentication"

# Debug tests
npm run test:debug
```

### Test Reporting

The framework generates multiple report formats:

1. **Console Output** - Real-time test results
2. **HTML Reports** - Detailed coverage reports
3. **JSON Reports** - Machine-readable results
4. **JUnit XML** - CI/CD integration format

**Custom Test Results Processor** (`tests/testResultsProcessor.js`):

```javascript
module.exports = (results) => {
  const summary = {
    total: results.numTotalTests,
    passed: results.numPassedTests,
    failed: results.numFailedTests,
    pending: results.numPendingTests,
    coverage: results.coverageMap ? {
      lines: results.coverageMap.getCoverageSummary().lines.pct,
      functions: results.coverageMap.getCoverageSummary().functions.pct,
      branches: results.coverageMap.getCoverageSummary().branches.pct,
      statements: results.coverageMap.getCoverageSummary().statements.pct
    } : null
  };
  
  // Generate summary report
  console.log('\n📊 Test Results Summary:');
  console.log(`✅ Passed: ${summary.passed}/${summary.total} tests`);
  console.log(`❌ Failed: ${summary.failed}/${summary.total} tests`);
  console.log(`⏭️  Skipped: ${summary.pending}/${summary.total} tests`);
  
  if (summary.coverage) {
    console.log('\n📈 Coverage Summary:');
    console.log(`Lines: ${summary.coverage.lines}%`);
    console.log(`Functions: ${summary.coverage.functions}%`);
    console.log(`Branches: ${summary.coverage.branches}%`);
    console.log(`Statements: ${summary.coverage.statements}%`);
  }
  
  return results;
};
```

## 🔧 Extending the Test Suite

### Adding New Unit Tests

1. **Create test file**:
   ```bash
   touch tests/unit/my-new-feature.test.js
   ```

2. **Write test structure**:
   ```javascript
   describe('My New Feature', () => {
     beforeEach(() => {
       // Setup for each test
     });
     
     afterEach(() => {
       // Cleanup after each test
     });
     
     test('should handle basic functionality', () => {
       // Test implementation
       expect(result).toBeDefined();
     });
     
     test('should handle error cases', () => {
       // Error testing
       expect(() => {
         dangerousFunction();
       }).toThrow();
     });
   });
   ```

### Adding Integration Tests

1. **Create integration test**:
   ```javascript
   describe('Feature Integration', () => {
     let testApp;
     
     beforeAll(async () => {
       testApp = await createTestApplication();
     });
     
     afterAll(async () => {
       await testApp.close();
     });
     
     test('should integrate with database', async () => {
       // Integration test implementation
     });
   });
   ```

### Adding E2E Tests

1. **Create workflow test**:
   ```javascript
   describe('New User Workflow', () => {
     test('should complete user onboarding', async () => {
       // 1. Create user account
       // 2. Verify email
       // 3. Complete profile
       // 4. Access dashboard
       // 5. Verify all features work
     });
   });
   ```

### Custom Test Configuration

**Environment-specific configuration**:

```javascript
// tests/config/test.config.js
module.exports = {
  development: {
    database: 'test_dev_db',
    timeout: 10000
  },
  ci: {
    database: 'test_ci_db', 
    timeout: 30000,
    verbose: false
  }
};
```

## 🚨 Test Maintenance

### Test Quality Guidelines

1. **Descriptive Test Names**:
   ```javascript
   // Good
   test('should create ticket with valid parameters and return ticket ID')
   
   // Bad  
   test('creates ticket')
   ```

2. **Arrange-Act-Assert Pattern**:
   ```javascript
   test('should calculate total price correctly', () => {
     // Arrange
     const items = [{ price: 10 }, { price: 20 }];
     
     // Act
     const total = calculateTotal(items);
     
     // Assert
     expect(total).toBe(30);
   });
   ```

3. **Test Independence**:
   - Each test should be independent
   - Tests should not rely on execution order
   - Use proper setup/teardown

4. **Error Testing**:
   ```javascript
   test('should handle invalid input gracefully', () => {
     expect(() => {
       processData(null);
     }).toThrow('Invalid input data');
   });
   ```

### Continuous Integration

**GitHub Actions Integration**:

```yaml
name: Test Suite
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run test:ci
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
```

### Test Performance

**Optimization strategies**:

1. **Parallel Execution**: Jest runs tests in parallel by default
2. **Test Isolation**: Use proper mocking to avoid external dependencies
3. **Selective Testing**: Run only affected tests during development
4. **Resource Cleanup**: Properly clean up test resources

### Debugging Tests

**VS Code Integration** (`.vscode/launch.json`):

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Tests",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "${relativeFile}"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

## 📈 Coverage and Quality Metrics

### Coverage Requirements

- **Unit Tests**: 80% minimum coverage
- **Integration Tests**: 70% minimum coverage  
- **Critical Business Logic**: 100% coverage required
- **Error Handling**: All error paths must be tested

### Quality Gates

Tests must pass these quality gates:

1. **All tests pass** (0 failures)
2. **Coverage thresholds met** (70% minimum)
3. **No test timeouts** (under 30 seconds total)
4. **No console errors** during test runs
5. **Proper test cleanup** (no resource leaks)

### Metrics Tracking

Track these metrics over time:

- Test execution time
- Test coverage percentage
- Test failure rate
- Flaky test identification
- Code quality scores

## 🎯 Best Practices Summary

### Writing Effective Tests

1. **Test Behavior, Not Implementation**
2. **Use Descriptive Test Names**
3. **Follow AAA Pattern** (Arrange, Act, Assert)
4. **Test Edge Cases and Error Conditions**
5. **Keep Tests Independent and Isolated**
6. **Use Appropriate Test Types** (Unit vs Integration vs E2E)
7. **Mock External Dependencies**
8. **Maintain Test Code Quality**

### Test Organization

1. **Group Related Tests** in describe blocks
2. **Use Consistent File Naming** (.test.js suffix)
3. **Organize by Feature** not by test type
4. **Share Common Setup** using beforeEach/beforeAll
5. **Clean Up Resources** in afterEach/afterAll

### Performance and Reliability

1. **Fast Test Execution** (unit tests < 5 seconds)
2. **Reliable Test Results** (no flaky tests)
3. **Proper Error Handling** in tests
4. **Resource Management** (cleanup after tests)
5. **Parallel Execution** where possible

This comprehensive testing framework ensures code quality, prevents regressions, and provides confidence in deployments. The 42-test suite covers all critical functionality while remaining maintainable and fast.

---

🧪 **42 Tests** | ⚡ **Fast Execution** | 📊 **70% Coverage** | 🔄 **CI/CD Ready** 