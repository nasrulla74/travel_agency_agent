# TravelAgent Deployment Guide

Domain: **travelagent.appeul.com**

## Prerequisites

- Server with Docker and docker-compose installed
- Nginx reverse proxy already running
- GitHub Container Registry access (images pushed to `ghcr.io/nasrulla74`)
- SSL certificate (via Let's Encrypt/certbot)

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

### 3. Configure Environment Variables

```bash
cp .env.example .env
nano .env
```

Fill in:
- `SECRET_KEY`: Generate with `openssl rand -hex 32`
- `OPENAI_API_KEY`: Your OpenAI API key

### 4. Setup Nginx Configuration

Copy `nginx/travelagent.conf` to your nginx sites directory:

```bash
# On your nginx server
sudo cp nginx/travelagent.conf /etc/nginx/sites-available/travelagent
sudo ln -s /etc/nginx/sites-available/travelagent /etc/nginx/sites-enabled/
```

### 5. Obtain SSL Certificate

```bash
sudo certbot --nginx -d travelagent.appeul.com
```

### 6. Test Nginx Configuration

```bash
sudo nginx -t
sudo systemctl reload nginx
```

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

# Test endpoints
curl http://localhost:8000/health
curl http://localhost:3000
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
```

### Reset everything
```bash
docker-compose -f docker-compose.prod.yml down -v
docker volume rm travelagent-db-data
./deploy.sh
```

### Check nginx logs
```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

## File Structure on Server

```
/opt/travelagent/
├── docker-compose.prod.yml
├── deploy.sh
├── .env
└── (database volume mounted at /app/data in container)
```

## Useful Commands

| Command | Description |
|---------|-------------|
| `./deploy.sh` | Full deployment |
| `docker ps` | List running containers |
| `docker-compose -f docker-compose.prod.yml logs -f` | Follow logs |
| `docker-compose -f docker-compose.prod.yml down` | Stop containers |
| `docker-compose -f docker-compose.prod.yml restart` | Restart containers |
