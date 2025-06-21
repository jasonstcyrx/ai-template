# Docker Configuration Guide

## Overview

This project is fully containerized using Docker and Docker Compose. The platform consists of multiple services that work together to provide the autonomous procurement and waste intelligence system.

## Architecture

### Services Overview

1. **Frontend** - React application with Vite (Port: 5173/80)
2. **Backend** - NestJS API server (Port: 3000)
3. **MongoDB** - Primary database (Port: 27017)
4. **Redis** - Caching and session storage (Port: 6379)
5. **Nginx** - Load balancer and reverse proxy (Production only)

### Network Architecture

All services communicate through a custom Docker network (`procurement-network`) with proper service discovery and health checks.

## Quick Start

### Development Environment

1. **Clone and Setup**:
   ```bash
   git clone <repository-url>
   cd procurement-platform
   ```

2. **Environment Configuration**:
   ```bash
   cp config/environment.example .env
   # Edit .env with your configuration
   ```

3. **Start All Services**:
   ```bash
   docker-compose up -d
   ```

4. **Access Applications**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - API Documentation: http://localhost:3000/api/docs
   - MongoDB: localhost:27017

### Production Environment

1. **Environment Setup**:
   ```bash
   cp config/environment.example .env.production
   # Configure production values in .env.production
   ```

2. **Deploy Production Stack**:
   ```bash
   docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
   ```

3. **Access Applications**:
   - Application: http://localhost (Port 80)
   - HTTPS: http://localhost:443 (when SSL configured)

## Service Details

### Frontend Service

**Development Image**: `Dockerfile.dev`
- Hot reloading enabled
- Volume mounts for live development
- Exposes port 5173

**Production Image**: `Dockerfile`
- Multi-stage build for optimization
- Nginx serving static files
- Exposes port 80

### Backend Service

**Development Image**: `Dockerfile.dev`
- Hot reloading with nodemon
- Volume mounts for live development
- Debug capabilities enabled

**Production Image**: `Dockerfile`
- Multi-stage build
- Optimized Node.js production image
- Non-root user for security

### Database Services

**MongoDB**:
- Persistent data volumes
- Automated initialization script
- Health checks configured
- Optimized indexes for performance

**Redis**:
- Persistent storage for cache
- Memory optimization settings
- Health monitoring

## Environment Variables

### Required Variables

```bash
# Database
MONGODB_USERNAME=admin
MONGODB_PASSWORD=strong_password_here
MONGODB_DATABASE=procurement_db

# Security
JWT_SECRET=your_jwt_secret_256_bit_key
API_KEY=your_external_api_key

# URLs
FRONTEND_URL=http://localhost:5173
```

### Optional Variables

```bash
# Feature Flags
ENABLE_AI_DECISIONS=true
ENABLE_ANALYTICS=true

# External Services
STRIPE_SECRET_KEY=sk_test_...
SENDGRID_API_KEY=SG...

# Monitoring
SENTRY_DSN=https://...
LOG_LEVEL=info
```

## Development Workflow

### Starting Development Environment

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Start specific service
docker-compose up frontend backend

# Rebuild after changes
docker-compose up --build
```

### Development Commands

```bash
# Access backend container
docker-compose exec backend sh

# Access database
docker-compose exec mongodb mongosh -u admin -p procurement_password

# View service status
docker-compose ps

# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ DATA LOSS)
docker-compose down -v
```

### Hot Reloading

Both frontend and backend support hot reloading in development:

- **Frontend**: Vite dev server with HMR
- **Backend**: NestJS watch mode with nodemon

Changes to source code are automatically reflected without container restarts.

## Production Deployment

### Security Considerations

1. **Environment Variables**:
   - Use strong passwords and secrets
   - Never commit `.env` files to version control
   - Rotate secrets regularly

2. **Network Security**:
   - Use internal networks for service communication
   - Expose only necessary ports
   - Implement proper firewall rules

3. **Container Security**:
   - Non-root users in all containers
   - Regular security updates
   - Resource limits configured

### SSL/TLS Configuration

1. **Obtain SSL Certificates**:
   ```bash
   # Using Let's Encrypt (example)
   certbot certonly --standalone -d yourdomain.com
   ```

2. **Configure Nginx**:
   ```bash
   # Copy certificates to certs directory
   mkdir -p certs
   cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem certs/cert.pem
   cp /etc/letsencrypt/live/yourdomain.com/privkey.pem certs/key.pem
   ```

3. **Update Nginx Configuration**:
   Uncomment HTTPS server block in `config/nginx.conf`

### Production Optimizations

**Resource Limits**:
```yaml
deploy:
  resources:
    limits:
      memory: 1G
      cpus: '0.5'
    reservations:
      memory: 512M
      cpus: '0.25'
```

**Health Checks**:
All services include comprehensive health checks with appropriate timeouts and retry logic.

**Load Balancing**:
Nginx is configured for load balancing with multiple backend instances.

## Monitoring and Logging

### Health Monitoring

```bash
# Check service health
docker-compose ps
docker inspect $(docker-compose ps -q) --format='{{.Name}}: {{.State.Health.Status}}'

# View health check logs
docker inspect <container_name> | jq '.[0].State.Health'
```

### Log Management

```bash
# View all logs
docker-compose logs

# Follow specific service logs
docker-compose logs -f backend

# View logs with timestamps
docker-compose logs -t

# Limit log output
docker-compose logs --tail=100
```

### Performance Monitoring

Monitor resource usage:
```bash
# Container stats
docker stats

# Compose services stats
docker-compose top
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**:
   ```bash
   # Find process using port
   lsof -i :3000
   # Kill process or change port in docker-compose.yml
   ```

2. **Database Connection Failed**:
   ```bash
   # Check MongoDB health
   docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"
   
   # Verify connection string
   docker-compose logs backend | grep -i mongo
   ```

3. **Frontend Not Loading**:
   ```bash
   # Check frontend logs
   docker-compose logs frontend
   
   # Verify API connectivity
   curl http://localhost:3000/health
   ```

4. **Build Failures**:
   ```bash
   # Clean build (removes cache)
   docker-compose build --no-cache
   
   # Remove all containers and rebuild
   docker-compose down && docker-compose up --build
   ```

### Performance Issues

1. **Slow Database Queries**:
   - Check MongoDB indexes
   - Monitor query performance
   - Review database logs

2. **High Memory Usage**:
   - Monitor container resource usage
   - Adjust memory limits
   - Optimize application code

3. **Network Latency**:
   - Check service discovery
   - Verify network configuration
   - Monitor inter-service communication

## Backup and Recovery

### Database Backup

```bash
# Create MongoDB backup
docker-compose exec mongodb mongodump --username admin --password procurement_password --authenticationDatabase admin --out /data/backup

# Copy backup from container
docker cp $(docker-compose ps -q mongodb):/data/backup ./mongodb-backup-$(date +%Y%m%d)
```

### Redis Backup

```bash
# Create Redis snapshot
docker-compose exec redis redis-cli BGSAVE

# Copy RDB file
docker cp $(docker-compose ps -q redis):/data/dump.rdb ./redis-backup-$(date +%Y%m%d).rdb
```

### Full System Backup

```bash
# Stop services
docker-compose down

# Backup volumes
docker run --rm -v procurement_mongodb_data:/source -v $(pwd):/backup alpine tar czf /backup/mongodb-$(date +%Y%m%d).tar.gz -C /source .
docker run --rm -v procurement_redis_data:/source -v $(pwd):/backup alpine tar czf /backup/redis-$(date +%Y%m%d).tar.gz -C /source .

# Restart services
docker-compose up -d
```

## Scaling

### Horizontal Scaling

1. **Backend Scaling**:
   ```bash
   # Scale backend service
   docker-compose up -d --scale backend=3
   ```

2. **Load Balancer Configuration**:
   Update `config/nginx.conf` to include additional backend instances.

3. **Database Scaling**:
   - MongoDB replica sets
   - Redis clustering
   - Read replicas

### Vertical Scaling

Adjust resource limits in `docker-compose.yml`:
```yaml
deploy:
  resources:
    limits:
      memory: 2G
      cpus: '1.0'
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to production
        run: |
          docker-compose -f docker-compose.prod.yml pull
          docker-compose -f docker-compose.prod.yml up -d
```

### Health Check Integration

Include health checks in deployment pipelines:
```bash
# Wait for services to be healthy
timeout 300 bash -c 'until docker-compose exec backend curl -f http://localhost:3000/health; do sleep 5; done'
```

## Security Best Practices

1. **Container Security**:
   - Use official base images
   - Keep images updated
   - Scan for vulnerabilities
   - Use non-root users

2. **Network Security**:
   - Isolate services in custom networks
   - Use secrets management
   - Implement proper CORS policies
   - Enable HTTPS in production

3. **Data Security**:
   - Encrypt data at rest
   - Use strong authentication
   - Regular security audits
   - Backup encryption

## Development Tips

1. **Debugging**:
   ```bash
   # Access running container
   docker-compose exec backend sh
   
   # Debug with Node.js inspector
   docker-compose exec backend node --inspect-brk=0.0.0.0:9229 dist/main.js
   ```

2. **Database Management**:
   ```bash
   # Access MongoDB shell
   docker-compose exec mongodb mongosh -u admin -p procurement_password procurement_db
   
   # Reset database
   docker-compose down -v
   docker-compose up -d
   ```

3. **Performance Profiling**:
   ```bash
   # Monitor resource usage
   docker stats
   
   # Profile specific container
   docker exec -it <container_id> top
   ```

## Support and Maintenance

### Regular Maintenance

1. **Update Dependencies**:
   - Rebuild images monthly
   - Update base images
   - Security patches

2. **Cleanup**:
   ```bash
   # Remove unused containers
   docker container prune
   
   # Remove unused images
   docker image prune
   
   # Remove unused volumes (⚠️ Be careful)
   docker volume prune
   ```

3. **Health Monitoring**:
   - Set up monitoring alerts
   - Regular health checks
   - Performance monitoring

For additional support, refer to the individual service documentation or create an issue in the project repository. 