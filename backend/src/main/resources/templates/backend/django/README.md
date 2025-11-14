# Django Backend Template

A Django REST Framework backend template for the Babylon Framework.

## Features

- Django 5.0 with REST Framework
- CORS support
- Health, status, and metrics endpoints
- Docker support with Gunicorn
- SQLite database (easily configurable for other databases)

## API Endpoints

- `GET /api/health` - Health check endpoint
- `GET /api/status` - Status endpoint
- `GET /api/metrics` - Metrics endpoint

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

## Production Deployment

For production:

1. Set `DEBUG = False` in settings.py
2. Configure a proper `SECRET_KEY`
3. Update `ALLOWED_HOSTS`
4. Use a production database (PostgreSQL, MySQL, etc.)
5. Configure static files serving
6. Use environment variables for sensitive data
