package com.codegen.service

import com.codegen.model.*
import org.springframework.stereotype.Service

@Service
class CodeGeneratorService{

    fun generateProject(config: ProjectConfig): GenerateCodeResponse {
        val files = mutableListOf<GeneratedFile>()

        return GenerateCodeResponse(
            projectName = config.projectName,
            files = files,
            message = "Code generated successfully"
        )
    }
}