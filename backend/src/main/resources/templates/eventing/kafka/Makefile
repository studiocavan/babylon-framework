.PHONY: help build run test clean docker-build docker-up docker-down kafka-topics kafka-console-consumer

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build: ## Build the Go application
	go build -o babylon-eventing .

run: ## Run the application locally
	go run main.go

test: ## Run tests
	go test -v ./...

clean: ## Clean build artifacts
	rm -f babylon-eventing
	go clean

docker-build: ## Build Docker image
	docker build -t babylon-eventing:latest .

docker-up: ## Start all services with Docker Compose
	docker-compose up -d

docker-down: ## Stop all services
	docker-compose down

docker-logs: ## View logs from all services
	docker-compose logs -f

kafka-topics: ## List all Kafka topics
	docker exec -it kafka kafka-topics --list --bootstrap-server localhost:9092

kafka-create-topic: ## Create the babylon-events topic
	docker exec -it kafka kafka-topics --create \
		--bootstrap-server localhost:9092 \
		--topic babylon-events \
		--partitions 3 \
		--replication-factor 1

kafka-console-consumer: ## Start console consumer to view messages
	docker exec -it kafka kafka-console-consumer \
		--bootstrap-server localhost:9092 \
		--topic babylon-events \
		--from-beginning

kafka-consumer-groups: ## List consumer groups
	docker exec -it kafka kafka-consumer-groups \
		--bootstrap-server localhost:9092 \
		--list

kafka-describe-group: ## Describe the babylon consumer group
	docker exec -it kafka kafka-consumer-groups \
		--bootstrap-server localhost:9092 \
		--describe \
		--group babylon-consumer-group

send-sample-event: ## Send a sample event to the API
	curl -X POST http://localhost:8080/events \
		-H "Content-Type: application/json" \
		-d '{"event_type":"test.event","payload":{"message":"Hello Kafka"}}'

check-stats: ## Check event processing statistics
	curl http://localhost:8080/events/stats

check-health: ## Check application health
	curl http://localhost:8080/health
