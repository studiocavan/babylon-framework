# Observability Guide - Spring Boot Backend

This guide explains how to use the observability features built into this Spring Boot backend template.

## Overview

This template includes:
- **Micrometer**: Metrics instrumentation library
- **Prometheus**: Metrics collection and storage
- **Grafana**: Metrics visualization and dashboards
- **Spring Boot Actuator**: Production-ready features for monitoring

## Metrics Endpoints

### Prometheus Metrics
- **URL**: `http://localhost:8080/actuator/prometheus`
- **Format**: Prometheus exposition format
- **Usage**: Scraped by Prometheus for metrics collection

### Actuator Endpoints
- **Health**: `http://localhost:8080/actuator/health`
- **Metrics**: `http://localhost:8080/actuator/metrics`
- **Info**: `http://localhost:8080/actuator/info`

### Custom API Metrics
- **URL**: `http://localhost:8080/api/metrics`
- **Format**: JSON
- **Returns**: Custom application metrics (request count, blocked requests)

## Available Metrics

### Application Metrics
- `api_requests_total`: Total number of API requests
- `api_requests_blocked`: Number of blocked requests
- `http_server_requests_seconds`: HTTP request duration and count

### JVM Metrics
- `jvm_memory_used_bytes`: JVM memory usage
- `jvm_memory_max_bytes`: JVM maximum memory
- `jvm_gc_pause_seconds`: Garbage collection pause time
- `jvm_threads_live`: Number of live threads

### System Metrics
- `system_cpu_usage`: System CPU usage
- `process_cpu_usage`: Process CPU usage
- `process_uptime_seconds`: Process uptime

## Running with Docker Compose

### Start the Full Stack
```bash
docker-compose -f docker-compose.observability.yml up -d
```

This will start:
- **Backend**: http://localhost:8080
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3000

### Grafana Access
- **URL**: http://localhost:3000
- **Username**: admin
- **Password**: admin

### Stop the Stack
```bash
docker-compose -f docker-compose.observability.yml down
```

## Prometheus Configuration

The `prometheus.yml` file configures Prometheus to scrape metrics from the Spring Boot application:

```yaml
scrape_configs:
  - job_name: 'babylon-spring-backend'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets: ['localhost:8080']
```

## Grafana Dashboards

A pre-configured dashboard is included that shows:
- API request rate
- Total API requests
- Blocked requests
- HTTP requests by endpoint
- JVM memory usage
- Response time percentiles (p95, p99)

### Importing Custom Dashboards

1. Open Grafana at http://localhost:3000
2. Navigate to Dashboards → Import
3. Upload your custom dashboard JSON file
4. Select the Prometheus datasource

## Custom Metrics

### Adding New Metrics

You can add custom metrics in your controllers:

```kotlin
import io.micrometer.core.instrument.MeterRegistry
import io.micrometer.core.instrument.Counter

@RestController
class MyController(private val meterRegistry: MeterRegistry) {
    private val customCounter = Counter.builder("custom_metric_total")
        .description("Description of my custom metric")
        .tag("type", "custom")
        .register(meterRegistry)

    @GetMapping("/my-endpoint")
    fun myEndpoint(): ResponseEntity<String> {
        customCounter.increment()
        return ResponseEntity.ok("Success")
    }
}
```

### Metric Types

Micrometer supports several metric types:
- **Counter**: Monotonically increasing value
- **Gauge**: Current value (can go up or down)
- **Timer**: Duration and frequency of events
- **Distribution Summary**: Distribution of values

## Production Considerations

### Security
- Restrict access to `/actuator/*` endpoints in production
- Use authentication for Prometheus and Grafana
- Consider using HTTPS for all communications

### Performance
- Adjust scrape intervals based on your needs
- Monitor the overhead of metrics collection
- Use appropriate retention policies in Prometheus

### High Availability
- Run multiple instances of Prometheus
- Use Prometheus federation for large deployments
- Consider Thanos or Cortex for long-term storage

## Troubleshooting

### Metrics Not Appearing
1. Check that the application is running: `curl http://localhost:8080/actuator/health`
2. Verify Prometheus is scraping: Check http://localhost:9090/targets
3. Check Prometheus logs: `docker-compose logs prometheus`

### Grafana Not Showing Data
1. Verify the Prometheus datasource is configured correctly
2. Check the time range in Grafana dashboards
3. Verify metrics exist in Prometheus: http://localhost:9090/graph

## References

- [Micrometer Documentation](https://micrometer.io/docs)
- [Spring Boot Actuator](https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
