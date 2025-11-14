# Spring Boot Backend Template

A Spring Boot 3.x with Kotlin backend template for the Babylon Framework.

## Features

- Spring Boot 3.3.3 with Kotlin
- RESTful API with Spring Web
- CORS support
- Health, status, and metrics endpoints
- Docker support
- **Observability**: Micrometer, Prometheus, and Grafana integration
- Production-ready with Spring Boot Actuator

## API Endpoints

- `GET /api/health` - Health check endpoint
- `GET /api/status` - Status endpoint
- `GET /api/metrics` - Metrics endpoint (JSON format)
- `POST /api/simulate-block` - Simulate a blocked request
- `GET /actuator/health` - Actuator health endpoint
- `GET /actuator/prometheus` - Prometheus metrics endpoint
- `GET /actuator/metrics` - Actuator metrics endpoint

## Quick Start

### Local Development

1. Ensure you have Java 17+ installed:
```bash
java -version
```

2. Run the application:
```bash
./gradlew bootRun
```

The server will start on port 8080 by default.

### Docker

Build and run with Docker:

```bash
docker build -t babylon-spring-backend .
docker run -p 8080:8080 babylon-spring-backend
```

### With Observability Stack

Run the full stack with Prometheus and Grafana:

```bash
docker-compose -f docker-compose.observability.yml up -d
```

Access:
- **Backend**: http://localhost:8080
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3000 (admin/admin)

## Configuration

Configuration is in `src/main/resources/application.yml`:

- Server port
- Spring application name
- Actuator endpoints
- Metrics configuration

## Observability

This template includes comprehensive observability features:

- **Micrometer**: Application metrics instrumentation
- **Prometheus**: Metrics collection and storage
- **Grafana**: Pre-configured dashboards for visualization
- **Spring Boot Actuator**: Production-ready monitoring endpoints

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
      "value": 42
    },
    {
      "name": "requestsBlocked",
      "value": 5
    }
  ]
}
```

### Prometheus Metrics
```bash
curl http://localhost:8080/actuator/prometheus
```
Returns Prometheus-formatted metrics.

## Project Structure

```
.
├── src/
│   └── main/
│       ├── kotlin/
│       │   └── com/babylon-backend/
│       │       ├── BabylonApplication.kt
│       │       └── controller/
│       │           └── BabylonController.kt
│       └── resources/
│           └── application.yml
├── build.gradle.kts
├── Dockerfile
├── prometheus.yml
├── docker-compose.observability.yml
├── grafana/
│   ├── dashboards/
│   └── datasources/
└── README.md
```

## Building

To build the application:

```bash
./gradlew build
```

The built JAR will be in `build/libs/`.

## Testing

To run tests:

```bash
./gradlew test
```

## Production Deployment

For production deployment:

1. Build the optimized JAR:
```bash
./gradlew build -x test
```

2. Configure application.yml for production:
   - Set appropriate server port
   - Configure security for actuator endpoints
   - Set up proper logging
   - Configure external database if needed

3. Use environment variables for sensitive configuration

4. Consider adding:
   - Database connections (PostgreSQL, MySQL, etc.)
   - Authentication/Authorization (Spring Security)
   - API rate limiting
   - Request validation
   - Structured logging
   - Distributed tracing (with Micrometer Tracing)

## Dependencies

Key dependencies:
- Spring Boot 3.3.3
- Kotlin 1.9.21
- Micrometer (with Prometheus registry)
- Spring Boot Actuator
- Jackson for JSON

See `build.gradle.kts` for the complete list.

## Contributing

When adding new features:
1. Add appropriate tests
2. Update the API documentation
3. Add metrics for monitoring
4. Update the OBSERVABILITY.md if adding new metrics

## License

[Add your license here]
