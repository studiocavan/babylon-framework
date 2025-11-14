# Redis Caching Service

A lightweight Go-based caching service that provides HTTP endpoints for Redis cache operations.

## Features

- RESTful API for cache operations (GET, SET, DELETE)
- Redis connection with configurable TTL (Time To Live)
- Health check endpoint with Redis connection status
- CORS support for cross-origin requests
- Request logging middleware
- Containerized deployment with Docker

## Prerequisites

- Go 1.21 or higher
- Redis server (local or remote)
- Docker (optional, for containerized deployment)

## Environment Variables

Configure the service using these environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `REDIS_HOST` | Redis server hostname | `localhost` |
| `REDIS_PORT` | Redis server port | `6379` |
| `REDIS_PASSWORD` | Redis password (if required) | `` |
| `PORT` | HTTP server port | `8080` |

## Installation

### Local Development

1. Clone or download this template

2. Install dependencies:
```bash
go mod download
```

3. Run the service:
```bash
go run main.go
```

### Docker Deployment

1. Build the Docker image:
```bash
docker build -t redis-cache-service .
```

2. Run with Docker Compose (with Redis):
```bash
# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

  cache-service:
    build: .
    ports:
      - "8080:8080"
    environment:
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - PORT=8080
    depends_on:
      - redis

volumes:
  redis-data:
EOF

docker-compose up
```

## API Endpoints

### Health Check

Check the service and Redis connection status.

```bash
GET /api/health
```

Response:
```json
{
  "status": "ok",
  "redis": "connected"
}
```

### Set Cache Item

Store a value in the cache with an optional TTL.

```bash
POST /api/cache/set
Content-Type: application/json

{
  "key": "user:123",
  "value": "John Doe",
  "ttl": 3600
}
```

Parameters:
- `key` (required): Cache key
- `value` (required): Value to store
- `ttl` (optional): Time to live in seconds (0 = no expiration)

Response:
```json
{
  "success": true,
  "message": "Cache item set successfully"
}
```

### Get Cache Item

Retrieve a value from the cache.

```bash
GET /api/cache/get?key=user:123
```

Response (success):
```json
{
  "success": true,
  "message": "Cache item retrieved successfully",
  "data": "John Doe"
}
```

Response (not found):
```json
{
  "success": false,
  "message": "Key not found"
}
```

### Delete Cache Item

Remove a value from the cache.

```bash
DELETE /api/cache/delete?key=user:123
```

Response:
```json
{
  "success": true,
  "message": "Cache item deleted successfully"
}
```

## Usage Examples

### Using cURL

```bash
# Set a cache item with 1-hour TTL
curl -X POST http://localhost:8080/api/cache/set \
  -H "Content-Type: application/json" \
  -d '{"key":"session:abc123","value":"user-data","ttl":3600}'

# Get a cache item
curl http://localhost:8080/api/cache/get?key=session:abc123

# Delete a cache item
curl -X DELETE http://localhost:8080/api/cache/delete?key=session:abc123

# Check health
curl http://localhost:8080/api/health
```

### Using JavaScript/Fetch

```javascript
// Set cache item
await fetch('http://localhost:8080/api/cache/set', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    key: 'product:456',
    value: JSON.stringify({ name: 'Widget', price: 29.99 }),
    ttl: 7200
  })
});

// Get cache item
const response = await fetch('http://localhost:8080/api/cache/get?key=product:456');
const data = await response.json();
console.log(data.data);
```

## Common Use Cases

1. **Session Storage**: Store user session data with TTL
2. **API Response Caching**: Cache frequently accessed API responses
3. **Rate Limiting**: Track API request counts per user/IP
4. **Temporary Data Storage**: Store temporary data that expires automatically

## Performance Considerations

- Redis connections are reused across requests
- Use appropriate TTL values to prevent memory bloat
- Monitor Redis memory usage in production
- Consider implementing connection pooling for high-traffic scenarios

## Error Handling

The service includes comprehensive error handling:
- Invalid request bodies return 400 Bad Request
- Missing keys return 404 Not Found
- Redis connection errors return 500 Internal Server Error
- All responses include descriptive error messages

## Production Deployment

For production environments:

1. Set strong `REDIS_PASSWORD`
2. Use connection pooling
3. Implement rate limiting
4. Add authentication/authorization
5. Enable Redis persistence (RDB/AOF)
6. Monitor with Prometheus/Grafana
7. Use Redis Sentinel or Cluster for high availability

## License

This template is part of the Babylon Framework and is provided as-is for project scaffolding.
