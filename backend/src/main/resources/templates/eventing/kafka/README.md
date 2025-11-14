# Kafka Eventing Template

A Kafka-based event streaming template for the Babylon Framework.

## Features

- Apache Kafka for event streaming
- Producer and Consumer examples
- Docker Compose setup for local development
- Configurable topics and consumer groups
- Health check endpoints
- JSON message serialization
- Error handling and retry logic

## Components

- **Kafka Broker**: Message broker for event streaming
- **Zookeeper**: Coordination service for Kafka
- **Producer**: Service to publish events to Kafka topics
- **Consumer**: Service to consume events from Kafka topics

## Quick Start

### Local Development with Docker Compose

1. Start Kafka and Zookeeper:
```bash
docker-compose up -d
```

2. Verify Kafka is running:
```bash
docker-compose ps
```

3. Build and run the application:
```bash
go run main.go
```

The application will:
- Start a producer that publishes sample events every 5 seconds
- Start a consumer that reads events from the topic
- Expose health check endpoint on port 8080

### Docker

Build and run the entire stack:

```bash
docker-compose up --build
```

## API Endpoints

- `GET /health` - Health check endpoint
- `POST /events` - Publish an event to Kafka
- `GET /events/stats` - Get event processing statistics

## Configuration

### Environment Variables

- `KAFKA_BROKERS` - Kafka broker addresses (default: localhost:9092)
- `KAFKA_TOPIC` - Kafka topic name (default: babylon-events)
- `KAFKA_GROUP_ID` - Consumer group ID (default: babylon-consumer-group)
- `PORT` - HTTP server port (default: 8080)

Example:
```bash
KAFKA_BROKERS=localhost:9092 KAFKA_TOPIC=my-topic go run main.go
```

## Usage Examples

### Publishing Events

```bash
curl -X POST http://localhost:8080/events \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "user.created",
    "payload": {
      "user_id": "12345",
      "email": "user@example.com"
    }
  }'
```

### Viewing Stats

```bash
curl http://localhost:8080/events/stats
```

Response:
```json
{
  "messages_produced": 150,
  "messages_consumed": 150,
  "last_message_time": "2025-11-14T10:30:00Z"
}
```

## Kafka Management

### Create a Topic

```bash
docker exec -it kafka kafka-topics --create \
  --bootstrap-server localhost:9092 \
  --topic babylon-events \
  --partitions 3 \
  --replication-factor 1
```

### List Topics

```bash
docker exec -it kafka kafka-topics --list \
  --bootstrap-server localhost:9092
```

### View Messages

```bash
docker exec -it kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic babylon-events \
  --from-beginning
```

## Project Structure

```
.
├── main.go              # Main application with producer and consumer
├── go.mod               # Go module file
├── Dockerfile           # Application container
├── docker-compose.yml   # Kafka, Zookeeper, and app orchestration
├── .gitignore          # Git ignore file
└── README.md           # This file
```

## Event Schema

Events follow this JSON schema:

```json
{
  "event_id": "uuid",
  "event_type": "string",
  "timestamp": "ISO8601 datetime",
  "payload": {
    "...": "application-specific data"
  }
}
```

## Production Deployment

For production deployment:

1. Use a managed Kafka service (AWS MSK, Confluent Cloud, etc.)
2. Configure proper authentication and encryption (SASL/SSL)
3. Set up monitoring and alerting
4. Implement dead letter queues for failed messages
5. Configure appropriate retention policies
6. Use schema registry for message validation
7. Scale consumer groups based on partition count
8. Implement idempotency for at-least-once delivery
9. Configure log compaction for event sourcing patterns

### Production Configuration Example

```yaml
kafka:
  brokers:
    - kafka-1.prod.example.com:9093
    - kafka-2.prod.example.com:9093
    - kafka-3.prod.example.com:9093
  security:
    protocol: SASL_SSL
    sasl_mechanism: PLAIN
    username: ${KAFKA_USERNAME}
    password: ${KAFKA_PASSWORD}
  topic:
    name: babylon-events-prod
    partitions: 10
    replication_factor: 3
    retention_ms: 604800000  # 7 days
```

## Common Use Cases

### Event-Driven Microservices
- Service-to-service async communication
- Event sourcing and CQRS patterns
- Real-time data pipelines

### Stream Processing
- Real-time analytics
- Data aggregation
- Event correlation

### Log Aggregation
- Centralized logging
- Audit trails
- Monitoring and alerting

## Troubleshooting

### Kafka Connection Issues

If you see "Connection refused" errors:
1. Ensure Kafka is running: `docker-compose ps`
2. Check Kafka logs: `docker-compose logs kafka`
3. Verify broker address matches configuration

### Consumer Not Receiving Messages

1. Check consumer group status:
```bash
docker exec -it kafka kafka-consumer-groups \
  --bootstrap-server localhost:9092 \
  --describe \
  --group babylon-consumer-group
```

2. Verify topic has messages:
```bash
docker exec -it kafka kafka-run-class kafka.tools.GetOffsetShell \
  --broker-list localhost:9092 \
  --topic babylon-events
```

### Performance Tuning

- Increase partition count for parallel processing
- Adjust batch size and linger time for producers
- Configure fetch.min.bytes for consumers
- Use compression (snappy, lz4, or zstd)

## Testing

Run tests:
```bash
go test ./...
```

Run integration tests with Kafka:
```bash
docker-compose up -d
go test -tags=integration ./...
docker-compose down
```

## Additional Resources

- [Apache Kafka Documentation](https://kafka.apache.org/documentation/)
- [Confluent Kafka Go Client](https://github.com/confluentinc/confluent-kafka-go)
- [Kafka Best Practices](https://kafka.apache.org/documentation/#bestpractices)
