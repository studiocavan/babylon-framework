# Django Backend Template

A Django REST Framework backend template for the Babylon Framework.

## Features

- Django 5.0 with REST Framework
- CORS support
- Health, status, and metrics endpoints
- Docker support with Gunicorn
- SQLite database (easily configurable for other databases)
- **Observability**: django-prometheus integration for metrics
- **Monitoring**: Pre-configured Grafana dashboards

## API Endpoints

- `GET /api/health` - Health check endpoint
- `GET /api/status` - Status endpoint
- `GET /api/metrics` - Metrics endpoint (JSON format)
- `POST /api/simulate-block` - Simulate a blocked request
- `GET /metrics` - Prometheus metrics endpoint

## Quick Start

### Local Development

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run migrations:
```bash
python manage.py migrate
```

4. Start the development server:
```bash
python manage.py runserver 8080
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

### Docker

Build and run with Docker:

```bash
docker build -t babylon-django-backend .
docker run -p 8080:8080 babylon-django-backend
```

## Configuration

Configuration can be modified in `babylon_backend/settings.py`:

- Database settings
- CORS configuration
- REST Framework settings
- Security settings
- Prometheus middleware settings

## Observability

This template includes comprehensive observability features:

- **django-prometheus**: Automatic Django request/response metrics
- **Prometheus**: Metrics collection and storage
- **Grafana**: Pre-configured dashboards for visualization
- Automatic metrics for requests, database queries, cache operations, and more

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

### Metrics Endpoint (JSON)
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

### Prometheus Metrics Endpoint
```bash
curl http://localhost:8080/metrics
```
Returns Prometheus-formatted metrics including:
- Django request/response metrics
- Database query metrics
- Custom application metrics
- Python process metrics

## Production Deployment

For production:

1. Set `DEBUG = False` in settings.py
2. Configure a proper `SECRET_KEY`
3. Update `ALLOWED_HOSTS`
4. Use a production database (PostgreSQL, MySQL, etc.)
5. Configure static files serving
6. Use environment variables for sensitive data
7. Secure the `/metrics` endpoint (restrict access to Prometheus server)
8. Consider using Gunicorn or uWSGI for serving

## Project Structure

```
.
├── api/                                 # API application
│   ├── views.py                         # API views with custom metrics
│   ├── urls.py                          # API URL configuration
│   └── ...
├── babylon_backend/                     # Django project settings
│   ├── settings.py                      # Project settings (with Prometheus)
│   ├── urls.py                          # Main URL configuration
│   └── ...
├── manage.py                            # Django management script
├── requirements.txt                     # Python dependencies
├── Dockerfile                           # Docker configuration
├── prometheus.yml                       # Prometheus configuration
├── docker-compose.observability.yml     # Docker Compose for observability stack
├── grafana/                             # Grafana configuration
│   ├── dashboards/                      # Pre-configured dashboards
│   └── datasources/                     # Datasource configurations
├── OBSERVABILITY.md                     # Observability guide
└── README.md                            # This file
```
