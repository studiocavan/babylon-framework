# Observability Guide - Django Backend

This guide explains how to use the observability features built into this Django backend template.

## Overview

This template includes:
- **django-prometheus**: Django integration for Prometheus metrics
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
- `api_requests_total`: Total number of API requests (custom)
- `api_requests_blocked`: Number of blocked requests (custom)

### Django Metrics
- `django_http_requests_total_by_method`: Total HTTP requests by method
- `django_http_requests_total_by_view_transport_method`: Requests by view and method
- `django_http_requests_latency_seconds_by_view_method`: Request latency by view
- `django_http_responses_total_by_status`: Responses by status code
- `django_http_exceptions_total_by_type`: Exceptions by type

### Database Metrics
- `django_db_new_connections_total`: New database connections
- `django_db_execute_total`: Database queries executed
- `django_db_execute_many_total`: Bulk database operations

### Python Metrics
- `python_info`: Python version information
- `process_virtual_memory_bytes`: Virtual memory usage
- `process_resident_memory_bytes`: Resident memory usage
- `process_cpu_seconds_total`: CPU time

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

The `prometheus.yml` file configures Prometheus to scrape metrics from the Django application:

```yaml
scrape_configs:
  - job_name: 'babylon-django-backend'
    metrics_path: '/metrics'
    static_configs:
      - targets: ['localhost:8080']
```

## Grafana Dashboards

A pre-configured dashboard is included that shows:
- API request rate
- Total API requests
- Blocked requests
- Django request duration by view
- Django requests by view
- Python process memory usage

### Importing Custom Dashboards

1. Open Grafana at http://localhost:3000
2. Navigate to Dashboards → Import
3. Upload your custom dashboard JSON file
4. Select the Prometheus datasource

## Custom Metrics

### Adding New Metrics

You can add custom metrics in your views:

```python
from prometheus_client import Counter, Histogram, Gauge

# Define metrics
custom_counter = Counter('custom_operations_total', 'Total custom operations')
request_duration = Histogram('custom_request_duration_seconds', 'Request duration')
active_users = Gauge('active_users', 'Number of active users')

@api_view(['GET'])
def my_view(request):
    custom_counter.inc()

    with request_duration.time():
        # Your logic here
        pass

    active_users.set(get_active_user_count())
    return Response({'status': 'ok'})
```

### Metric Types

The Prometheus client supports several metric types:
- **Counter**: Monotonically increasing value (use `.inc()`)
- **Gauge**: Current value (use `.set()`, `.inc()`, `.dec()`)
- **Histogram**: Observations grouped into buckets (use `.observe()`)
- **Summary**: Similar to histogram with percentile calculations

### Metrics with Labels

```python
from prometheus_client import Counter

request_counter = Counter(
    'http_requests_by_endpoint_total',
    'Total HTTP requests by endpoint',
    ['endpoint', 'method', 'status']
)

@api_view(['GET'])
def my_view(request):
    request_counter.labels(endpoint='/api/my-endpoint', method='GET', status='200').inc()
    return Response({'status': 'ok'})
```

## Django-Prometheus Features

### Middleware Metrics
The django-prometheus middleware automatically tracks:
- Request counts by view and method
- Request latency by view
- Response status codes
- Exceptions

### Database Monitoring
Database metrics are automatically collected when using django-prometheus:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django_prometheus.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

### Cache Monitoring
Monitor cache operations:
```python
CACHES = {
    'default': {
        'BACKEND': 'django_prometheus.cache.backends.locmem.LocMemCache',
    }
}
```

## Production Considerations

### Security
- Restrict access to `/metrics` endpoint in production
- Use authentication for Prometheus and Grafana
- Consider using HTTPS for all communications

### Performance
- Monitor the overhead of metrics collection
- Use appropriate scrape intervals
- Be careful with high-cardinality labels

### Django Settings for Production
```python
# Only allow metrics access from Prometheus server
PROMETHEUS_METRICS_EXPORT_PORT_RANGE = range(8001, 8050)
PROMETHEUS_METRICS_EXPORT_ADDRESS = ''

# Disable metrics in DEBUG mode if needed
if not DEBUG:
    MIDDLEWARE = [
        'django_prometheus.middleware.PrometheusBeforeMiddleware',
        # ... other middleware
        'django_prometheus.middleware.PrometheusAfterMiddleware',
    ]
```

### High Availability
- Run multiple Django instances with a load balancer
- Use Prometheus federation for large deployments
- Consider Thanos or Cortex for long-term storage

## Troubleshooting

### Metrics Not Appearing
1. Check that the application is running: `curl http://localhost:8080/api/health`
2. Verify metrics endpoint: `curl http://localhost:8080/metrics`
3. Check middleware is installed correctly in settings.py
4. Verify Prometheus is scraping: http://localhost:9090/targets
5. Check Prometheus logs: `docker-compose logs prometheus`

### Grafana Not Showing Data
1. Verify the Prometheus datasource is configured correctly
2. Check the time range in Grafana dashboards
3. Verify metrics exist in Prometheus: http://localhost:9090/graph
4. Check metric names match the dashboard queries

### High Memory Usage
- Check the number of active time series
- Review label cardinality
- Adjust retention settings in Prometheus
- Consider using metric relabeling

## References

- [django-prometheus Documentation](https://github.com/korfuri/django-prometheus)
- [Prometheus Python Client](https://github.com/prometheus/client_python)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Django Monitoring Best Practices](https://docs.djangoproject.com/en/stable/howto/deployment/checklist/)
