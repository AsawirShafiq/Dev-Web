.PHONY: help build up down logs clean restart rebuild test

help:
	@echo "GroceryStore Docker Commands"
	@echo "=============================="
	@echo "make build          - Build Docker images"
	@echo "make up             - Start all services in background"
	@echo "make up-foreground  - Start all services in foreground (for logs)"
	@echo "make down           - Stop and remove all containers"
	@echo "make down-volumes   - Stop containers and remove volumes (WARNING: deletes data)"
	@echo "make logs           - View logs from all services"
	@echo "make logs-backend   - View backend logs"
	@echo "make logs-frontend  - View frontend logs"
	@echo "make logs-mongodb   - View MongoDB logs"
	@echo "make restart        - Restart all services"
	@echo "make restart-backend- Restart backend only"
	@echo "make clean          - Remove all containers, images, and volumes"
	@echo "make shell-backend  - Open shell in backend container"
	@echo "make shell-frontend - Open shell in frontend container"
	@echo "make shell-mongo    - Open MongoDB shell"
	@echo "make prod           - Start production environment"
	@echo "make prod-down      - Stop production environment"

build:
	docker-compose build

up:
	docker-compose up -d
	@echo "Services started! Access:"
	@echo "  Frontend: http://localhost:5173"
	@echo "  Backend:  http://localhost:8000"

up-foreground:
	docker-compose up

down:
	docker-compose down

down-volumes:
	docker-compose down -v
	@echo "WARNING: All data has been deleted!"

logs:
	docker-compose logs -f

logs-backend:
	docker-compose logs -f backend

logs-frontend:
	docker-compose logs -f frontend

logs-mongodb:
	docker-compose logs -f mongodb

restart:
	docker-compose restart

restart-backend:
	docker-compose restart backend

restart-frontend:
	docker-compose restart frontend

restart-mongodb:
	docker-compose restart mongodb

clean:
	docker-compose down -v
	docker system prune -a -f
	@echo "All Docker resources cleaned up!"

shell-backend:
	docker-compose exec backend /bin/bash

shell-frontend:
	docker-compose exec frontend /bin/sh

shell-mongo:
	docker-compose exec mongodb mongosh -u admin -p password123

test:
	@echo "Running tests..."
	docker-compose exec backend pytest

status:
	docker-compose ps

prod:
	docker-compose -f docker-compose.prod.yml up -d
	@echo "Production services started!"

prod-down:
	docker-compose -f docker-compose.prod.yml down

prod-logs:
	docker-compose -f docker-compose.prod.yml logs -f

rebuild:
	docker-compose down
	docker-compose build --no-cache
	docker-compose up -d

# Development-specific commands
dev-setup:
	@echo "Setting up development environment..."
	cp .env.example .env
	docker-compose up --build
	@echo "Development environment ready!"

# Health check
health:
	@echo "Checking service health..."
	docker-compose ps
	@echo ""
	@echo "Backend health: "
	curl -s http://localhost:8000/docs || echo "Not responding"
	@echo ""
	@echo "Frontend health:"
	curl -s http://localhost:5173 || echo "Not responding"
