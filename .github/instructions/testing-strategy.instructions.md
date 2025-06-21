---
applyTo: '**'
---

# Testing Strategy Guidelines

## Testing Philosophy

### Core Principle

**All code must be tested** - Every feature, component, and API endpoint requires comprehensive test coverage.

### Testing Pyramid

1. **Unit Tests** (70%) - Fast, isolated, focused
2. **Integration Tests** (20%) - API and service integration
3. **E2E Tests** (10%) - Critical user journeys

### Testing Standards

- **Minimum 80% code coverage** for all projects
- **100% coverage** for critical business logic
- **Test-driven development (TDD)** for complex features
- **Continuous testing** in CI/CD pipeline

## Unit Testing

### Framework & Tools

- **Jest** - Primary testing framework
- **React Testing Library** - Component testing
- **@testing-library/jest-dom** - Custom matchers
- **MSW (Mock Service Worker)** - API mocking

### Unit Testing Patterns

#### AAA Pattern (Arrange, Act, Assert)

```typescript
describe("UserService", () => {
  it("should create user with valid data", async () => {
    // Arrange
    const userData = { name: "John Doe", email: "john@example.com" };
    const mockUser = { id: 1, ...userData };
    jest.spyOn(userRepository, "create").mockResolvedValue(mockUser);

    // Act
    const result = await userService.createUser(userData);

    // Assert
    expect(result).toEqual(mockUser);
    expect(userRepository.create).toHaveBeenCalledWith(userData);
  });
});
```

#### Component Testing

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { UserForm } from "./UserForm";

describe("UserForm", () => {
  it("should submit form with valid data", async () => {
    // Arrange
    const mockOnSubmit = jest.fn();
    render(<UserForm onSubmit={mockOnSubmit} />);

    // Act
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "john@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    // Assert
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: "John Doe",
        email: "john@example.com",
      });
    });
  });

  it("should display validation errors", async () => {
    // Test error states
    render(<UserForm onSubmit={jest.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
  });
});
```

### Testing Best Practices

#### Mock External Dependencies

```typescript
// Mock API calls
jest.mock("../services/api", () => ({
  userApi: {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock React hooks
jest.mock("../hooks/useAuth", () => ({
  useAuth: () => ({
    user: { id: 1, name: "Test User" },
    isAuthenticated: true,
    login: jest.fn(),
    logout: jest.fn(),
  }),
}));
```

#### Test Edge Cases

```typescript
describe("calculateDiscount", () => {
  it("should handle zero amount", () => {
    expect(calculateDiscount(0, 0.1)).toBe(0);
  });

  it("should handle negative amounts", () => {
    expect(() => calculateDiscount(-100, 0.1)).toThrow();
  });

  it("should handle discount greater than 100%", () => {
    expect(() => calculateDiscount(100, 1.5)).toThrow();
  });
});
```

## Integration Testing

### API Integration Testing

```typescript
describe("User API Integration", () => {
  let app: INestApplication;
  let userRepository: Repository<User>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    userRepository = moduleRef.get(getRepositoryToken(User));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    await userRepository.clear();
  });

  it("POST /users should create user", async () => {
    const userData = { name: "John Doe", email: "john@example.com" };

    const response = await request(app.getHttpServer())
      .post("/users")
      .send(userData)
      .expect(201);

    expect(response.body).toMatchObject(userData);

    const savedUser = await userRepository.findOne({
      where: { email: userData.email },
    });
    expect(savedUser).toBeDefined();
  });
});
```

### Database Integration Testing

```typescript
describe("User Repository", () => {
  let repository: Repository<User>;
  let connection: Connection;

  beforeAll(async () => {
    connection = await createConnection(testDbConfig);
    repository = connection.getRepository(User);
  });

  afterAll(async () => {
    await connection.close();
  });

  beforeEach(async () => {
    await repository.clear();
  });

  it("should save and retrieve user", async () => {
    const user = repository.create({ name: "John", email: "john@example.com" });
    await repository.save(user);

    const found = await repository.findOne({
      where: { email: "john@example.com" },
    });
    expect(found).toBeDefined();
    expect(found.name).toBe("John");
  });
});
```

## End-to-End Testing

### Playwright E2E Testing

```typescript
import { test, expect } from "@playwright/test";

test.describe("User Authentication Flow", () => {
  test("should allow user to login and logout", async ({ page }) => {
    // Navigate to login page
    await page.goto("/login");

    // Fill login form
    await page.fill('[data-testid="email"]', "test@example.com");
    await page.fill('[data-testid="password"]', "password123");
    await page.click('[data-testid="login-button"]');

    // Verify successful login
    await expect(page).toHaveURL("/dashboard");
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();

    // Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');

    // Verify logout
    await expect(page).toHaveURL("/login");
  });

  test("should display error for invalid credentials", async ({ page }) => {
    await page.goto("/login");

    await page.fill('[data-testid="email"]', "invalid@example.com");
    await page.fill('[data-testid="password"]', "wrongpassword");
    await page.click('[data-testid="login-button"]');

    await expect(page.locator('[data-testid="error-message"]')).toContainText(
      "Invalid credentials"
    );
  });
});
```

### E2E Testing Best Practices

- **Use data-testid attributes** for stable selectors
- **Test critical user journeys** only
- **Run against staging environment**
- **Include visual regression testing**
- **Test responsive design** at different screen sizes

## Performance Testing

### Load Testing with Artillery

```yaml
config:
  target: "http://localhost:3000"
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "User Registration Flow"
    requests:
      - post:
          url: "/api/users"
          json:
            name: "Test User"
            email: "test@example.com"
```

### Frontend Performance Testing

```typescript
test("should load homepage within 3 seconds", async ({ page }) => {
  const start = Date.now();
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  const loadTime = Date.now() - start;

  expect(loadTime).toBeLessThan(3000);
});
```

## Test Organization

### File Structure

```
tests/
├── unit/                    # Unit tests
│   ├── components/         # Component tests
│   ├── services/           # Service tests
│   ├── utils/              # Utility tests
│   └── hooks/              # Hook tests
├── integration/            # Integration tests
│   ├── api/               # API integration tests
│   └── database/          # Database tests
├── e2e/                   # End-to-end tests
│   ├── auth/              # Authentication flows
│   ├── user/              # User management flows
│   └── common/            # Shared test utilities
├── fixtures/              # Test data and fixtures
├── mocks/                 # Mock implementations
└── setup/                 # Test setup and configuration
```

### Naming Conventions

- **Unit Tests**: `ComponentName.test.tsx` or `serviceName.spec.ts`
- **Integration Tests**: `featureName.integration.test.ts`
- **E2E Tests**: `userFlow.e2e.ts`
- **Test Utilities**: `testUtils.ts` or `testHelpers.ts`

## Test Data Management

### Fixtures and Factories

```typescript
// Test data factory
export const createUserFixture = (overrides: Partial<User> = {}): User => ({
  id: 1,
  name: "John Doe",
  email: "john@example.com",
  createdAt: new Date(),
  ...overrides,
});

// Test data builder
export class UserBuilder {
  private user: Partial<User> = {};

  withName(name: string): UserBuilder {
    this.user.name = name;
    return this;
  }

  withEmail(email: string): UserBuilder {
    this.user.email = email;
    return this;
  }

  build(): User {
    return createUserFixture(this.user);
  }
}
```

### Database Seeding for Tests

```typescript
export const seedTestDatabase = async () => {
  const users = [
    { name: "Admin User", email: "admin@test.com", role: "admin" },
    { name: "Regular User", email: "user@test.com", role: "user" },
  ];

  await User.insertMany(users);
};
```

## Continuous Integration Testing

### GitHub Actions Workflow

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
          node-version: "18"
          cache: "yarn"

      - run: yarn install --frozen-lockfile
      - run: yarn test:unit
      - run: yarn test:integration
      - run: yarn test:e2e

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
```

### Test Quality Gates

- **All tests must pass** before merge
- **Coverage threshold** must be met
- **No test files should be skipped** without justification
- **Flaky tests** must be fixed or removed

## Testing Documentation

### Test Documentation Requirements

- **Test plan** for each major feature
- **API testing documentation** with examples
- **E2E test scenarios** documented
- **Performance benchmarks** and thresholds
- **Testing environment setup** guide

### Documenting Test Cases

```typescript
/**
 * Test Suite: User Authentication
 *
 * Covers:
 * - User registration flow
 * - Login/logout functionality
 * - Password reset process
 * - Session management
 * - Security validations
 */
describe("User Authentication", () => {
  // Test implementation
});
```

## Monitoring and Reporting

### Test Metrics to Track

- **Test coverage percentage**
- **Test execution time**
- **Flaky test rate**
- **Test failure patterns**
- **Performance regression**

### Test Reporting

- **Coverage reports** generated after each test run
- **Test results** published to team dashboard
- **Performance metrics** tracked over time
- **Flaky test alerts** for investigation

## Testing Checklist

### Before Committing Code

- [ ] All unit tests written and passing
- [ ] Integration tests for API changes
- [ ] E2E tests for user-facing features
- [ ] Code coverage meets minimum threshold
- [ ] No test files skipped without reason
- [ ] Test data cleaned up properly
- [ ] Performance tests pass benchmarks

### Code Review Checklist

- [ ] Tests cover happy path and edge cases
- [ ] Test descriptions are clear and meaningful
- [ ] Proper mocking of external dependencies
- [ ] No hardcoded test data in production code
- [ ] Test cleanup is properly implemented
- [ ] Performance impact of tests considered

This comprehensive testing strategy ensures code quality, reliability, and maintainability while supporting rapid development cycles.
