# Kubernetes Deployment Guide

Complete guide to deploy the Code Generator application on Kubernetes.

## Prerequisites Checklist

- [ ] Docker Desktop installed with Kubernetes enabled
- [ ] kubectl installed and configured
- [ ] At least 4GB RAM available for Kubernetes
- [ ] Port 3000 and 8080 available

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   Kubernetes Cluster                 │
│                                                      │
│  ┌──────────────┐     ┌──────────────┐             │
│  │   Frontend   │────▶│   Backend    │             │
│  │ (React/TS)   │     │(Spring/Kotlin)│            │
│  │  Port: 80    │     │  Port: 8080   │            │
│  └──────────────┘     └───────┬───────┘            │
│                                │                     │
│                                ▼                     │
│                       ┌──────────────┐              │
│                       │  PostgreSQL  │              │
│                       │  Port: 5432  │              │
│                       └──────────────┘              │
│                                                      │
└─────────────────────────────────────────────────────┘
```

## Deployment Steps

### Step 1: Verify Kubernetes is Running

```bash
kubectl cluster-info
kubectl get nodes
```

Expected output: Should show your Kubernetes cluster is running.

### Step 2: Build Docker Images

Build both frontend and backend images:

```bash
# From project root
make build

# Or build individually
make build-frontend
make build-backend
```

Verify images are built:
```bash
docker images | grep code-generator
```

### Step 3: Deploy to Kubernetes

Deploy everything with one command:

```bash
make deploy
```

This will:
1. Create the `code-generator` namespace
2. Deploy PostgreSQL with persistent storage
3. Wait for database to be ready
4. Deploy the backend (Spring Boot)
5. Deploy the frontend (React)
6. Configure ingress and autoscaling

### Step 4: Verify Deployment

Check all pods are running:
```bash
make status

# Or manually
kubectl get all -n code-generator
```

All pods should show `Running` status:
```
NAME                                      READY   STATUS    RESTARTS
pod/backend-deployment-xxx                1/1     Running   0
pod/frontend-deployment-xxx               1/1     Running   0
pod/postgres-deployment-xxx               1/1     Running   0
```

### Step 5: Access the Application

#### Option A: Port Forwarding (Easiest)

```bash
make port-forward
```

Then access:
- Frontend: http://localhost:3000
- Backend: http://localhost:8080/api/health

#### Option B: LoadBalancer (if supported)

```bash
kubectl get svc frontend-service -n code-generator
```

Look for the `EXTERNAL-IP` and access it directly.

#### Option C: Ingress (Advanced)

1. Install NGINX Ingress Controller:
```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml
```

2. Add to hosts file:
```bash
# Linux/Mac: /etc/hosts
# Windows: C:\Windows\System32\drivers\etc\hosts
127.0.0.1 code-generator.local
```

3. Access: http://code-generator.local

## Detailed Component Deployment

### Deploy Database Only

```bash
make deploy-db

# Verify
kubectl get pods -l component=database -n code-generator
```

### Deploy Backend Only

```bash
make deploy-backend

# View logs
make logs-backend
```

### Deploy Frontend Only

```bash
make deploy-frontend

# View logs
make logs-frontend
```

## Database Management

### Connect to PostgreSQL

```bash
make db-shell

# Or manually
kubectl exec -it deployment/postgres-deployment -n code-generator -- psql -U codegen -d codegen
```

### Database Credentials

- Database: `codegen`
- Username: `codegen`
- Password: `codegenpassword`

### Backup Database

```bash
kubectl exec deployment/postgres-deployment -n code-generator -- \
  pg_dump -U codegen codegen > backup.sql
```

### Restore Database

```bash
kubectl exec -i deployment/postgres-deployment -n code-generator -- \
  psql -U codegen codegen < backup.sql
```

## Scaling

### Auto-scaling (HPA)

The backend automatically scales based on CPU/memory:
- Min replicas: 2
- Max replicas: 10
- Target CPU: 70%

Check HPA status:
```bash
kubectl get hpa -n code-generator
```

### Manual Scaling

```bash
# Scale up
make scale-up

# Scale down
make scale-down

# Custom scaling
kubectl scale deployment backend-deployment --replicas=7 -n code-generator
```

## Monitoring

### View Logs

```bash
# Backend logs
make logs-backend

# Frontend logs
make logs-frontend

# Database logs
make logs-db
```

### Real-time Pod Status

```bash
kubectl get pods -n code-generator -w
```

### Resource Usage

```bash
kubectl top pods -n code-generator
kubectl top nodes
```

### Health Checks

```bash
# Backend health
kubectl port-forward svc/backend-service 8080:8080 -n code-generator &
curl http://localhost:8080/api/health
```

## Troubleshooting

### Pods Stuck in Pending

```bash
kubectl describe pod <pod-name> -n code-generator
```

Common causes:
- Insufficient resources
- Image pull issues
- PVC not bound

### Backend Can't Connect to Database

1. Check database is running:
```bash
kubectl get pods -l component=database -n code-generator
```

2. Check database service:
```bash
kubectl get svc postgres-service -n code-generator
```

3. Test connectivity:
```bash
kubectl exec -it deployment/backend-deployment -n code-generator -- \
  curl postgres-service:5432
```

### Image Pull Errors

For local Kubernetes (Docker Desktop):
```bash
# Verify images exist locally
docker images | grep code-generator

# Rebuild if needed
make build
```

For minikube:
```bash
eval $(minikube docker-env)
make build
```

### CrashLoopBackOff

View detailed logs:
```bash
kubectl logs <pod-name> -n code-generator --previous
```

Common causes:
- Configuration errors
- Database connection issues
- Port conflicts

### Out of Memory

Increase resource limits in deployment files:
```yaml
resources:
  limits:
    memory: "1Gi"  # Increase this
    cpu: "1000m"
```

## Updating the Application

### Update Backend

```bash
# Rebuild image
make build-backend

# Restart deployment
make restart-backend

# Or rolling update
kubectl rollout restart deployment/backend-deployment -n code-generator
kubectl rollout status deployment/backend-deployment -n code-generator
```

### Update Frontend

```bash
# Rebuild image
make build-frontend

# Restart deployment
make restart-frontend
```

### Rollback Deployment

```bash
# View rollout history
kubectl rollout history deployment/backend-deployment -n code-generator

# Rollback to previous version
kubectl rollout undo deployment/backend-deployment -n code-generator

# Rollback to specific revision
kubectl rollout undo deployment/backend-deployment --to-revision=2 -n code-generator
```

## Clean Up

### Delete Everything

```bash
make delete
```

This removes the entire `code-generator` namespace and all resources.

### Delete Specific Components

```bash
# Delete frontend only
kubectl delete deployment frontend-deployment -n code-generator
kubectl delete svc frontend-service -n code-generator

# Delete backend only
kubectl delete deployment backend-deployment -n code-generator
kubectl delete svc backend-service -n code-generator

# Delete database only (WARNING: Deletes data)
kubectl delete deployment postgres-deployment -n code-generator
kubectl delete svc postgres-service -n code-generator
kubectl delete pvc postgres-pvc -n code-generator
```

## Production Considerations

### Security

1. **Change default passwords:**
   - Edit `k8s/postgres-deployment.yaml`
   - Update the `POSTGRES_PASSWORD` secret

2. **Enable TLS:**
   - Configure TLS in Ingress
   - Use cert-manager for automatic certificates

3. **Network Policies:**
   - Restrict pod-to-pod communication
   - Limit external access

### High Availability

1. **Multiple replicas:**
```bash
kubectl scale deployment backend-deployment --replicas=5 -n code-generator
kubectl scale deployment frontend-deployment --replicas=3 -n code-generator
```

2. **Pod Disruption Budgets:**
   - Ensure minimum pods available during updates

3. **Database Replication:**
   - Consider PostgreSQL replication for HA

### Monitoring & Logging

1. **Install Prometheus & Grafana:**
   - Monitor resource usage
   - Set up alerts

2. **Centralized Logging:**
   - ELK Stack or Loki
   - Aggregate logs from all pods

3. **Health Checks:**
   - Ensure liveness and readiness probes are configured

## Additional Resources

- [Kubernetes Official Docs](https://kubernetes.io/docs/)
- [Spring Boot on Kubernetes](https://spring.io/guides/gs/spring-boot-kubernetes/)
- [React Production Build](https://create-react-app.dev/docs/production-build/)
- [PostgreSQL on Kubernetes](https://www.postgresql.org/docs/)

## Getting Help

If you encounter issues:

1. Check pod status: `kubectl get pods -n code-generator`
2. View logs: `make logs-backend` or `make logs-frontend`
3. Describe pod: `kubectl describe pod <pod-name> -n code-generator`
4. Check events: `kubectl get events -n code-generator --sort-by='.lastTimestamp'`
