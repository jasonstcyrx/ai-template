#!/bin/bash

# Docker Development Environment Helper Script
# This script provides convenient commands for managing the development environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to start development environment
start_dev() {
    print_status "Starting development environment..."
    check_docker
    
    if [ ! -f ".env" ]; then
        print_warning ".env file not found. Creating from template..."
        cp config/environment.example .env
        print_warning "Please edit .env file with your configuration before continuing."
        exit 1
    fi
    
    docker-compose up -d
    
    print_success "Development environment started!"
    print_status "Services are starting up. This may take a few minutes..."
    
    # Wait for services to be healthy
    print_status "Waiting for services to be ready..."
    sleep 10
    
    echo ""
    echo "🌐 Access URLs:"
    echo "   Frontend:     http://localhost:5173"
    echo "   Backend API:  http://localhost:3000"
    echo "   API Docs:     http://localhost:3000/api/docs"
    echo "   MongoDB:      mongodb://localhost:27017"
    echo ""
}

# Function to stop development environment
stop_dev() {
    print_status "Stopping development environment..."
    docker-compose down
    print_success "Development environment stopped!"
}

# Function to restart services
restart_dev() {
    print_status "Restarting development environment..."
    docker-compose restart
    print_success "Development environment restarted!"
}

# Function to view logs
logs_dev() {
    if [ -z "$1" ]; then
        print_status "Showing all service logs..."
        docker-compose logs -f
    else
        print_status "Showing logs for $1..."
        docker-compose logs -f "$1"
    fi
}

# Function to check service status
status_dev() {
    print_status "Service status:"
    docker-compose ps
    
    echo ""
    print_status "Service health:"
    for service in frontend backend mongodb redis; do
        if docker-compose ps -q "$service" >/dev/null 2>&1; then
            container_id=$(docker-compose ps -q "$service")
            if [ -n "$container_id" ]; then
                health=$(docker inspect "$container_id" --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}no healthcheck{{end}}' 2>/dev/null || echo "not running")
                echo "   $service: $health"
            fi
        fi
    done
}

# Function to rebuild services
rebuild_dev() {
    print_status "Rebuilding development environment..."
    if [ -n "$1" ]; then
        print_status "Rebuilding service: $1"
        docker-compose build --no-cache "$1"
        docker-compose up -d "$1"
    else
        docker-compose down
        docker-compose build --no-cache
        docker-compose up -d
    fi
    print_success "Rebuild complete!"
}

# Function to clean up Docker resources
cleanup_dev() {
    print_warning "This will remove all stopped containers, unused networks, and build cache."
    read -p "Are you sure? (y/N): " confirm
    
    if [[ $confirm =~ ^[Yy]$ ]]; then
        print_status "Cleaning up Docker resources..."
        docker-compose down
        docker system prune -f
        print_success "Cleanup complete!"
    else
        print_status "Cleanup cancelled."
    fi
}

# Function to reset database (WARNING: DATA LOSS)
reset_db() {
    print_error "WARNING: This will delete all database data!"
    read -p "Are you sure you want to reset the database? (y/N): " confirm
    
    if [[ $confirm =~ ^[Yy]$ ]]; then
        print_status "Resetting database..."
        docker-compose down
        docker volume rm $(docker volume ls -q | grep mongodb) 2>/dev/null || true
        docker volume rm $(docker volume ls -q | grep redis) 2>/dev/null || true
        docker-compose up -d
        print_success "Database reset complete!"
    else
        print_status "Database reset cancelled."
    fi
}

# Function to access container shell
shell_dev() {
    if [ -z "$1" ]; then
        print_error "Please specify a service name (frontend, backend, mongodb, redis)"
        exit 1
    fi
    
    print_status "Accessing $1 container shell..."
    case "$1" in
        "mongodb")
            docker-compose exec mongodb mongosh -u admin -p procurement_password procurement_db
            ;;
        "redis")
            docker-compose exec redis redis-cli
            ;;
        *)
            docker-compose exec "$1" sh
            ;;
    esac
}

# Function to show help
show_help() {
    echo "Docker Development Environment Helper"
    echo ""
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  start              Start the development environment"
    echo "  stop               Stop the development environment"
    echo "  restart            Restart all services"
    echo "  status             Show service status and health"
    echo "  logs [service]     Show logs (all services or specific service)"
    echo "  rebuild [service]  Rebuild and restart (all services or specific service)"
    echo "  shell <service>    Access service container shell"
    echo "  cleanup            Clean up Docker resources"
    echo "  reset-db           Reset database (WARNING: DATA LOSS)"
    echo "  help               Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start           # Start all services"
    echo "  $0 logs backend    # Show backend logs"
    echo "  $0 rebuild frontend # Rebuild only frontend"
    echo "  $0 shell backend   # Access backend container"
    echo ""
}

# Main script logic
case "$1" in
    "start")
        start_dev
        ;;
    "stop")
        stop_dev
        ;;
    "restart")
        restart_dev
        ;;
    "logs")
        logs_dev "$2"
        ;;
    "status")
        status_dev
        ;;
    "rebuild")
        rebuild_dev "$2"
        ;;
    "cleanup")
        cleanup_dev
        ;;
    "reset-db")
        reset_db
        ;;
    "shell")
        shell_dev "$2"
        ;;
    "help"|"--help"|"-h")
        show_help
        ;;
    "")
        print_error "No command specified."
        show_help
        exit 1
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac 