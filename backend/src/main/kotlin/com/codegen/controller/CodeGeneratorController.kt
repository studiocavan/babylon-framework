package com.codegen.controller

import com.codegen.model.GenerateCodeResponse
import com.codegen.model.HealthResponse
import com.codegen.model.ProjectConfig
import com.codegen.service.CodeGeneratorService
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
}
