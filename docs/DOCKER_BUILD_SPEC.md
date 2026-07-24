# Docker Build Specification

This document provides the complete Docker build specification for the device-checking application with Consul integration.

## Overview

The device-checking application is a full-stack Next.js application that:
- Runs as a production-ready Node.js server (not static files)
- Connects to MongoDB for data storage
- Fetches sensitive configuration from Consul KV store
- Provides API routes for data management

## Architecture

```
┌─────────────────────┐
│   Docker Container  │
│   device-checking   │
│                     │
│  ┌───────────────┐  │
│  │ Next.js App   │  │
│  │ (Port 3000)   │  │
│  └───────────────┘  │
│         ↓            │
│  ┌───────────────┐  │
│  │ MongoDB       │  │
│  │ Connection    │  │
│  └───────────────┘  │
│         ↓            │
│  ┌───────────────┐  │
│  │ Consul Client │  │
│  │ Fetch Config  │  │
│  └───────────────┘  │
└─────────┬───────────┘
          │
          │ Docker Network: staging-local
          │
    ┌─────┴─────┐
    │           │
┌───▼───┐   ┌──▼────────┐
│ Consul │   │  MongoDB  │
│ :8500  │   │ :27017    │
└───────┘   └───────────┘
```

## Key Components

### 1. Dockerfile

**Base Image**: `node:18-alpine`

**Multi-stage Build**:
- **Builder Stage**: Installs dependencies and builds the Next.js application
- **Runner Stage**: Contains only the minimal files needed to run the production server

**Key Features**:
- Uses Next.js standalone output for optimal image size
- Sets default Consul environment variables
- Exposes port 3000
- Runs with `node server.js` (Next.js production server)

**Why not nginx?**
- Your application has API routes (`/api/*`) that require server-side execution
- Next.js handles routing, server-side rendering, and API endpoints
- nginx would only serve static files and break all API functionality

### 2. docker-compose.yml

**Service Configuration**:
```yaml
services:
  app:
    build: .
    ports: ["3000:3000"]
    networks: [staging-local]
    environment:
      - CONSUL_HOST=consul
      - CONSUL_PORT=8500
```

**Network**: Connects to external `staging-local` network where Consul is running

**Health Check**: Monitors application health every 30 seconds

### 3. Consul Integration

**Configuration Service** (`src/lib/consul.ts`):
- Initializes Consul client connection
- Fetches configuration from KV store
- Implements caching to avoid repeated calls
- Provides fallback to environment variables

**Configuration Flow**:
1. Application starts
2. Consul client attempts to connect
3. Fetches `device-checking/config/MONGODB_URI` from Consul KV
4. Falls back to `MONGODB_URI` environment variable if Consul unavailable
5. Caches the configuration for subsequent requests

**MongoDB Integration** (`src/lib/mongodb.ts`):
- Uses Consul-fetched MongoDB URI for connection
- Maintains connection pool for performance
- Handles connection errors gracefully

### 4. Next.js Configuration

**Standalone Output** (`next.config.ts`):
```typescript
const nextConfig = {
  output: 'standalone'
};
```

**Benefits**:
- Smaller Docker image size
- Only includes necessary files
- Optimized for production deployment

## Build & Deployment

### Building the Docker Image

```bash
# Build using docker-compose
docker-compose build

# Or build directly
docker build -t device-checking:latest .
```

### Running the Application

```bash
# Start with docker-compose
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop the application
docker-compose down
```

### Environment Variables

**Consul Configuration** (set in docker-compose.yml):
- `CONSUL_HOST=consul` - Consul container hostname
- `CONSUL_PORT=8500` - Consul API port
- `CONSUL_TOKEN` - Optional ACL token

**Application Configuration** (from Consul KV):
- `device-checking/config/MONGODB_URI` - MongoDB connection string

**Optional Override** (for development/testing):
- `MONGODB_URI` - Fallback MongoDB URI (only used if Consul unavailable)

## Consul KV Setup

### Required Configuration

Set the MongoDB URI in Consul KV:

```bash
# Using Consul CLI
consul kv put device-checking/config/MONGODB_URI "mongodb://mongodb:27017/device-checking"

# Using HTTP API
curl -X PUT http://consul:8500/v1/kv/device-checking/config/MONGODB_URI \
  -d "mongodb://mongodb:27017/docker-checking"

# Using Consul UI
# Navigate to KV → Create Key
# Key: device-checking/config/MONGODB_URI
# Value: your MongoDB connection string
```

### Configuration Priority

1. **Consul KV** (primary source for sensitive data)
2. **Environment Variables** (fallback)
3. **Error** (if neither source provides the value)

## Troubleshooting

### Application won't start

**Check logs**:
```bash
docker logs device-checking-app
```

**Common issues**:
- Consul not accessible → Check network connectivity
- MongoDB URI not found → Verify KV key exists in Consul
- Port conflict → Ensure port 3000 is available

### Consul connection errors

**Verify Consul is running**:
```bash
docker ps | grep consul
```

**Check network**:
```bash
docker network inspect staging-local
```

**Test connectivity from app container**:
```bash
docker exec device-checking-app ping consul
```

### Application uses environment variable instead of Consul

This is expected behavior when Consul is unavailable. Check logs for:
- `⚠️ Consul is not accessible, will use environment variables`

## Security Best Practices

1. **Never commit** `.env.local` with sensitive data
2. **Use Consul KV** for all sensitive configuration
3. **Enable Consul ACLs** in production environments
4. **Rotate secrets** regularly
5. **Use secrets management** for Docker Swarm/Kubernetes deployments

## File Structure

```
device-checking/
├── dockerfile              # Docker image specification
├── docker-compose.yml      # Docker Compose configuration
├── .dockerignore          # Files to exclude from Docker build
├── next.config.ts         # Next.js standalone output config
├── src/
│   ├── lib/
│   │   ├── consul.ts      # Consul configuration service
│   │   └── mongodb.ts     # MongoDB connection (uses Consul)
│   └── app/
│       └── api/           # API routes (require server-side execution)
└── CONSUL_SETUP.md        # Consul setup documentation
```

## Why This Architecture?

### Full-Stack Next.js vs Static Site

Your application requires a server runtime because:
- **API Routes**: `/api/device-checks`, `/api/employees`, etc.
- **Server-Side Rendering**: Dynamic page generation
- **MongoDB Connections**: Server-side database access
- **Real-time Features**: WebSocket support for future enhancements

Static site generation with nginx would:
- ✅ Serve static HTML/CSS/JS files
- ❌ Break all API endpoints
- ❌ Prevent database connections
- ❌ Eliminate server-side functionality

### Consul Integration Benefits

- **Centralized Configuration**: Manage secrets in one place
- **Security**: Sensitive data not in code or environment files
- **Flexibility**: Update configuration without rebuilding images
- **Fallback**: Continues working if Consul is unavailable
- **Caching**: Efficient performance with minimal Consul calls

## Production Considerations

### Scaling

For production deployments:
- Use Docker Swarm or Kubernetes
- Implement horizontal pod autoscaling
- Add load balancer (traefik, nginx, etc.)
- Use persistent volumes for MongoDB

### Monitoring

- Implement health checks (already included in docker-compose.yml)
- Add application performance monitoring (APM)
- Set up log aggregation (ELK, Loki, etc.)
- Monitor Consul cluster health

### High Availability

- Run multiple instances of the application
- Configure MongoDB replica sets
- Use Consul clustering
- Implement backup strategies

## Resources

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Consul KV Store](https://developer.hashicorp.com/consul/docs/dynamic-config/kv)
- [MongoDB Docker Setup](https://hub.docker.com/_/mongo)

## Summary

This Docker build specification provides:
- ✅ Correct full-stack Next.js deployment
- ✅ Consul integration for sensitive configuration
- ✅ MongoDB connectivity
- ✅ Production-ready multi-stage build
- ✅ Proper networking with existing Consul infrastructure
- ✅ Fallback mechanisms for resilience
- ✅ Comprehensive documentation

The application is ready to be deployed using `docker-compose up -d` after setting up the MongoDB URI in Consul KV.