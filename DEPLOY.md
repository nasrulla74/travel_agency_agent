# TravelAgent Deployment Guide

Domain: **travelagent.appeul.com**

## Prerequisites

- Server with Docker and docker-compose installed
- Nginx Proxy Manager already running
- Existing PostgreSQL database container running
- External network `web-proxy` already created
- GitHub Container Registry access (images pushed to `ghcr.io/nasrulla74`)

## Server Setup

### 1. Create Application Directory

```bash
mkdir -p /opt/travelagent
cd /opt/travelagent
```

### 2. Copy Deployment Files

Copy these files from the repository to your server:
- `docker-compose.prod.yml`
- `deploy.sh`
- `.env.example` → rename to `.env`

```bash
git clone https://github.com/nasrulla74/travel_agency_agent.git temp && \
cp temp/docker-compose.prod.yml temp/deploy.sh temp/.env.example . && \
rm -rf temp
```

### 3. Configure Environment Variables

```bash
cp .env.example .env
nano .env
```

Fill in:
- `SECRET_KEY`: Generate with `openssl rand -hex 32`
- `OPENAI_API_KEY`: Your OpenAI API key
- `POSTGRES_PASSWORD`: Password for your existing PostgreSQL (if different from default)

### 4. Configure Nginx Proxy Manager

Access your Nginx Proxy Manager dashboard (usually at `http://your-server:81`) and add two proxy hosts:

#### Frontend Proxy Host
1. **Domain Names**: `travelagent.appeul.com`
2. **Forward Hostname/IP**: `travelagent-frontend` (or your server IP)
3. **Forward Port**: `3001`
4. **Cache Assets**: Enable
5. **Block Common Exploits**: Enable
6. **SSL Tab**:
   - SSL Certificate: Request a new SSL certificate
   - Force SSL: Enable
   - HTTP/2 Support: Enable
   - HSTS Enabled: Enable

#### Backend API Proxy Host
1. **Domain Names**: `travelagent.appeul.com`
2. Click **Advanced** tab
3. Add custom location:
   - **Location**: `/api/`
   - **Forward Hostname/IP**: `travelagent-backend` (or your server IP)
   - **Forward Port**: `8001`
   - Ensure this location is processed before the main location

Or use a sub-domain approach:
- **Domain Names**: `api.travelagent.appeul.com`
- **Forward Hostname/IP**: `travelagent-backend` (or your server IP)
- **Forward Port**: `8001`
- Then update frontend env to use `NEXT_PUBLIC_API_URL=https://api.travelagent.appeul.com`

## Deployment Commands

### Automatic Deployment (Recommended)

```bash
cd /opt/travelagent
chmod +x deploy.sh
./deploy.sh
```

### Manual Deployment

```bash
cd /opt/travelagent

# Pull latest images
docker pull ghcr.io/nasrulla74/travel_agency_agent-backend:latest
docker pull ghcr.io/nasrulla74/travel_agency_agent-frontend:latest

# Restart containers
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d

# Cleanup old images
docker image prune -af --filter "until=168h"
```

## Post-Deployment Verification

```bash
# Check running containers
docker ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Test endpoints (from server)
curl http://localhost:8001/health
curl http://localhost:3001
```

## Updating After Code Changes

1. Push code to GitHub (triggers automatic build)
2. Wait for GitHub Actions to complete
3. Run deployment script on server:

```bash
./deploy.sh
```

## Troubleshooting

### Container won't start
```bash
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs frontend
docker-compose -f docker-compose.prod.yml logs postgres
```

### Database connection issues
```bash
# Check if postgres is accessible
docker exec travelagent-postgres psql -U postgres -d travelagent -c "\dt"

# Check backend database connection
docker-compose -f docker-compose.prod.yml logs backend | grep -i database
```

### Reset everything (⚠️ WARNING: This will delete your database!)
```bash
docker-compose -f docker-compose.prod.yml down -v
docker volume rm common_postgres_data  # Only if you want to delete data
./deploy.sh
```

## Port Mapping

| Service | Container Port | Host Port | Accessible Via |
|---------|---------------|-----------|----------------|
| Frontend | 3000 | 3001 | NPM → travelagent.appeul.com |
| Backend | 8000 | 8001 | NPM → travelagent.appeul.com/api/ |
| PostgreSQL | 5432 | - | Internal network only |

## File Structure on Server

```
/opt/travelagent/
├── docker-compose.prod.yml
├── deploy.sh
├── .env
└── (PostgreSQL data in common_postgres_data volume)
```

## Useful Commands

| Command | Description |
|---------|-------------|
| `./deploy.sh` | Full deployment |
| `docker ps` | List running containers |
| `docker-compose -f docker-compose.prod.yml logs -f` | Follow all logs |
| `docker-compose -f docker-compose.prod.yml logs -f backend` | Backend logs |
| `docker-compose -f docker-compose.prod.yml logs -f frontend` | Frontend logs |
| `docker-compose -f docker-compose.prod.yml logs -f postgres` | Database logs |
| `docker-compose -f docker-compose.prod.yml down` | Stop containers |
| `docker-compose -f docker-compose.prod.yml restart` | Restart containers |
| `docker exec -it travelagent-postgres psql -U postgres -d travelagent` | Access database |

## Network Configuration

The containers use the external `web-proxy` network which should already be created by your existing setup:

```bash
# Verify network exists
docker network ls | grep web-proxy

# If it doesn't exist, create it (but it should exist from your previous setup)
docker network create web-proxy
```
