# Go Backend Template

A lightweight Go HTTP server backend template for the Babylon Framework.

## Features

- Go 1.21+ standard library HTTP server
- CORS support
- Health, status, and metrics endpoints
- Docker support with multi-stage builds
- Request logging middleware
- **Observability**: Prometheus client integration for metrics
- **Monitoring**: Pre-configured Grafana dashboards

## API Endpoints

- `GET /api/health` - Health check endpoint
- `GET /api/status` - Status endpoint
- `GET /api/metrics` - Metrics endpoint (JSON format)
- `POST /api/simulate-block` - Simulate a blocked request
- `GET /metrics` - Prometheus metrics endpoint

## Quick Start

### Local Development

1. Ensure you have Go 1.21+ installed:
```bash
go version
```

2. Install dependencies (if any):
```bash
go mod download
```

3. Run the application:
```bash
go run main.go
```

The server will start on port 8080 by default.

### With Observability Stack

Run the full stack with Prometheus and Grafana:

```bash
docker-compose -f docker-compose.observability.yml up -d
```

Access:
- **Backend**: http://localhost:8080
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3000 (admin/admin)

### Docker

Build and run with Docker:

```bash
docker build -t babylon-go-backend .
docker run -p 8080:8080 babylon-go-backend
```

## Configuration

### Environment Variables

- `PORT` - Server port (default: 8080)

Example:
```bash
PORT=3000 go run main.go
```

## Observability

This template includes comprehensive observability features:

- **Prometheus Go Client**: Native Prometheus metrics
- **Prometheus**: Metrics collection and storage
- **Grafana**: Pre-configured dashboards for visualization
- Automatic Go runtime metrics (memory, goroutines, GC, etc.)

For detailed information, see [OBSERVABILITY.md](OBSERVABILITY.md)

## API Response Examples

### Health Endpoint
```bash
curl http://localhost:8080/api/health
```
Response:
```json
{
  "status": "ok"
}
```

### Status Endpoint
```bash
curl http://localhost:8080/api/status
```
Response:
```json
"starting"
```

### Metrics Endpoint
```bash
curl http://localhost:8080/api/metrics
```
Response:
```json
{
  "metrics": [
    {
      "name": "requestCount",
      "value": 100
    },
    {
      "name": "requestsBlocked",
      "value": 20
    }
  ]
}
```

### Prometheus Metrics Endpoint
```bash
curl http://localhost:8080/metrics
```
Returns Prometheus-formatted metrics including:
- Application metrics (request counts, blocked requests)
- Go runtime metrics (memory, goroutines, GC)
- Process metrics (CPU, memory, file descriptors)

## Project Structure

```
.
├── main.go                              # Main application file with HTTP server and endpoints
├── go.mod                               # Go module file
├── Dockerfile                           # Multi-stage Docker build
├── prometheus.yml                       # Prometheus configuration
├── docker-compose.observability.yml     # Docker Compose for observability stack
├── grafana/                             # Grafana configuration
│   ├── dashboards/                      # Pre-configured dashboards
│   └── datasources/                     # Datasource configurations
├── OBSERVABILITY.md                     # Observability guide
└── README.md                            # This file
```

## Production Deployment

For production deployment:

1. Build the optimized binary:
```bash
CGO_ENABLED=0 GOOS=linux go build -o babylon-backend .
```

2. Use environment variables for configuration
3. Consider adding:
   - Database connections (PostgreSQL, MySQL, etc.)
   - Authentication middleware
   - Rate limiting
   - Structured logging (e.g., with `log/slog` or third-party libraries)
   - Health check enhancements
   - Distributed tracing

## Adding Dependencies

To add dependencies:

```bash
go get github.com/example/package
```

This will update your `go.mod` and `go.sum` files automatically.

## Testing

To run tests:

```bash
go test ./...
```

## Building

To build the binary:

```bash
go build -o babylon-backend .
```
