package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"sync"
	"sync/atomic"
	"syscall"
	"time"

	"github.com/IBM/sarama"
)

type Event struct {
	EventID   string                 `json:"event_id"`
	EventType string                 `json:"event_type"`
	Timestamp time.Time              `json:"timestamp"`
	Payload   map[string]interface{} `json:"payload"`
}

type Stats struct {
	MessagesProduced int64     `json:"messages_produced"`
	MessagesConsumed int64     `json:"messages_consumed"`
	LastMessageTime  time.Time `json:"last_message_time"`
}

var (
	stats          Stats
	statsLock      sync.RWMutex
	kafkaBrokers   []string
	kafkaTopic     string
	kafkaGroupID   string
	serverPort     string
	producer       sarama.SyncProducer
	consumerGroup  sarama.ConsumerGroup
)

func init() {
	// Load configuration from environment variables
	brokersStr := getEnv("KAFKA_BROKERS", "localhost:9092")
	kafkaBrokers = strings.Split(brokersStr, ",")
	kafkaTopic = getEnv("KAFKA_TOPIC", "babylon-events")
	kafkaGroupID = getEnv("KAFKA_GROUP_ID", "babylon-consumer-group")
	serverPort = getEnv("PORT", "8080")
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func main() {
	log.Println("Starting Babylon Kafka Eventing Service...")

	// Initialize Kafka producer
	var err error
	producer, err = initProducer()
	if err != nil {
		log.Fatalf("Failed to initialize producer: %v", err)
	}
	defer producer.Close()

	// Initialize Kafka consumer
	consumerGroup, err = initConsumer()
	if err != nil {
		log.Fatalf("Failed to initialize consumer: %v", err)
	}
	defer consumerGroup.Close()

	// Start consumer in background
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	go startConsumer(ctx)

	// Start HTTP server
	http.HandleFunc("/health", healthHandler)
	http.HandleFunc("/events", eventsHandler)
	http.HandleFunc("/events/stats", statsHandler)

	server := &http.Server{
		Addr:         ":" + serverPort,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
	}

	// Handle graceful shutdown
	go func() {
		sigterm := make(chan os.Signal, 1)
		signal.Notify(sigterm, syscall.SIGINT, syscall.SIGTERM)
		<-sigterm
		log.Println("Shutting down server...")
		cancel()
		server.Shutdown(context.Background())
	}()

	log.Printf("Server listening on port %s", serverPort)
	log.Printf("Kafka brokers: %v", kafkaBrokers)
	log.Printf("Kafka topic: %s", kafkaTopic)
	log.Printf("Consumer group: %s", kafkaGroupID)

	if err := server.ListenAndServe(); err != http.ErrServerClosed {
		log.Fatalf("Server error: %v", err)
	}
}

func initProducer() (sarama.SyncProducer, error) {
	config := sarama.NewConfig()
	config.Producer.Return.Successes = true
	config.Producer.RequiredAcks = sarama.WaitForAll
	config.Producer.Retry.Max = 5
	config.Producer.Compression = sarama.CompressionSnappy

	return sarama.NewSyncProducer(kafkaBrokers, config)
}

func initConsumer() (sarama.ConsumerGroup, error) {
	config := sarama.NewConfig()
	config.Consumer.Group.Rebalance.Strategy = sarama.NewBalanceStrategyRoundRobin()
	config.Consumer.Offsets.Initial = sarama.OffsetNewest
	config.Consumer.Return.Errors = true

	return sarama.NewConsumerGroup(kafkaBrokers, kafkaGroupID, config)
}

func startConsumer(ctx context.Context) {
	consumer := &Consumer{}
	topics := []string{kafkaTopic}

	for {
		if err := consumerGroup.Consume(ctx, topics, consumer); err != nil {
			log.Printf("Error from consumer: %v", err)
		}

		if ctx.Err() != nil {
			return
		}
	}
}

// Consumer represents a Sarama consumer group consumer
type Consumer struct{}

// Setup is run at the beginning of a new session
func (consumer *Consumer) Setup(sarama.ConsumerGroupSession) error {
	return nil
}

// Cleanup is run at the end of a session
func (consumer *Consumer) Cleanup(sarama.ConsumerGroupSession) error {
	return nil
}

// ConsumeClaim processes messages from a partition
func (consumer *Consumer) ConsumeClaim(session sarama.ConsumerGroupSession, claim sarama.ConsumerGroupClaim) error {
	for message := range claim.Messages() {
		var event Event
		if err := json.Unmarshal(message.Value, &event); err != nil {
			log.Printf("Error unmarshaling message: %v", err)
			continue
		}

		log.Printf("Consumed event: %s (type: %s) from partition %d at offset %d",
			event.EventID, event.EventType, message.Partition, message.Offset)

		// Update stats
		atomic.AddInt64(&stats.MessagesConsumed, 1)
		statsLock.Lock()
		stats.LastMessageTime = time.Now()
		statsLock.Unlock()

		// Process the event (implement your business logic here)
		processEvent(event)

		session.MarkMessage(message, "")
	}

	return nil
}

func processEvent(event Event) {
	// Implement your event processing logic here
	log.Printf("Processing event: %+v", event)
}

func produceEvent(event Event) error {
	eventJSON, err := json.Marshal(event)
	if err != nil {
		return fmt.Errorf("failed to marshal event: %w", err)
	}

	msg := &sarama.ProducerMessage{
		Topic: kafkaTopic,
		Key:   sarama.StringEncoder(event.EventID),
		Value: sarama.ByteEncoder(eventJSON),
	}

	partition, offset, err := producer.SendMessage(msg)
	if err != nil {
		return fmt.Errorf("failed to send message: %w", err)
	}

	log.Printf("Produced event: %s to partition %d at offset %d", event.EventID, partition, offset)

	// Update stats
	atomic.AddInt64(&stats.MessagesProduced, 1)
	statsLock.Lock()
	stats.LastMessageTime = time.Now()
	statsLock.Unlock()

	return nil
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"status": "ok",
		"service": "babylon-kafka-eventing",
	})
}

func eventsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var event Event
	if err := json.NewDecoder(r.Body).Decode(&event); err != nil {
		http.Error(w, fmt.Sprintf("Invalid request body: %v", err), http.StatusBadRequest)
		return
	}

	// Set event ID and timestamp if not provided
	if event.EventID == "" {
		event.EventID = fmt.Sprintf("evt_%d", time.Now().UnixNano())
	}
	if event.Timestamp.IsZero() {
		event.Timestamp = time.Now()
	}

	if err := produceEvent(event); err != nil {
		http.Error(w, fmt.Sprintf("Failed to produce event: %v", err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"event_id": event.EventID,
	})
}

func statsHandler(w http.ResponseWriter, r *http.Request) {
	statsLock.RLock()
	currentStats := Stats{
		MessagesProduced: atomic.LoadInt64(&stats.MessagesProduced),
		MessagesConsumed: atomic.LoadInt64(&stats.MessagesConsumed),
		LastMessageTime:  stats.LastMessageTime,
	}
	statsLock.RUnlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(currentStats)
}
