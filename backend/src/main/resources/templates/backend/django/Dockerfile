# Build stage
FROM python:3.11-slim AS build

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Runtime stage
FROM python:3.11-slim

WORKDIR /app

# Copy installed packages from build stage
COPY --from=build /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=build /usr/local/bin /usr/local/bin

# Copy application code
COPY --from=build /app /app

# Run migrations and collect static files
RUN python manage.py migrate --noinput || true
RUN python manage.py collectstatic --noinput || true

EXPOSE 8080

# Use gunicorn for production
CMD ["gunicorn", "--bind", "0.0.0.0:8080", "--workers", "4", "babylon_backend.wsgi:application"]
