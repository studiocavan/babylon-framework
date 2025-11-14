.PHONY: help build deploy delete logs status

help:
	@echo "Code Generator - Kubernetes Deployment Commands"
	@echo ""
	@echo "Available commands:"
	@echo "  make build              - Build all Docker images"
	@echo "  make build-frontend     - Build frontend image"
	@echo "  make build-backend      - Build backend image"
	@echo "  make deploy             - Deploy everything to Kubernetes"
	@echo "  make deploy-db          - Deploy PostgreSQL only"
	@echo "  make deploy-backend     - Deploy backend only"
	@echo "  make deploy-frontend    - Deploy frontend only"
	@echo "  make delete             - Delete all Kubernetes resources"
	@echo "  make logs-backend       - View backend logs"
	@echo "  make logs-frontend      - View frontend logs"
	@echo "  make logs-db            - View database logs"
	@echo "  make status             - Show deployment status"
	@echo "  make scale-up           - Scale backend to 5 replicas"
	@echo "  make scale-down         - Scale backend to 2 replicas"
	@echo "  make port-forward       - Setup port forwarding for local access"
	@echo "  make db-shell           - Connect to PostgreSQL shell"

build: build-frontend build-backend
	@echo "All images built successfully!"

build-frontend:
	@echo "Building frontend image..."
	docker build -t code-generator-frontend:latest ./frontend

build-backend:
	@echo "Building backend image..."
	docker build -t code-generator-backend:latest ./backend

deploy:
	@echo "Deploying to Kubernetes..."
	kubectl apply -f k8s/namespace.yaml
	kubectl apply -f k8s/postgres-deployment.yaml -n code-generator
	@echo "Waiting for PostgreSQL to be ready..."
	kubectl wait --for=condition=ready pod -l component=database -n code-generator --timeout=120s
	kubectl apply -f k8s/configmap.yaml -n code-generator
	kubectl apply -f k8s/backend-deployment.yaml -n code-generator
	kubectl apply -f k8s/frontend-deployment.yaml -n code-generator
	kubectl apply -f k8s/ingress.yaml -n code-generator
	kubectl apply -f k8s/hpa.yaml -n code-generator
	@echo "Deployment complete!"
	@echo "Waiting for all pods to be ready..."
	kubectl wait --for=condition=ready pod -l app=code-generator -n code-generator --timeout=180s
	@echo ""
	@echo "All services deployed successfully!"
	@make status

deploy-db:
	@echo "Deploying PostgreSQL..."
	kubectl apply -f k8s/postgres-deployment.yaml -n code-generator
	kubectl wait --for=condition=ready pod -l component=database -n code-generator --timeout=120s

deploy-backend:
	@echo "Deploying backend..."
	kubectl apply -f k8s/backend-deployment.yaml -n code-generator

deploy-frontend:
	@echo "Deploying frontend..."
	kubectl apply -f k8s/frontend-deployment.yaml -n code-generator

delete:
	@echo "Deleting all Kubernetes resources..."
	kubectl delete namespace code-generator
	@echo "Deletion complete!"

logs-backend:
	kubectl logs -f deployment/backend-deployment -n code-generator

logs-frontend:
	kubectl logs -f deployment/frontend-deployment -n code-generator

logs-db:
	kubectl logs -f deployment/postgres-deployment -n code-generator

status:
	@echo "=== Deployment Status ==="
	@echo ""
	@echo "Pods:"
	kubectl get pods -n code-generator
	@echo ""
	@echo "Services:"
	kubectl get svc -n code-generator
	@echo ""
	@echo "HPA:"
	kubectl get hpa -n code-generator 2>/dev/null || echo "HPA not configured"
	@echo ""
	@echo "PVC:"
	kubectl get pvc -n code-generator

scale-up:
	@echo "Scaling backend to 5 replicas..."
	kubectl scale deployment backend-deployment --replicas=5 -n code-generator

scale-down:
	@echo "Scaling backend to 2 replicas..."
	kubectl scale deployment backend-deployment --replicas=2 -n code-generator

port-forward:
	@echo "Setting up port forwarding..."
	@echo "Frontend will be available at http://localhost:3000"
	@echo "Backend will be available at http://localhost:8080"
	@echo ""
	@echo "Press Ctrl+C to stop"
	kubectl port-forward svc/frontend-service 3000:80 -n code-generator & \
	kubectl port-forward svc/backend-service 8080:8080 -n code-generator

db-shell:
	@echo "Connecting to PostgreSQL..."
	kubectl exec -it deployment/postgres-deployment -n code-generator -- psql -U codegen -d codegen

restart-backend:
	kubectl rollout restart deployment/backend-deployment -n code-generator

restart-frontend:
	kubectl rollout restart deployment/frontend-deployment -n code-generator

restart-db:
	kubectl rollout restart deployment/postgres-deployment -n code-generator

test-health:
	@echo "Testing health endpoints..."
	kubectl port-forward svc/backend-service 8080:8080 -n code-generator & sleep 2 && \
	curl http://localhost:8080/api/health && \
	pkill -f "port-forward"
