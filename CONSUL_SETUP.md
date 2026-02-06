# Consul Configuration Setup

This document explains how to set up Consul KV store for the device-checking application.

## Consul KV Structure

The application expects configuration values in the following path structure:

```
device-checking/config/MONGODB_URI
```

## Setup Instructions

### 1. Using Consul CLI

If you have access to the `consul` CLI:

```bash
# Set the MongoDB URI
consul kv put device-checking/config/MONGODB_URI "mongodb://your-mongodb-host:27017/device-checking"
```

### 2. Using Consul HTTP API

You can use `curl` or any HTTP client:

```bash
# Set the MongoDB URI
curl -X PUT \
  http://localhost:8500/v1/kv/device-checking/config/MONGODB_URI \
  -d "mongodb://your-mongodb-host:27017/device-checking"
```

### 3. Using Consul UI

1. Open Consul UI at `http://localhost:8500` (or your Consul URL)
2. Navigate to **KV** → **Create Key**
3. Enter the key path: `device-checking/config/MONGODB_URI`
4. Enter the value: your MongoDB connection string
5. Click **Save**

## Configuration Values

### Required

- **`device-checking/config/MONGODB_URI`**: MongoDB connection string
  - Example: `mongodb://mongodb:27017/device-checking`
  - Example (with auth): `mongodb://username:password@mongodb:27017/device-checking`

### Optional (for future use)

You can add more configuration keys following the same pattern:
- `device-checking/config/API_KEY`
- `device-checking/config/SECRET_KEY`
- etc.

## Fallback Behavior

The application uses a fallback strategy:
1. **Primary**: Try to fetch from Consul KV store
2. **Fallback**: Use environment variable `MONGODB_URI` if Consul is unavailable
3. **Error**: Throw error if neither source provides the value

## Testing the Configuration

### Verify Consul Connection

Check if your application can reach Consul:

```bash
# From the Docker container
docker exec device-checking-app wget -qO- http://consul:8500/v1/status/leader

# Or check logs
docker logs device-checking-app
```

### View Application Logs

The application logs will show:
- ✅ "✅ Consul is accessible" - if Consul is reachable
- 📡 "📡 Fetching configuration from Consul..." - when fetching config
- ✅ "✅ Fetched MONGODB_URI from Consul" - when successfully retrieved
- 📋 "📋 Using MONGODB_URI from environment variable" - when using fallback

## Environment Variables

### Consul Configuration

- **`CONSUL_HOST`**: Consul host (default: `consul`)
- **`CONSUL_PORT`**: Consul port (default: `8500`)
- **`CONSUL_TOKEN`**: Consul ACL token (if using ACLs)

These are set in `docker-compose.yml` and can be overridden.

### MongoDB Configuration

- **`MONGODB_URI`**: Fallback MongoDB connection string
  - Only used if Consul is unavailable
  - Example: `mongodb://mongodb:27017/device-checking`

## Troubleshooting

### Application fails to start with "MONGODB_URI not found"

**Possible causes:**
1. Consul container is not running
2. Consul is on a different network
3. KV key is not set in Consul

**Solutions:**
```bash
# Check if Consul is running
docker ps | grep consul

# Check if containers are on the same network
docker network inspect staging-local

# Verify the KV key exists
consul kv get device-checking/config/MONGODB_URI
```

### Consul connection errors in logs

**Possible causes:**
1. Consul host/port is incorrect
2. Network connectivity issue
3. Consul container is not accessible

**Solutions:**
- Verify `CONSUL_HOST` and `CONSUL_PORT` in `docker-compose.yml`
- Check that both containers are on the `staging-local` network
- Test connectivity: `docker exec device-checking-app ping consul`

### Application uses environment variable instead of Consul

This is expected behavior if Consul is unavailable. Check the application logs for:
- `⚠️ Consul is not accessible, will use environment variables`

## Security Notes

- **Never commit** `.env.local` with sensitive data to version control
- Use Consul KV for storing sensitive configuration like passwords, API keys, and connection strings
- Consider enabling Consul ACLs for production environments
- Rotate secrets regularly

## Example: Complete Setup Flow

```bash
# 1. Ensure Consul is running on the staging-local network
docker network connect staging-local consul

# 2. Set the MongoDB URI in Consul
consul kv put device-checking/config/MONGODB_URI "mongodb://mongodb:27017/device-checking"

# 3. Build and start the application
docker-compose up -d --build

# 4. Check logs to verify Consul connection
docker logs -f device-checking-app

# 5. Verify the application is running
curl http://localhost:3000
```

## Additional Resources

- [Consul KV Documentation](https://developer.hashicorp.com/consul/docs/dynamic-config/kv)
- [Consul HTTP API](https://developer.hashicorp.com/consul/api-docs/kv)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)