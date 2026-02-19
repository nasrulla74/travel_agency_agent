#!/bin/bash

# TravelAgent Deployment Script
# Run this on your server to deploy the application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="travelagent"
COMPOSE_FILE="docker-compose.prod.yml"
REGISTRY="ghcr.io/nasrulla74"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  TravelAgent Deployment Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then
  echo -e "${YELLOW}Warning: Running as root. Consider using a non-root user with docker privileges.${NC}"
fi

# Check if docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Error: docker-compose is not installed${NC}"
    exit 1
fi

# Navigate to script directory
cd "$(dirname "$0")"

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found${NC}"
    echo -e "${YELLOW}Please create .env file from .env.example${NC}"
    exit 1
fi

echo -e "${BLUE}Step 1: Pulling latest images...${NC}"
docker pull ${REGISTRY}/travel_agency_agent-backend:latest
docker pull ${REGISTRY}/travel_agency_agent-frontend:latest
echo -e "${GREEN}✓ Images pulled successfully${NC}"
echo ""

echo -e "${BLUE}Step 2: Stopping existing containers...${NC}"
docker-compose -f ${COMPOSE_FILE} down --remove-orphans || true
echo -e "${GREEN}✓ Containers stopped${NC}"
echo ""

echo -e "${BLUE}Step 3: Starting new containers...${NC}"
docker-compose -f ${COMPOSE_FILE} up -d
echo -e "${GREEN}✓ Containers started${NC}"
echo ""

echo -e "${BLUE}Step 4: Waiting for services to be healthy...${NC}"
sleep 10

# Check if backend is healthy
if docker ps | grep -q "travelagent-backend"; then
    echo -e "${GREEN}✓ Backend container is running${NC}"
else
    echo -e "${RED}✗ Backend container failed to start${NC}"
    docker-compose -f ${COMPOSE_FILE} logs backend
    exit 1
fi

# Check if frontend is healthy
if docker ps | grep -q "travelagent-frontend"; then
    echo -e "${GREEN}✓ Frontend container is running${NC}"
else
    echo -e "${RED}✗ Frontend container failed to start${NC}"
    docker-compose -f ${COMPOSE_FILE} logs frontend
    exit 1
fi
echo ""

echo -e "${BLUE}Step 5: Cleaning up old images...${NC}"
docker image prune -af --filter "until=168h" || true
echo -e "${GREEN}✓ Cleanup complete${NC}"
echo ""

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "Application is running at: ${GREEN}https://travelagent.appeul.com${NC}"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo "  View logs:        docker-compose -f ${COMPOSE_FILE} logs -f"
echo "  Backend logs:     docker-compose -f ${COMPOSE_FILE} logs -f backend"
echo "  Frontend logs:    docker-compose -f ${COMPOSE_FILE} logs -f frontend"
echo "  Restart:          docker-compose -f ${COMPOSE_FILE} restart"
echo "  Stop:             docker-compose -f ${COMPOSE_FILE} down"
echo ""
