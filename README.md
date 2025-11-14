# Code Generator - Full Stack Application

A production-ready code generator web application built with **TypeScript React** (frontend) and **Spring Boot with Kotlin** (backend), fully containerized and deployable on Kubernetes with PostgreSQL database.

## 🏗️ Technology Stack

### Frontend
- **TypeScript** with React 18
- Type-safe API communication
- Professional UI with CSS styling
- Dockerized with Nginx

### Backend
- **Kotlin** with Spring Boot 3.2
- RESTful API with Spring Web
- Gradle build system
- Multi-stage Docker build

### Infrastructure
- **Kubernetes** for orchestration
- **PostgreSQL 15** database
- **Nginx Ingress** for routing
- Horizontal Pod Autoscaling
- Persistent storage with PVCs

## 📁 Project Structure

```
code-generator/
├── frontend/                    # TypeScript React Application
│   ├── src/
│   │   ├── components/          # React components (TypeScript)
│   │   ├── services/            # API service layer
│   │   ├── types/               # TypeScript type definitions
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── tsconfig.json            # TypeScript configuration
│   ├── Dockerfile
│   └── package.json
│
├── backend/                     # Spring Boot Kotlin Application
│   ├── src/main/
│   │   ├── kotlin/com/codegen/
│   │   │   ├── controller/      # REST controllers
│   │   │   ├── service/         # Business logic
│   │   │   ├── model/           # Data models
│   │   │   └── config/          # Configuration
│   │   └── resources/
│   │       └── application.yml
│   ├── build.gradle.kts         # Gradle build (Kotlin DSL)
│   └── Dockerfile
│
└── k8s/                         # Kubernetes Manifests
    ├── namespace.yaml
    ├── postgres-deployment.yaml # Database with PVC
    ├── backend-deployment.yaml  # Spring Boot service
    ├── frontend-deployment.yaml # React app
    ├── configmap.yaml
    ├── ingress.yaml
    └── hpa.yaml
```

## 🚀 Quick Start

### Prerequisites

- **Docker** & **Docker Desktop** (with Kubernetes enabled)
- **kubectl** CLI tool
- **Node.js 18+** (for local frontend development)
- **JDK 17+** (for local backend development)

### Option 1: Deploy to Kubernetes (Recommended)

#### Step 1: Build Docker Images

```bash
# Build frontend
cd frontend
docker build -t code-generator-frontend:latest .

# Build backend
cd ../backend
docker build -t code-generator-backend:latest .
```

#### Step 2: Deploy to Kubernetes

```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Deploy PostgreSQL database
kubectl apply -f k8s/postgres-deployment.yaml -n code-generator

# Wait for PostgreSQL to be ready
kubectl wait --for=condition=ready pod -l component=database -n code-generator --timeout=120s

# Deploy backend (Spring Boot)
kubectl apply -f k8s/backend-deployment.yaml -n code-generator

# Deploy frontend (React)
kubectl apply -f k8s/frontend-deployment.yaml -n code-generator

# Apply ConfigMap and Ingress
kubectl apply -f k8s/configmap.yaml -n code-generator
kubectl apply -f k8s/ingress.yaml -n code-generator

# Optional: Apply HPA for auto-scaling
kubectl apply -f k8s/hpa.yaml -n code-generator
```

#### Step 3: Access the Application

```bash
# Get the LoadBalancer IP or use port-forward
kubectl get svc frontend-service -n code-generator

# Or use port-forward for local access
kubectl port-forward svc/frontend-service 3000:80 -n code-generator
kubectl port-forward svc/backend-service 8080:8080 -n code-generator
```

Access at: http://localhost:3000

### Option 2: Local Development

#### Frontend Development

```bash
cd frontend
npm install
npm start
# Runs on http://localhost:3000
```

#### Backend Development

```bash
cd backend
./gradlew bootRun
# Runs on http://localhost:8080
```

## 🎯 Features

- Generate REST API, GraphQL API, Microservice, or CRUD applications
- Support for PostgreSQL, MongoDB, MySQL, and Redis databases
- Optional JWT authentication
- Additional features: Docker, Swagger, Testing, Logging, Caching
- Download generated files individually or all at once

## 🔧 Kubernetes Management

### View All Resources

```bash
kubectl get all -n code-generator
```

### View Logs

```bash
# Backend logs
kubectl logs -f deployment/backend-deployment -n code-generator

# Frontend logs
kubectl logs -f deployment/frontend-deployment -n code-generator

# Database logs
kubectl logs -f deployment/postgres-deployment -n code-generator
```

### Scale Deployments

```bash
# Scale backend
kubectl scale deployment backend-deployment --replicas=5 -n code-generator

# Scale frontend
kubectl scale deployment frontend-deployment --replicas=3 -n code-generator
```

### Check Database

```bash
# Connect to PostgreSQL
kubectl exec -it deployment/postgres-deployment -n code-generator -- psql -U codegen -d codegen
```

### Delete All Resources

```bash
kubectl delete namespace code-generator
```

## 🔍 API Endpoints

### Backend (Spring Boot)

- `GET /api/health` - Health check endpoint
- `POST /api/generate` - Generate code

**Generate Code Request:**
```json
{
  "projectName": "my-app",
  "projectType": "REST_API",
  "database": "POSTGRESQL",
  "authentication": true,
  "features": ["DOCKER", "SWAGGER", "TESTING"]
}
```

**Generate Code Response:**
```json
{
  "projectName": "my-app",
  "files": [
    {
      "filename": "package.json",
      "content": "..."
    }
  ],
  "message": "Code generated successfully"
}
```

## 🛠️ Development

### TypeScript Type Checking

```bash
cd frontend
npm run type-check
```

### Kotlin Code Formatting

```bash
cd backend
./gradlew ktlintFormat
```

### Run Tests

```bash
# Frontend
cd frontend
npm test

# Backend
cd backend
./gradlew test
```

## 📦 Building for Production

### Build Frontend

```bash
cd frontend
npm run build
```

### Build Backend JAR

```bash
cd backend
./gradlew build
# JAR file: build/libs/code-generator-backend-1.0.0.jar
```

## 🐳 Docker Commands

### Build Images

```bash
docker build -t code-generator-frontend:latest ./frontend
docker build -t code-generator-backend:latest ./backend
```

### Run Locally with Docker

```bash
# Run PostgreSQL
docker run -d --name postgres \
  -e POSTGRES_DB=codegen \
  -e POSTGRES_USER=codegen \
  -e POSTGRES_PASSWORD=codegenpassword \
  -p 5432:5432 \
  postgres:15-alpine

# Run Backend
docker run -d --name backend \
  -p 8080:8080 \
  code-generator-backend:latest

# Run Frontend
docker run -d --name frontend \
  -p 3000:80 \
  code-generator-frontend:latest
```

## 🔐 Security Notes

- Default PostgreSQL password is `codegenpassword` (base64: `Y29kZWdlbnBhc3N3b3Jk`)
- Change passwords in `k8s/postgres-deployment.yaml` for production
- Use Kubernetes Secrets for sensitive data
- Enable HTTPS/TLS in production environments

## 📊 Monitoring

### Check Pod Resources

```bash
kubectl top pods -n code-generator
kubectl top nodes
```

### View HPA Status

```bash
kubectl get hpa -n code-generator
```

### Check Persistent Volumes

```bash
kubectl get pvc -n code-generator
kubectl get pv
```

## 🚨 Troubleshooting

### Pods Not Starting

```bash
kubectl describe pod <pod-name> -n code-generator
kubectl logs <pod-name> -n code-generator
```

### Backend Can't Connect to Database

```bash
# Check if PostgreSQL is running
kubectl get pods -l component=database -n code-generator

# Check database service
kubectl get svc postgres-service -n code-generator

# Test connection
kubectl exec -it deployment/backend-deployment -n code-generator -- curl postgres-service:5432
```

### Image Pull Errors

For local Kubernetes (Docker Desktop/minikube):
```bash
# Make sure images are built locally
docker images | grep code-generator

# For minikube, use minikube's Docker daemon
eval $(minikube docker-env)
# Then rebuild images
```

## 🌐 Ingress Setup (Optional)

If using Ingress:

1. **Install NGINX Ingress Controller:**
```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml
```

2. **Add to /etc/hosts (Linux/Mac) or C:\Windows\System32\drivers\etc\hosts (Windows):**
```
127.0.0.1 code-generator.local
```

3. **Access via:**
```
http://code-generator.local
```

## 📝 Environment Variables

### Frontend
- `REACT_APP_API_URL` - Backend API URL (default: http://backend-service:8080/api)

### Backend
- `SERVER_PORT` - Server port (default: 8080)
- `SPRING_PROFILES_ACTIVE` - Spring profile (development/production)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 🎓 Learning Resources

- [Spring Boot with Kotlin](https://spring.io/guides/tutorials/spring-boot-kotlin/)
- [TypeScript React](https://react-typescript-cheatsheet.netlify.app/)
- [Kubernetes Documentation](https://kubernetes.io/docs/home/)
- [Gradle Kotlin DSL](https://docs.gradle.org/current/userguide/kotlin_dsl.html)
