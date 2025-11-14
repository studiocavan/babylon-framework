package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

// Metric represents a single metric entry
type Metric struct {
	Name  string `json:"name"`
	Value int    `json:"value"`
}

// MetricsResponse represents the response structure for metrics endpoint
type MetricsResponse struct {
	Metrics []Metric `json:"metrics"`
}

// HealthResponse represents the response structure for health endpoint
type HealthResponse struct {
	Status string `json:"status"`
}

var (
	requestCount  int64 = 0
	blockedCount  int64 = 0

	requestCounter = promauto.NewCounter(prometheus.CounterOpts{
		Name: "api_requests_total",
		Help: "Total number of API requests",
	})

	blockedCounter = promauto.NewCounter(prometheus.CounterOpts{
		Name: "api_requests_blocked",
		Help: "Number of blocked requests",
	})

	httpRequestsTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "http_requests_total",
			Help: "Total number of HTTP requests by endpoint and method",
		},
		[]string{"endpoint", "method"},
	)
)

// healthHandler handles health check requests
func healthHandler(w http.ResponseWriter, r *http.Request) {
	requestCount++
	requestCounter.Inc()
	httpRequestsTotal.WithLabelValues("/api/health", r.Method).Inc()
	w.Header().Set("Content-Type", "application/json")
	response := HealthResponse{Status: "ok"}
	json.NewEncoder(w).Encode(response)
}

// statusHandler handles status requests
func statusHandler(w http.ResponseWriter, r *http.Request) {
	requestCount++
	requestCounter.Inc()
	httpRequestsTotal.WithLabelValues("/api/status", r.Method).Inc()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode("starting")
}

// metricsHandler handles metrics requests (JSON format)
func metricsHandler(w http.ResponseWriter, r *http.Request) {
	requestCount++
	requestCounter.Inc()
	httpRequestsTotal.WithLabelValues("/api/metrics", r.Method).Inc()
	w.Header().Set("Content-Type", "application/json")
	response := MetricsResponse{
		Metrics: []Metric{
			{Name: "requestCount", Value: int(requestCount)},
			{Name: "requestsBlocked", Value: int(blockedCount)},
		},
	}
	json.NewEncoder(w).Encode(response)
}

// simulateBlockHandler simulates a blocked request
func simulateBlockHandler(w http.ResponseWriter, r *http.Request) {
	blockedCount++
	blockedCounter.Inc()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Request blocked"})
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
	mux := http.NewServeMux()

	// Register API endpoints
	mux.HandleFunc("/api/health", healthHandler)
	mux.HandleFunc("/api/status", statusHandler)
	mux.HandleFunc("/api/metrics", metricsHandler)
	mux.HandleFunc("/api/simulate-block", simulateBlockHandler)

	// Prometheus metrics endpoint
	mux.Handle("/metrics", promhttp.Handler())

	// Apply middleware
	handler := loggingMiddleware(corsMiddleware(mux))

	// Get port from environment variable or use default
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Starting server on port %s", port)
	log.Printf("Prometheus metrics available at http://localhost:%s/metrics", port)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatal(err)
	}
}
