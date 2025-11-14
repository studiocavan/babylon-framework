## 1: Build Docker Images

# Build frontend
cd frontend
docker build -t code-generator-frontend:latest .
cd ..

# Build backend
cd backend
docker build -t code-generator-backend:latest .
cd ..

## 2: Deploy to Kubernetes

# Create namespace
kubectl apply -f k8s/namespace.yaml

# Deploy PostgreSQL
kubectl apply -f k8s/postgres-deployment.yaml -n code-generator

# Wait for database to be ready (wait ~30 seconds)
kubectl wait --for=condition=ready pod -l component=database -n code-generator --timeout=120s

# Deploy ConfigMap
kubectl apply -f k8s/configmap.yaml -n code-generator

# Deploy backend
kubectl apply -f k8s/backend-deployment.yaml -n code-generator

# Deploy frontend
kubectl apply -f k8s/frontend-deployment.yaml -n code-generator

# Optional: Deploy ingress and HPA
kubectl apply -f k8s/ingress.yaml -n code-generator
kubectl apply -f k8s/hpa.yaml -n code-generator

## 3: Access The Application

# Port forward to access locally
kubectl port-forward svc/frontend-service 3000:80 -n code-generator