# ⚡ Quick Start Guide

Get up and running with the AI-Managed Development Template in under 5 minutes!

## 📋 Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (required)
- [Git](https://git-scm.com/) (required)
- [Node.js 18+](https://nodejs.org/) (optional, for local development)

## 🚀 1-Minute Setup

### Step 1: Clone & Start

```bash
# Clone the template
git clone https://github.com/your-username/ai-managed-development-template.git
cd ai-managed-development-template

# Start the development environment
npm run start
```

### Step 2: Verify Installation

Wait for all services to start (2-3 minutes), then check:

```bash
# Check service status
npm run status

# Verify frontend is running
open http://localhost:3000

# Verify backend API is running  
open http://localhost:3003/api/docs
```

You should see:
- ✅ **Frontend**: React app at http://localhost:3000
- ✅ **Backend**: API docs at http://localhost:3003/api/docs
- ✅ **All services healthy**: Green checkmarks in status

## 🎯 Your First AI-Generated Service

### Generate a New Backend Service

```bash
# Generate a user management service
npm run service:init nestjs-backend user-management 3004
```

**What happened:**
- ✅ Complete NestJS service generated
- ✅ Added to Docker Compose automatically
- ✅ Health checks configured
- ✅ TypeScript setup complete
- ✅ Ready for development

### Start Your New Service

```bash
# Restart to include new service
npm run restart

# Check the new service health
curl http://localhost:3004/health
```

## 🎫 Create Your First Ticket

```bash
# Create a feature ticket
npm run ticket:create -t "Add user authentication" --type feature -p high

# List your tickets
npm run ticket:list

# Start working on it
npm run ticket:move TICKET-xxx in-progress
```

## 🧪 Run the Test Suite

```bash
# Run all 42 tests
npm test

# Run tests in watch mode while developing
npm run test:watch
```

You should see:
```
✅ 42 tests passing
📊 Coverage: >70%
⚡ Fast execution: <30 seconds
```

## 🛠️ Essential Commands

### Development Commands

```bash
npm run start         # Start all services
npm run stop          # Stop all services
npm run restart       # Restart all services
npm run logs          # View all logs
npm run status        # Check service health
npm run shell backend # Access service container
```

### AI Service Generation

```bash
npm run service:init nestjs-backend api-service 3005      # Backend API
npm run service:init react-frontend dashboard 3006        # Frontend app
npm run service:init microservice notifications 3007      # Microservice
npm run service:init worker email-processor               # Background worker
```

### Ticket Management

```bash
npm run ticket:create -t "Feature name" --type feature -p high
npm run ticket:list
npm run ticket:move TICKET-xxx in-progress
npm run ticket:move TICKET-xxx done
```

### Testing

```bash
npm test                    # All tests
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:e2e          # End-to-end tests only
npm run test:coverage     # With coverage report
```

## 📁 Understanding the Structure

```
your-project/
├── apps/                  # Your generated services
│   ├── backend/          # NestJS API server
│   ├── frontend/         # React application  
│   ├── notification-service/  # Example microservice
│   └── email-worker/     # Example worker
├── tickets/              # Project management
│   ├── todo/            # Ready for development
│   ├── in-progress/     # Current work
│   └── done/            # Completed work
├── scripts/             # AI management tools
├── tests/               # 42 comprehensive tests
└── docker-compose.yml   # Service orchestration
```

## 🎯 What You Can Do Next

### 1. Explore the Generated Services

```bash
# Check what's running
npm run status

# View service logs
npm run logs backend
npm run logs frontend

# Access a service shell
npm run shell backend
```

### 2. Develop Your First Feature

```bash
# Create a ticket for your work
npm run ticket:create -t "Add user profile page" --type feature -p medium

# Generate a service if needed
npm run service:init react-frontend user-profile 3008

# Start development
npm run test:watch  # Keep tests running
npm run logs user-profile  # Monitor your service
```

### 3. Test Your Changes

```bash
# Run all tests
npm test

# Run specific tests
npm test -- user-profile.test.js

# Check coverage
npm run test:coverage
```

### 4. Production Deployment

```bash
# Build for production
npm run prod:build

# Deploy to production
npm run prod:start

# Monitor production
npm run prod:status
npm run prod:logs
```

## 🚨 Troubleshooting

### Common Issues

**Port conflicts:**
```bash
npm run stop          # Stop this project
docker ps             # Check what's running
npm run cleanup       # Clean up Docker resources
npm run start         # Restart
```

**Services not healthy:**
```bash
npm run logs          # Check error logs
npm run restart       # Restart all services
npm run status        # Verify health
```

**Tests failing:**
```bash
npm run test:clean    # Clean test artifacts
npm run rebuild       # Rebuild services
npm test              # Run tests again
```

**Need to reset everything:**
```bash
npm run stop
npm run cleanup
docker system prune -f
npm run start
```

## 📚 Learn More

- **[README.md](./README.md)** - Full documentation
- **[AI Management Guide](./docs/AI_MANAGEMENT.md)** - Detailed AI features
- **[Testing Framework](./docs/TESTING.md)** - Testing strategy
- **[Service Documentation](./SERVICE_INIT.md)** - Service generation guide

## 🎉 You're Ready!

You now have:
- ✅ **Complete development environment** running
- ✅ **AI-powered service generation** ready
- ✅ **Ticket management system** set up
- ✅ **42 comprehensive tests** passing
- ✅ **Production-ready architecture** configured

### Next Steps:

1. **Generate your first service**: `npm run service:init nestjs-backend my-service 3010`
2. **Create a development ticket**: `npm run ticket:create -t "My first feature" --type feature -p high`
3. **Start building**: The AI handles the infrastructure, you focus on the code!

---

**🤖 Happy building with AI-powered development!** 

For questions or issues, check the [troubleshooting section](#🚨-troubleshooting) or refer to the [full documentation](./README.md). 