# Quick Start Guide - Code Generator

Get the Code Generator running on Kubernetes in 5 minutes!

## 🎯 What You're Deploying

- **Frontend**: TypeScript React app on Nginx
- **Backend**: Spring Boot with Kotlin REST API
- **Database**: PostgreSQL 15 with persistent storage
- **Platform**: Kubernetes with auto-scaling

## ⚡ 5-Minute Setup

### 1. Prerequisites (2 minutes)

Make sure you have:
- Docker Desktop with Kubernetes enabled
- kubectl installed

Verify:
```bash
kubectl version --short
docker --version
```

### 2. Build Images (2 minutes)

```bash
cd code-generator
make build
```

This builds both frontend and backend Docker images.

### 3. Deploy (1 minute)

```bash
make deploy
```

This deploys everything to Kubernetes automatically!

### 4. Access the App

```bash
make port-forward
```

Open your browser: **http://localhost:3000**

## 🎨 Using the Code Generator

1. Enter a project name (e.g., "my-awesome-app")
2. Select project type (REST API, GraphQL, etc.)
3. Choose your database (PostgreSQL, MongoDB, etc.)
4. Enable authentication if needed
5. Select additional features
6. Click **Generate Code**
7. Download your generated files!

## 📊 Verify Deployment

Check everything is running:
```bash
make status
```

You should see:
- ✅ 1 PostgreSQL pod
- ✅ 3 Backend pods
- ✅ 2 Frontend pods

## 🔍 View Logs

```bash
# Backend logs
make logs-backend

# Frontend logs
make logs-frontend

# Database logs
make logs-db
```

## 🗑️ Clean Up

When done:
```bash
make delete
```

## 🆘 Troubleshooting

### Pods not starting?
```bash
kubectl get pods -n code-generator
kubectl describe pod <pod-name> -n code-generator
```

### Can't access the app?
```bash
# Stop port-forward (Ctrl+C) and restart:
make port-forward
```

### Images not found?
```bash
# Rebuild images:
make build
```

## 📚 Next Steps

- Read the full [README.md](README.md) for all features
- Check [KUBERNETES_GUIDE.md](KUBERNETES_GUIDE.md) for advanced deployment
- Explore scaling: `make scale-up`
- Connect to database: `make db-shell`

## 🎓 Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | TypeScript + React 18 |
| Backend | Kotlin + Spring Boot 3.2 |
| Database | PostgreSQL 15 |
| Build Tool | Gradle 8.5 (Kotlin DSL) |
| Container | Docker Multi-stage |
| Orchestration | Kubernetes |
| Ingress | Nginx |
| Scaling | HPA (Horizontal Pod Autoscaler) |

## 🚀 Production Tips

1. **Change default password** in `k8s/postgres-deployment.yaml`
2. **Enable TLS** for secure connections
3. **Set resource limits** based on your workload
4. **Monitor** with Prometheus/Grafana
5. **Backup database** regularly

## 💡 Common Commands

```bash
make build          # Build Docker images
make deploy         # Deploy to Kubernetes
make status         # Check deployment status
make logs-backend   # View backend logs
make scale-up       # Scale to 5 backend replicas
make db-shell       # Connect to PostgreSQL
make delete         # Remove everything
```

## 🎉 Success!

Your full-stack code generator is now running on Kubernetes! 

Generate some code and download your custom projects! 🚀
