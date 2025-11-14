package com.codegen.controller

import com.codegen.model.GenerateCodeResponse
import com.codegen.model.HealthResponse
import com.codegen.model.Metric
import com.codegen.model.MetricsResponse
import com.codegen.model.ProjectConfig
import com.codegen.model.TemplateFile
import com.codegen.service.CodeGeneratorService
import org.springframework.core.io.support.PathMatchingResourcePatternResolver
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = ["*"])
class CodeGeneratorController(
    private val codeGeneratorService: CodeGeneratorService
) {

    @GetMapping("/health")
    fun health(): ResponseEntity<HealthResponse> {
        return ResponseEntity.ok(HealthResponse(status = "ok"))
    }

    @GetMapping("/status")
    fun status(): ResponseEntity<String> {
        return ResponseEntity.ok("starting")
    }

    @GetMapping("/metrics")
    fun metrics(): ResponseEntity<MetricsResponse<Int>> {
        val response = MetricsResponse(metrics = mutableListOf(
            Metric(name = "requestCount", value=100),
            Metric(name = "requestsBlocked", value=20)))

        return ResponseEntity.ok(response)
    }

    @PostMapping("/generate")
    fun generateCode(@RequestBody config: ProjectConfig): ResponseEntity<GenerateCodeResponse> {
        if (config.projectName.isBlank()) {
            return ResponseEntity.badRequest().body(
                GenerateCodeResponse(
                    projectName = "",
                    files = emptyList(),
                    message = "Project name is required"
                )
            )
        }

        val response = codeGeneratorService.generateProject(config)
        return ResponseEntity.ok(response)
    }

    @GetMapping("/templates/types")
    fun getTemplateTypes(): Set<String> {
        return getAllTemplates().keys
    }

    @GetMapping("/templates/{type}")
    fun getTemplateByType(@PathVariable type: String): Map<String, List<TemplateFile>>? {
        return getAllTemplates()[type]
    }

    @GetMapping("/templates/all")
    fun getAllTemplates(): Map<String, Map<String, List<TemplateFile>>> {
        val resolver = PathMatchingResourcePatternResolver()

        // Load everything under templates/**
        val resources = resolver.getResources("classpath:/templates/**/*")

        // backend -> spring-boot -> [files]
        val grouped = mutableMapOf<String, MutableMap<String, MutableList<TemplateFile>>>()

        resources.forEach { res ->
            if (!res.isReadable || res.filename.isNullOrBlank()) return@forEach

            val fullPath = res.uri.path
            val relative = fullPath.substringAfter("templates/")
            // example: backend/spring-boot/controller.txt

            val parts = relative.split("/")

            if (parts.size < 2) return@forEach  // skip any weird root files

            val type = parts[0]       // backend, frontend
            val subType = parts[1]    // spring-boot, kotlin, react, typescript

            val fileName = parts.drop(2).joinToString("/") // handles deeper nesting
            if (fileName.isBlank()) return@forEach

            val content = res.inputStream.bufferedReader().readText()

            grouped
                .computeIfAbsent(type) { mutableMapOf() }
                .computeIfAbsent(subType) { mutableListOf() }
                .add(TemplateFile(fileName, content))
        }

        return grouped
    }
}

