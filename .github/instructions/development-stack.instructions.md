---
applyTo: '**'
---

# Development Stack Guidelines

## Package Management

- **Always use Yarn** - DO NOT USE npm
- Lock file: `yarn.lock` (never commit `package-lock.json`)
- Scripts: Use `yarn` commands in all documentation and scripts

## Frontend Stack

### Core Technologies

- **React** - Functional components only
- **TypeScript** - Strict mode enabled
- **Next.js** - For web applications (when applicable)

### UI Framework

- **MUI (Material-UI)** - Primary UI component library
- **Tamagui** - For mobile/shared components
- **NO custom styled components** unless absolutely necessary
- Use theme customization over custom styles

### State Management & Forms

- **Formik + Yup** - All forms must use this combination
- **React Hooks** - useState, useEffect, useContext, custom hooks
- **React Query/TanStack Query** - For server state management (when needed)

### Form Validation Pattern

```typescript
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const validationSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string().min(8, "Too short!").required("Required"),
});

<Formik
  initialValues={{ email: "", password: "" }}
  validationSchema={validationSchema}
  onSubmit={handleSubmit}
>
  {({ isSubmitting }) => (
    <Form>
      <Field name='email' type='email' />
      <ErrorMessage name='email' component='div' />
      <Field name='password' type='password' />
      <ErrorMessage name='password' component='div' />
      <button type='submit' disabled={isSubmitting}>
        Submit
      </button>
    </Form>
  )}
</Formik>;
```

## Backend Stack

### Core Technologies

- **NestJS** - Node.js framework
- **TypeScript** - Strict mode
- **Express** - HTTP server (via NestJS)

### Database & Storage

- **MongoDB** - Primary database
- **Mongoose** - ODM for MongoDB
- **Redis** - Caching and pub/sub
- **BullMQ** - Job queue processing

### Architecture Patterns

- **Modular Architecture** - Feature-based modules
- **Dependency Injection** - Use NestJS DI container
- **DTOs** - Data Transfer Objects for validation
- **Guards** - Authentication and authorization
- **Pipes** - Data transformation and validation
- **Interceptors** - Cross-cutting concerns

### Database Best Practices

```typescript
// Schema with proper indexing
const UserSchema = new Schema({
  email: { type: String, required: true, unique: true, index: true },
  createdAt: { type: Date, default: Date.now, index: true },
});

// Use transactions for multi-collection operations
const session = await mongoose.startSession();
session.startTransaction();
try {
  await User.create([userData], { session });
  await Profile.create([profileData], { session });
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

## Testing Stack

### Testing Framework

- **Jest** - Unit and integration tests
- **React Testing Library** - Component testing
- **Playwright** - End-to-end testing
- **MSW (Mock Service Worker)** - API mocking

### Coverage Requirements

- **Minimum 80% code coverage**
- **100% coverage for critical business logic**
- **All components must have tests**

## Code Quality Tools

### Linting & Formatting

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking
- **Husky** - Git hooks

### Pre-commit Hooks

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{js,jsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

## Development Environment

### Required VSCode Extensions

- ESLint
- Prettier
- TypeScript Hero
- Auto Rename Tag
- Bracket Pair Colorizer
- GitLens

### Environment Configuration

- Use `.env` files for environment variables
- Never commit sensitive data
- Use TypeScript for configuration files when possible

## Performance Guidelines

### Frontend Optimization

- **Code Splitting** - Use React.lazy and Suspense
- **Bundle Analysis** - Monitor bundle size
- **Image Optimization** - Use Next.js Image component
- **Memoization** - Use React.memo, useMemo, useCallback appropriately

### Backend Optimization

- **Database Queries** - Proper indexing and query optimization
- **Caching** - Use Redis for frequently accessed data
- **API Response** - Implement pagination and filtering
- **File Uploads** - Use streaming for large files

## Security Guidelines

### Frontend Security

- **Input Validation** - Always validate with Yup
- **XSS Prevention** - Sanitize user inputs
- **CSRF Protection** - Use proper tokens
- **Authentication** - Secure token storage

### Backend Security

- **Input Validation** - Use DTOs and class-validator
- **Authentication** - JWT with proper expiration
- **Authorization** - Role-based access control
- **Rate Limiting** - Implement request rate limiting
- **CORS** - Proper CORS configuration

## Deployment Stack

### Containerization

- **Docker** - All services must be containerized
- **Docker Compose** - Local development orchestration
- **Multi-stage builds** - Optimize image sizes

### CI/CD Pipeline

- **GitHub Actions** - Automated testing and deployment
- **Automated Testing** - All tests must pass before deployment
- **Environment Promotion** - Dev → Staging → Production

## Documentation Requirements

### Code Documentation

- **TypeDoc** - API documentation generation
- **JSDoc** - Function and class documentation
- **README** - Comprehensive project documentation
- **API Documentation** - OpenAPI/Swagger specifications

### Component Documentation

- **Storybook** - Component library documentation (when applicable)
- **PropTypes** - Component prop documentation
- **Usage Examples** - Real-world usage examples

## Monitoring & Observability

### Logging

- **Structured Logging** - JSON format
- **Log Levels** - Appropriate log levels (error, warn, info, debug)
- **Contextual Information** - Include request IDs and user context

### Metrics & Monitoring

- **Application Metrics** - Performance and business metrics
- **Health Checks** - Endpoint health monitoring
- **Error Tracking** - Centralized error reporting
- **Uptime Monitoring** - Service availability tracking

## Framework-Specific Guidelines

### React Best Practices

- **Functional Components** - No class components
- **Custom Hooks** - Extract reusable logic
- **Error Boundaries** - Implement proper error handling
- **Performance** - Avoid unnecessary re-renders

### NestJS Best Practices

- **Module Organization** - Feature-based modules
- **Exception Handling** - Proper error handling and responses
- **Validation** - Use DTOs for all endpoints
- **Logging** - Implement comprehensive logging

### MongoDB Best Practices

- **Schema Design** - Embed vs Reference decisions
- **Indexing Strategy** - Compound indexes for complex queries
- **Aggregation** - Use aggregation pipeline for complex operations
- **Data Validation** - Schema-level validation

This stack is designed for scalability, maintainability, and developer productivity. All team members must follow these guidelines to ensure consistency across the codebase.
