package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/go-redis/redis/v8"
)

var (
	ctx        = context.Background()
	redisClient *redis.Client
)

// CacheItem represents a cached item
type CacheItem struct {
	Key   string `json:"key"`
	Value string `json:"value"`
	TTL   int    `json:"ttl"` // Time to live in seconds
}

// CacheResponse represents the response structure
type CacheResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Data    string `json:"data,omitempty"`
}

// HealthResponse represents the health check response
type HealthResponse struct {
	Status string `json:"status"`
	Redis  string `json:"redis"`
}

// initRedis initializes the Redis client
func initRedis() {
	redisHost := os.Getenv("REDIS_HOST")
	if redisHost == "" {
		redisHost = "localhost"
	}

	redisPort := os.Getenv("REDIS_PORT")
	if redisPort == "" {
		redisPort = "6379"
	}

	redisPassword := os.Getenv("REDIS_PASSWORD")

	redisClient = redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%s", redisHost, redisPort),
		Password: redisPassword,
		DB:       0, // use default DB
	})

	// Test the connection
	_, err := redisClient.Ping(ctx).Result()
	if err != nil {
		log.Printf("Warning: Could not connect to Redis: %v", err)
	} else {
		log.Println("Successfully connected to Redis")
	}
}

// healthHandler handles health check requests
func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	redisStatus := "disconnected"
	_, err := redisClient.Ping(ctx).Result()
	if err == nil {
		redisStatus = "connected"
	}

	response := HealthResponse{
		Status: "ok",
		Redis:  redisStatus,
	}
	json.NewEncoder(w).Encode(response)
}

// setHandler handles setting cache items
func setHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var item CacheItem
	if err := json.NewDecoder(r.Body).Decode(&item); err != nil {
		response := CacheResponse{
			Success: false,
			Message: "Invalid request body",
		}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	// Set with TTL if provided, otherwise no expiration
	var err error
	if item.TTL > 0 {
		err = redisClient.Set(ctx, item.Key, item.Value, time.Duration(item.TTL)*time.Second).Err()
	} else {
		err = redisClient.Set(ctx, item.Key, item.Value, 0).Err()
	}

	if err != nil {
		response := CacheResponse{
			Success: false,
			Message: fmt.Sprintf("Failed to set cache: %v", err),
		}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	response := CacheResponse{
		Success: true,
		Message: "Cache item set successfully",
	}
	json.NewEncoder(w).Encode(response)
}

// getHandler handles getting cache items
func getHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	key := r.URL.Query().Get("key")
	if key == "" {
		response := CacheResponse{
			Success: false,
			Message: "Key parameter is required",
		}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	val, err := redisClient.Get(ctx, key).Result()
	if err == redis.Nil {
		response := CacheResponse{
			Success: false,
			Message: "Key not found",
		}
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(response)
		return
	} else if err != nil {
		response := CacheResponse{
			Success: false,
			Message: fmt.Sprintf("Failed to get cache: %v", err),
		}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	response := CacheResponse{
		Success: true,
		Message: "Cache item retrieved successfully",
		Data:    val,
	}
	json.NewEncoder(w).Encode(response)
}

// deleteHandler handles deleting cache items
func deleteHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodDelete {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	key := r.URL.Query().Get("key")
	if key == "" {
		response := CacheResponse{
			Success: false,
			Message: "Key parameter is required",
		}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	err := redisClient.Del(ctx, key).Err()
	if err != nil {
		response := CacheResponse{
			Success: false,
			Message: fmt.Sprintf("Failed to delete cache: %v", err),
		}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	response := CacheResponse{
		Success: true,
		Message: "Cache item deleted successfully",
	}
	json.NewEncoder(w).Encode(response)
}

// corsMiddleware adds CORS headers to responses
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// loggingMiddleware logs incoming requests
func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("%s %s %s", r.RemoteAddr, r.Method, r.URL)
		next.ServeHTTP(w, r)
	})
}

func main() {
	// Initialize Redis connection
	initRedis()
	defer redisClient.Close()

	mux := http.NewServeMux()

	// Register API endpoints
	mux.HandleFunc("/api/health", healthHandler)
	mux.HandleFunc("/api/cache/set", setHandler)
	mux.HandleFunc("/api/cache/get", getHandler)
	mux.HandleFunc("/api/cache/delete", deleteHandler)

	// Apply middleware
	handler := loggingMiddleware(corsMiddleware(mux))

	// Get port from environment variable or use default
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Starting Redis cache service on port %s", port)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatal(err)
	}
}
