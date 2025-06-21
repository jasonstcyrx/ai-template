# Autonomous Procurement & Waste Intelligence Platform

A fully containerized, modern full-stack application for autonomous procurement and waste intelligence, built with React, NestJS, MongoDB, and Docker.

## 🏗️ Architecture

### Technology Stack

#### Frontend
- **React 19** with TypeScript
- **Vite** for fast development and building
- **Material-UI (MUI)** for component library
- **Zustand** for state management
- **SWR** for data fetching
- **React Router v6** for navigation

#### Backend
- **NestJS** with TypeScript
- **MongoDB** with Mongoose ODM
- **Redis** for caching
- **Swagger/OpenAPI** for API documentation
- **JWT** authentication
- **Class-validator** for validation

#### Infrastructure
- **Docker** and **Docker Compose** for containerization
- **Nginx** for production load balancing
- **Multi-stage builds** for optimization
- **Health checks** for all services
- **Non-root containers** for security

## 🚀 Quick Start

### Prerequisites

- Docker Desktop installed and running
- Git for version control
- (Optional) Node.js 18+ for local development

### Development Setup

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd procurement-platform
   ```

2. **Start the Development Environment**:
   ```bash
   # Using yarn scripts
   yarn dev

   # Or using Docker helper script
   ./scripts/docker-dev.sh start

   # Or using Docker Compose directly
   docker-compose up -d
   ```

3. **Access the Applications**:
   - **Frontend**: http://localhost:5173
   - **Backend API**: http://localhost:3000
   - **API Documentation**: http://localhost:3000/api/docs
   - **MongoDB**: mongodb://localhost:27017

4. **View Logs**:
   ```bash
   yarn logs
   # or
   ./scripts/docker-dev.sh logs
   ```

### Production Deployment

1. **Configure Environment**:
   ```bash
   cp config/environment.example .env.production
   # Edit .env.production with production values
   ```

2. **Deploy**:
   ```bash
   yarn docker:prod
   # or
   docker-compose -f docker-compose.prod.yml up -d
   ```

## 📊 Services Overview

| Service | Port | Description | Health Check |
|---------|------|-------------|--------------|
| Frontend | 5173/80 | React application | http://localhost:5173 |
| Backend | 3000 | NestJS API server | http://localhost:3000/health |
| MongoDB | 27017 | Primary database | Internal health check |
| Redis | 6379 | Cache & sessions | Internal health check |
| Nginx | 80/443 | Load balancer (prod) | http://localhost/health |

## 🛠️ Development Commands

### Service Initialization
```bash
# Create new services quickly and integrate them into Docker infrastructure

# Create a new NestJS backend
yarn init:backend user-service --port 3001 --database --auth

# Create a new React frontend
yarn init:frontend admin-dashboard --port 5174

# Create a microservice
yarn init:microservice notification-service --port 3002

# Create a worker service
yarn init:worker email-worker

# Get help with service creation
yarn service:help
```

### Docker Management
```bash
# Start development environment
yarn dev
yarn start

# Stop all services
yarn stop

# View logs (all or specific service)
yarn logs
yarn docker:logs backend

# Check service status
yarn docker:status

# Rebuild services
yarn docker:rebuild
yarn docker:rebuild frontend

# Access container shell
yarn docker:shell backend
yarn docker:shell mongodb

# Clean up Docker resources
yarn docker:cleanup

# Reset database (⚠️ DATA LOSS)
./scripts/docker-dev.sh reset-db
```

### Application-Specific
```bash
# Frontend development (in apps/frontend)
cd apps/frontend
yarn dev
yarn build
yarn preview

# Backend development (in apps/backend)
cd apps/backend
yarn start:dev
yarn build
yarn test
```

## 🔧 Configuration

### Environment Variables

The application uses environment variables for configuration. Copy the template and customize:

```bash
cp config/environment.example .env
```

Key variables:
- `MONGODB_USERNAME/PASSWORD`: Database credentials
- `JWT_SECRET`: Authentication secret
- `FRONTEND_URL`: Frontend application URL
- `API_KEY`: External service API key

### Database Initialization

MongoDB is automatically initialized with:
- Database schemas and validation
- Optimized indexes
- Sample data for development
- Proper user permissions

## 🏢 Project Structure

```
procurement-platform/
├── apps/
│   ├── frontend/           # React frontend application
│   │   ├── src/
│   │   ├── Dockerfile      # Production build
│   │   ├── Dockerfile.dev  # Development build
│   │   └── nginx.conf      # Nginx configuration
│   └── backend/            # NestJS backend application
│       ├── src/
│       ├── Dockerfile      # Production build
│       └── Dockerfile.dev  # Development build
├── config/
│   ├── mongo-init.js       # MongoDB initialization
│   ├── nginx.conf          # Production Nginx config
│   └── environment.example # Environment template
├── scripts/
│   ├── docker-dev.sh       # Docker helper script
│   └── ticket-cli.js       # Project management
├── docker-compose.yml      # Development configuration
├── docker-compose.prod.yml # Production configuration
├── DOCKER.md              # Comprehensive Docker guide
└── README.md              # This file
```

## 🔍 Features

### Frontend Features
- ✅ Modern React 19 with hooks
- ✅ TypeScript for type safety
- ✅ Material-UI component library
- ✅ Responsive design
- ✅ State management with Zustand
- ✅ Data fetching with SWR
- ✅ Client-side routing
- ✅ Hot module reloading

### Backend Features
- ✅ NestJS framework with TypeScript
- ✅ MongoDB with Mongoose ODM
- ✅ Redis caching
- ✅ Swagger API documentation
- ✅ Input validation and transformation
- ✅ Health check endpoints
- ✅ CORS configuration
- ✅ Error handling

### DevOps Features
- ✅ Complete Docker containerization
- ✅ Multi-stage optimized builds
- ✅ Development hot reloading
- ✅ Production load balancing
- ✅ Health monitoring
- ✅ Non-root container security
- ✅ Persistent data volumes
- ✅ Network isolation
- ✅ **Service Initialization System** - Quickly scaffold new services
- ✅ **Automatic Docker Integration** - New services auto-added to compose files

## 🚦 Monitoring & Health

### Health Checks

All services include health checks:
- **Frontend**: HTTP GET to main page
- **Backend**: Custom health endpoint
- **MongoDB**: Database ping
- **Redis**: Redis ping

### Logging

View logs for debugging:
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend

# With timestamps
docker-compose logs -t
```

### Performance Monitoring

```bash
# Container resource usage
docker stats

# Service status
docker-compose ps

# Detailed health information
./scripts/docker-dev.sh status
```

## 🔐 Security

### Container Security
- Non-root users in all containers
- Multi-stage builds for minimal attack surface
- Resource limits configured
- Network isolation between services

### Application Security
- Input validation on all endpoints
- CORS properly configured
- JWT authentication
- Environment variable secrets
- SQL injection prevention

### Network Security
- Internal Docker networks
- Exposed ports minimized
- Nginx security headers
- Rate limiting configured

## 📈 Performance

### Development Optimizations
- Hot reloading for fast development
- Volume mounts for instant file changes
- Optimized Docker layer caching
- Parallel service startup

### Production Optimizations
- Multi-stage builds for smaller images
- Nginx load balancing
- Redis caching layer
- Database query optimization
- Static asset caching

## 🛡️ Troubleshooting

### Common Issues

1. **Port conflicts**:
   ```bash
   # Check what's using the port
   lsof -i :3000
   ```

2. **Database connection issues**:
   ```bash
   # Check MongoDB health
   docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"
   ```

3. **Build failures**:
   ```bash
   # Clean rebuild
   docker-compose down
   docker-compose build --no-cache
   docker-compose up -d
   ```

4. **Permission issues**:
   ```bash
   # Reset file permissions
   sudo chown -R $USER:$USER .
   ```

### Getting Help

- Check the [Docker documentation](./DOCKER.md) for detailed Docker instructions
- View service logs: `yarn logs`
- Check service health: `yarn docker:status`
- Reset environment: `./scripts/docker-dev.sh reset-db` (⚠️ Data loss)

## 🎯 Next Steps

### Development Roadmap
- [ ] Authentication and authorization
- [ ] User management system
- [ ] Procurement order management
- [ ] Waste analytics dashboard
- [ ] AI decision engine integration
- [ ] Vendor integration APIs
- [ ] Real-time notifications
- [ ] Mobile application

### Infrastructure Enhancements
- [ ] Kubernetes deployment
- [ ] CI/CD pipeline setup
- [ ] Monitoring and alerting
- [ ] SSL/TLS configuration
- [ ] Database clustering
- [ ] CDN integration
- [ ] Backup automation

## 📄 Documentation

- [Service Initialization Guide](./SERVICE_INIT.md) - Complete guide to creating new services
- [Docker Setup Guide](./DOCKER.md) - Comprehensive Docker documentation
- [Frontend README](./apps/frontend/README.md) - Frontend-specific documentation
- [Backend API Docs](http://localhost:3000/api/docs) - Interactive API documentation (when running)

## 🤝 Contributing

1. Follow the Git workflow rules
2. Use the ticket system for project management
3. Ensure all Docker health checks pass
4. Add tests for new features
5. Update documentation as needed

## 📝 License

This project is licensed under the MIT License.

---

**Ready to start developing?** Run `yarn dev` and visit http://localhost:5173! 🎉
