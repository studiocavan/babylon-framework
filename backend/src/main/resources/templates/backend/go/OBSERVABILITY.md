# Observability Guide - Go Backend

This guide explains how to use the observability features built into this Go backend template.

## Overview

This template includes:
- **Prometheus Go Client**: Official Prometheus client library for Go
- **Prometheus**: Metrics collection and storage
- **Grafana**: Metrics visualization and dashboards

## Metrics Endpoints

### Prometheus Metrics
- **URL**: `http://localhost:8080/metrics`
- **Format**: Prometheus exposition format
- **Usage**: Scraped by Prometheus for metrics collection

### Custom API Metrics
- **URL**: `http://localhost:8080/api/metrics`
- **Format**: JSON
- **Returns**: Custom application metrics (request count, blocked requests)

## Available Metrics

### Application Metrics
- `api_requests_total`: Total number of API requests
- `api_requests_blocked`: Number of blocked requests
- `http_requests_total`: HTTP requests by endpoint and method

### Go Runtime Metrics
- `go_goroutines`: Number of goroutines
- `go_memstats_alloc_bytes`: Bytes allocated and in use
- `go_memstats_sys_bytes`: Bytes obtained from system
- `go_gc_duration_seconds`: GC pause duration
- `go_threads`: Number of OS threads

### Process Metrics
- `process_cpu_seconds_total`: Process CPU time
- `process_resident_memory_bytes`: Resident memory size
- `process_open_fds`: Number of open file descriptors
- `process_start_time_seconds`: Process start time

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

The `prometheus.yml` file configures Prometheus to scrape metrics from the Go application:

```yaml
scrape_configs:
  - job_name: 'babylon-go-backend'
    metrics_path: '/metrics'
    static_configs:
      - targets: ['localhost:8080']
```

## Grafana Dashboards

A pre-configured dashboard is included that shows:
- API request rate
- Total API requests
- Blocked requests
- HTTP requests by endpoint
- Go memory usage
- Number of goroutines

### Importing Custom Dashboards

1. Open Grafana at http://localhost:3000
2. Navigate to Dashboards → Import
3. Upload your custom dashboard JSON file
4. Select the Prometheus datasource

## Custom Metrics

### Adding New Metrics

You can add custom metrics in your application:

```go
import (
    "github.com/prometheus/client_golang/prometheus"
    "github.com/prometheus/client_golang/prometheus/promauto"
)

var (
    customCounter = promauto.NewCounter(prometheus.CounterOpts{
        Name: "custom_metric_total",
        Help: "Description of my custom metric",
    })

    customGauge = promauto.NewGauge(prometheus.GaugeOpts{
        Name: "custom_gauge",
        Help: "A custom gauge metric",
    })
)

func myHandler(w http.ResponseWriter, r *http.Request) {
    customCounter.Inc()
    customGauge.Set(42)
    // ... rest of handler
}
```

### Metric Types

The Prometheus client supports several metric types:
- **Counter**: Monotonically increasing value
- **Gauge**: Current value (can go up or down)
- **Histogram**: Observations grouped into buckets
- **Summary**: Similar to histogram with percentile calculations

### Metrics with Labels

```go
var (
    httpRequests = promauto.NewCounterVec(
        prometheus.CounterOpts{
            Name: "http_requests_total",
            Help: "Total HTTP requests",
        },
        []string{"endpoint", "method", "status"},
    )
)

func myHandler(w http.ResponseWriter, r *http.Request) {
    httpRequests.WithLabelValues("/api/endpoint", r.Method, "200").Inc()
}
```

## Production Considerations

### Security
- Restrict access to `/metrics` endpoint in production
- Use authentication for Prometheus and Grafana
- Consider using HTTPS for all communications

### Performance
- Minimize the number of unique label combinations
- Use histograms/summaries carefully (they create multiple time series)
- Adjust scrape intervals based on your needs

### High Availability
- Run multiple instances of Prometheus
- Use Prometheus federation for large deployments
- Consider Thanos or Cortex for long-term storage

## Troubleshooting

### Metrics Not Appearing
1. Check that the application is running: `curl http://localhost:8080/api/health`
2. Verify metrics endpoint: `curl http://localhost:8080/metrics`
3. Check Prometheus targets: http://localhost:9090/targets
4. Check Prometheus logs: `docker-compose logs prometheus`

### Grafana Not Showing Data
1. Verify the Prometheus datasource is configured correctly
2. Check the time range in Grafana dashboards
3. Verify metrics exist in Prometheus: http://localhost:9090/graph

### High Memory Usage
- Check the number of active time series
- Review label cardinality
- Adjust retention settings in Prometheus

## References

- [Prometheus Go Client](https://github.com/prometheus/client_golang)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Prometheus Best Practices](https://prometheus.io/docs/practices/naming/)
