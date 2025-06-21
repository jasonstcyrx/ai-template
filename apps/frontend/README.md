# Frontend Template

A modern React frontend application built with Vite, TypeScript, and a comprehensive tech stack.

## Tech Stack

- **React 19** - UI library with functional components
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and development server
- **Material-UI (MUI)** - React component library
- **React Router v6** - Client-side routing
- **Zustand** - State management
- **SWR** - Data fetching and caching
- **ESLint + Prettier** - Code quality and formatting

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Shared components
│   ├── forms/          # Form components
│   └── layout/         # Layout components
├── pages/              # Page components (routes)
├── stores/             # Zustand stores
├── services/           # API services and SWR hooks
├── hooks/              # Custom React hooks
├── lib/                # Third-party library configurations
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── styles/             # Global styles and themes
├── contexts/           # React context providers
└── constants/          # Application constants
```

## Getting Started

### Prerequisites

- Node.js 18.20.1 or higher
- Yarn package manager

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd apps/frontend
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Start the development server:
   ```bash
   yarn dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) to view the application.

### Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn preview` - Preview production build
- `yarn lint` - Run ESLint
- `yarn type-check` - Run TypeScript type checking

## Environment Variables

Create a `.env.local` file in the frontend directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api

# Application Configuration
VITE_APP_NAME=Frontend Template
VITE_APP_VERSION=1.0.0
```

## Features

### 🎨 Material-UI Integration
- Custom theme configuration
- Responsive design components
- Dark/light theme support (configurable)

### 🗂️ State Management (Zustand)
- Global application state
- User session management
- UI state (sidebar, loading, etc.)

### 🌐 Data Fetching (SWR)
- Automatic caching and revalidation
- Error handling and retry logic
- Loading states management

### 🧭 Routing (React Router)
- Client-side routing
- Navigation components
- Route-based code splitting

### 📱 Responsive Design
- Mobile-first approach
- Flexible grid layouts
- Adaptive navigation

## Components

### Layout Components
- `AppLayout` - Main application layout with sidebar and header
- Navigation sidebar with route highlighting

### Pages
- `HomePage` - Dashboard with feature overview
- `UsersPage` - User management with data fetching demo
- `SettingsPage` - Application settings and preferences

### Services
- `api.ts` - SWR hooks for data fetching
- API utilities and error handling

## State Management

The application uses Zustand for state management:

```typescript
import { useAppStore } from './stores/useAppStore';

const { user, setUser, isLoading, setLoading } = useAppStore();
```

### Available State
- User session data
- UI state (sidebar, theme, loading)
- Application preferences

## Data Fetching

SWR is used for data fetching with custom hooks:

```typescript
import { useUsers } from './services/api';

const { users, isLoading, error, mutate } = useUsers();
```

### Features
- Automatic revalidation
- Error handling
- Optimistic updates
- Request deduplication

## Styling

### MUI Theme
Custom theme configuration in `src/lib/theme.ts`:
- Color palette
- Typography
- Component overrides
- Responsive breakpoints

### Best Practices
- Use MUI's sx prop for styling
- Leverage theme tokens
- Maintain design consistency
- Follow responsive design principles

## Development Guidelines

### Component Creation
- Use functional components only
- Implement proper TypeScript types
- Follow naming conventions (PascalCase for components)
- Include proper error boundaries

### State Management
- Use Zustand for global state
- Keep local state in components when appropriate
- Implement proper state updates

### API Integration
- Use SWR hooks for data fetching
- Implement proper error handling
- Follow RESTful conventions

## Testing

### Unit Testing
```bash
yarn test
```

### E2E Testing
```bash
yarn test:e2e
```

## Build and Deployment

### Production Build
```bash
yarn build
```

### Preview Build
```bash
yarn preview
```

The build artifacts will be stored in the `dist/` directory.

## Performance Optimization

- Code splitting with React.lazy
- SWR caching for API calls
- Optimized bundle sizes
- Tree shaking enabled

## Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

## Contributing

1. Follow the project structure guidelines
2. Use TypeScript for all new code
3. Implement proper error handling
4. Add tests for new features
5. Follow the Git workflow guidelines

## Architecture Decisions

### Why Vite?
- Fast development server
- Hot module replacement
- Optimized builds
- Plugin ecosystem

### Why Zustand?
- Simple API
- TypeScript support
- No boilerplate
- DevTools integration

### Why SWR?
- Automatic caching
- Background revalidation
- Error handling
- Real-time updates

### Why MUI?
- Production-ready components
- Accessibility built-in
- Theming capabilities
- Large ecosystem

## Next Steps

- [ ] Add authentication flow
- [ ] Implement form validation with Formik + Yup
- [ ] Add data visualization components
- [ ] Implement PWA features
- [ ] Add internationalization (i18n)
- [ ] Set up monitoring and analytics
