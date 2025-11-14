package templates.backend.spring.src.main.kotlin.com.`babylon-backend`.controller

import io.micrometer.core.instrument.MeterRegistry
import io.micrometer.core.instrument.Counter
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

data class HealthResponse(val status: String)
data class Metric(val name: String, val value: Number)
data class MetricsResponse(val metrics: List<Metric>)

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = ["*"])
class BabylonController(
    private val meterRegistry: MeterRegistry
) {
    private val requestCounter: Counter = Counter.builder("api.requests.total")
        .description("Total number of API requests")
        .tag("endpoint", "all")
        .register(meterRegistry)

    private val blockedCounter: Counter = Counter.builder("api.requests.blocked")
        .description("Number of blocked requests")
        .tag("endpoint", "all")
        .register(meterRegistry)

    @GetMapping("/health")
    fun health(): ResponseEntity<HealthResponse> {
        requestCounter.increment()
        return ResponseEntity.ok(HealthResponse(status = "ok"))
    }

    @GetMapping("/status")
    fun status(): ResponseEntity<String> {
        requestCounter.increment()
        return ResponseEntity.ok("starting")
    }

    @GetMapping("/metrics")
    fun metrics(): ResponseEntity<MetricsResponse> {
        requestCounter.increment()

        val response = MetricsResponse(
            metrics = listOf(
                Metric(name = "requestCount", value = requestCounter.count()),
                Metric(name = "requestsBlocked", value = blockedCounter.count())
            )
        )

        return ResponseEntity.ok(response)
    }

    @PostMapping("/simulate-block")
    fun simulateBlock(): ResponseEntity<String> {
        blockedCounter.increment()
        return ResponseEntity.ok("Request blocked")
    }
}
