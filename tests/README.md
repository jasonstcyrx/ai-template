# Testing System Documentation

This directory contains a comprehensive test suite for the templating and ticketing systems. The tests ensure that all components work correctly individually and as a complete workflow.

## Overview

The testing system validates:
- ✅ **Ticket CLI System** - All ticket operations (create, move, comment, etc.)
- ✅ **Service Initialization** - Creation of different service types
- ✅ **Docker Compose Integration** - Automatic service configuration
- ✅ **End-to-End Workflows** - Complete project lifecycle scenarios
- ✅ **Error Handling** - Recovery from failures and edge cases

## Test Structure

```
tests/
├── unit/                     # Unit tests for individual components
│   ├── ticket-cli.test.js    # Ticket CLI system tests
│   ├── service-init.test.js  # Service initialization tests
│   └── docker-compose.test.js # Docker compose integration tests
├── e2e/                      # End-to-end workflow tests
│   └── workflow.test.js      # Complete project workflows
├── data/                     # Test fixtures and sample data
├── jest.config.js           # Jest configuration
├── setup.js                 # Global test setup
├── globalSetup.js           # Test environment initialization
├── globalTeardown.js        # Test environment cleanup
├── testResultsProcessor.js  # Custom test results processing
└── README.md                # This file
```

## Running Tests

### Prerequisites

Install dependencies:
```bash
yarn install
```

### Test Commands

| Command | Description |
|---------|-------------|
| `yarn test` | Run all tests |
| `yarn test:unit` | Run only unit tests |
| `yarn test:e2e` | Run only end-to-end tests |
| `yarn test:watch` | Run tests in watch mode |
| `yarn test:coverage` | Run tests with coverage report |
| `yarn test:ci` | Run tests in CI mode (no watch) |
| `yarn test:debug` | Run tests in debug mode |
| `yarn test:clean` | Clean up test artifacts |

### Example Test Run

```bash
# Run all tests with coverage
yarn test:coverage

# Run specific test file
yarn test ticket-cli.test.js

# Run tests in watch mode during development
yarn test:watch
```

## Test Categories

### 1. Unit Tests

#### Ticket CLI Tests (`unit/ticket-cli.test.js`)

Tests all ticket management operations:

- **Ticket Creation**
  - Valid parameters
  - Invalid priority/type validation
  - Label handling
  - Default values

- **Ticket Movement**
  - State transitions (backlog → todo → in-progress → review → done)
  - Invalid state handling
  - Metadata updates

- **Ticket Operations**
  - Assignment to users
  - Adding comments
  - Archiving
  - Listing and filtering

- **Error Handling**
  - Non-existent tickets
  - Invalid operations

#### Service Initialization Tests (`unit/service-init.test.js`)

Tests service creation for different types:

- **NestJS Backend Services**
  - Complete project structure
  - Package.json configuration
  - TypeScript setup
  - Docker configuration

- **React Frontend Services**
  - Vite configuration
  - Modern React setup
  - Nginx configuration

- **Microservices**
  - Express-based services
  - Basic API structure

- **Worker Services**
  - Background job processing
  - Queue configuration

#### Docker Compose Integration Tests (`unit/docker-compose.test.js`)

Tests automatic service configuration:

- **Service Configuration Generation**
  - Development vs production settings
  - Environment variables
  - Port assignments
  - Health checks

- **Network Management**
  - Service networking
  - Dependencies
  - Resource limits

### 2. End-to-End Tests

#### Complete Workflow Tests (`e2e/workflow.test.js`)

Tests real-world scenarios:

- **Full Project Lifecycle**
  - Create ticket for new feature
  - Develop and deploy service
  - Move ticket through all states
  - Add comments and track progress

- **Multi-Service Projects**
  - Creating multiple services
  - Managing dependencies
  - Coordinated deployment

- **Dependency Management**
  - Blocking and unblocking tickets
  - Sequential development
  - Error recovery

## Test Features

### Custom Matchers

The test suite includes custom Jest matchers for domain-specific assertions:

```javascript
// Ticket ID validation
expect(ticketId).toBeValidTicketId();

// Service structure validation
expect(serviceDir).toHaveValidPackageJson();
expect(serviceDir).toHaveDockerfile();
```

### Test Utilities

Global utilities are available in all tests:

```javascript
// Clean up test directories
global.testUtils.cleanupTestDirectories([dir1, dir2]);

// Create test structure
global.testUtils.createTestStructure(basePath, structure);

// Wait for async conditions
await global.testUtils.waitFor(condition, timeout);
```

### Console Mocking

Tests can capture and verify console output:

```javascript
const logs = global.mockConsole();
// ... run code that logs
expect(logs.log).toContain('Expected message');
global.restoreConsole();
```

## Test Data Management

### Fixtures

Sample data is available in `tests/data/`:
- `sample-ticket.json` - Example ticket structure
- `package-*.json` - Package.json templates for different service types

### Isolation

Each test runs in isolation:
- Temporary directories for file operations
- Clean environment for each test
- No shared state between tests

## Coverage Requirements

The test suite enforces minimum coverage thresholds:

- **Lines:** 70%
- **Functions:** 70%
- **Branches:** 70%
- **Statements:** 70%

Critical business logic should aim for 100% coverage.

## Test Reports

After running tests, detailed reports are generated in `test-results/`:

- `test-results.json` - Machine-readable test results
- `test-report.md` - Human-readable markdown report
- `test-report.html` - Interactive HTML report
- `coverage/` - Detailed coverage reports

### Sample Report Structure

```
📊 Test Results Summary:
✅ Passed: 45/47 tests
❌ Failed: 2/47 tests
⏭️  Skipped: 0/47 tests

📈 Coverage Summary:
Lines: 85.2%
Functions: 78.9%
Branches: 82.1%
Statements: 84.7%
```

## Continuous Integration

The test suite is designed for CI/CD integration:

```yaml
# Example GitHub Actions step
- name: Run Tests
  run: yarn test:ci

- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    file: ./test-results/coverage/lcov.info
```

## Development Workflow

### Adding New Tests

1. **Create test file** in appropriate directory
2. **Follow naming convention** - `*.test.js`
3. **Use descriptive test names** - explain what is being tested
4. **Include setup/teardown** - ensure clean test environment
5. **Add documentation** - comment complex test logic

### Test-Driven Development

For new features:

1. **Write failing test** first
2. **Implement minimal code** to pass
3. **Refactor** while keeping tests green
4. **Add edge case tests**

### Debugging Tests

```bash
# Run specific test in debug mode
yarn test:debug --testNamePattern="ticket creation"

# Enable verbose output
yarn test --verbose

# Run with Node.js inspector
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Best Practices

### Test Organization

- **Group related tests** using `describe` blocks
- **Use clear test names** that explain the scenario
- **Follow AAA pattern** - Arrange, Act, Assert
- **Test one thing** per test case

### Assertions

- **Use specific matchers** for better error messages
- **Test both positive and negative cases**
- **Verify side effects** (file creation, state changes)
- **Check error conditions**

### Performance

- **Use `beforeEach/afterEach`** for test isolation
- **Avoid heavy setup** in individual tests
- **Mock external dependencies**
- **Clean up resources** properly

## Troubleshooting

### Common Issues

#### Test Timeouts
```javascript
// Increase timeout for slow tests
test('slow operation', async () => {
  // test code
}, 30000); // 30 second timeout
```

#### File System Race Conditions
```javascript
// Wait for file operations
await global.testUtils.waitFor(() => fs.existsSync(filePath));
```

#### Permission Errors
```bash
# Ensure test cleanup
yarn test:clean

# Check file permissions
ls -la test-*
```

### Getting Help

1. **Check test output** - Jest provides detailed error messages
2. **Review test logs** - Check `test-results/logs/`
3. **Run in debug mode** - Use Node.js inspector
4. **Isolate the problem** - Run specific test files

## Future Enhancements

### Planned Improvements

- **Integration with Playwright** for browser testing
- **Performance benchmarking** for service initialization
- **Visual regression testing** for generated files
- **Database integration testing** for persistent state
- **Load testing** for ticket system scalability

### Contributing

When adding new features to the template system:

1. **Add corresponding tests** for new functionality
2. **Update test documentation** if needed
3. **Ensure coverage targets** are maintained
4. **Test in CI environment** before merging

---

This testing system provides a solid foundation for validating the template's functionality and ensuring reliability across different development scenarios. The comprehensive test coverage gives confidence that the templating and ticketing systems work correctly both individually and as an integrated whole. 