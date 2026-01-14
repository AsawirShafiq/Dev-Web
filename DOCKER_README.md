# GroceryStore - Docker Setup Guide

This project has been containerized with Docker and Docker Compose. It consists of three main services:

1. **MongoDB** - Database service
2. **Backend (FastAPI)** - API server
3. **Frontend (React)** - Web application

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 1.29 or higher)

## Quick Start

### 1. Clone/Navigate to the project
```bash
cd /home/asawir-shafiq-khokhar/Desktop/Asawir/Programs/Dev-Web
```

### 2. Build and Start All Services
```bash
docker-compose up --build
```

This command will:
- Build the backend and frontend images
- Create and start all three containers (MongoDB, Backend, Frontend)
- Set up the network and volumes
- Display logs from all services

### 3. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **MongoDB**: localhost:27017 (internal, not exposed directly)

## Available Docker Compose Commands

### Start services in the background
```bash
docker-compose up -d
```

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### Stop services
```bash
docker-compose stop
```

### Stop and remove containers
```bash
docker-compose down
```

### Remove all data (including database)
```bash
docker-compose down -v
```

### Rebuild images
```bash
docker-compose build --no-cache
```

### Execute command in running container
```bash
# Backend
docker-compose exec backend /bin/bash

# Frontend
docker-compose exec frontend /bin/bash

# MongoDB
docker-compose exec mongodb mongosh -u admin -p password123
```

## Service Details

### MongoDB
- **Image**: mongo:6.0
- **Port**: 27017
- **Username**: admin
- **Password**: password123
- **Database**: grocery_db
- **Volume**: Persists data in `mongodb_data` volume

### Backend (FastAPI)
- **Port**: 8000
- **Base Image**: python:3.11-slim
- **Hot Reload**: Enabled (changes reflect automatically)
- **Volume**: Mounts source code for development

### Frontend (React)
- **Port**: 5173
- **Base Image**: node:18-alpine
- **Build Tool**: Vite
- **Volume**: Mounts src directory for development

## Environment Variables

Configuration is handled in `docker-compose.yml`. To customize, edit the `environment` sections:

- **Backend**: MongoDB connection string, JWT secret, token expiration
- **Frontend**: API URL for backend communication
- **MongoDB**: Root credentials and database name

For production, create a `.env` file or update values in `docker-compose.yml`

## Troubleshooting

### Port already in use
If ports 5173, 8000, or 27017 are already in use:
```bash
# Edit docker-compose.yml and change the port mappings
# Example: "8001:8000" maps container port 8000 to host port 8001
```

### MongoDB connection failed
```bash
# Restart MongoDB service
docker-compose restart mongodb

# Check MongoDB logs
docker-compose logs mongodb
```

### Frontend can't reach backend
- Ensure backend is running: `docker-compose logs backend`
- Check the API URL in frontend environment variables
- Verify services are on the same network

### Clear cache and rebuild
```bash
docker-compose down -v
docker system prune -a
docker-compose up --build
```

## Network Communication

Services communicate internally using service names:
- Backend can access MongoDB at: `mongodb://admin:password123@mongodb:27017/grocery_db`
- Frontend can access Backend at: `http://backend:8000` (internal) or `http://localhost:8000` (external)

## Production Deployment

For production:

1. Update environment variables in `docker-compose.yml`:
   - Change `SECRET_KEY` to a secure random value
   - Use a strong MongoDB password
   - Update API URLs for your domain

2. Disable hot reload:
   - Remove `--reload` flag from backend command in docker-compose.yml

3. Use environment files:
   ```bash
   docker-compose --env-file .env.production up -d
   ```

4. Consider using a reverse proxy (Nginx) for production

## Docker Files Included

- `grocery_backend/Dockerfile` - Backend container configuration
- `grocery-frontend/Dockerfile` - Frontend container configuration (multi-stage build)
- `docker-compose.yml` - Orchestration configuration
- `.dockerignore` (backend & frontend) - Files to exclude from Docker build

## Useful Docker Commands

```bash
# View running containers
docker ps

# View all containers
docker ps -a

# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune

# View container logs with timestamps
docker-compose logs --timestamps
```

## Next Steps

1. Start all services: `docker-compose up -d`
2. Wait for MongoDB health check to pass (check logs)
3. Access frontend at http://localhost:5173
4. Create an account and start using the application!

For more information on Docker and Docker Compose, visit:
- https://docs.docker.com/
- https://docs.docker.com/compose/
