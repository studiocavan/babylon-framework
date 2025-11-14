package templates.backend.spring.src.main.kotlin.com.`babylon-backend`.controller

import com.codegen.model.HealthResponse
import com.codegen.model.Metric
import com.codegen.model.MetricsResponse
import com.codegen.service.CodeGeneratorService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@org.springframework.web.bind.annotation.RestController
@org.springframework.web.bind.annotation.RequestMapping("/api")
@org.springframework.web.bind.annotation.CrossOrigin(origins = ["*"])
class BabylonController(
    private val codeGeneratorService: com.codegen.service.CodeGeneratorService
) {

    @org.springframework.web.bind.annotation.GetMapping("/health")
    fun health(): org.springframework.http.ResponseEntity<com.codegen.model.HealthResponse> {
        return org.springframework.http.ResponseEntity.ok(com.codegen.model.HealthResponse(status = "ok"))
    }

    @org.springframework.web.bind.annotation.GetMapping("/status")
    fun status(): org.springframework.http.ResponseEntity<String> {
        return org.springframework.http.ResponseEntity.ok("starting")
    }

    @org.springframework.web.bind.annotation.GetMapping("/metrics")
    fun metrics(): org.springframework.http.ResponseEntity<com.codegen.model.MetricsResponse<Int>> {
        val response = com.codegen.model.MetricsResponse(
            metrics = kotlin.collections.mutableListOf(
                com.codegen.model.Metric(name = "requestCount", value = 100),
                com.codegen.model.Metric(name = "requestsBlocked", value = 20)
            )
        )

        return org.springframework.http.ResponseEntity.ok(response)
    }
}
