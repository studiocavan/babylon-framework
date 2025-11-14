package com.codegen.model

data class ProjectConfig(
    val projectName: String,
    val projectType: ProjectType,
    val database: DatabaseType,
    val authentication: Boolean,
    val features: List<Feature>
)

enum class ProjectType {
    REST_API,
    GRAPHQL_API,
    MICROSERVICE,
    CRUD_APP
}

enum class DatabaseType {
    POSTGRESQL,
    MONGODB,
    MYSQL,
    REDIS
}

enum class Feature {
    DOCKER,
    SWAGGER,
    TESTING,
    LOGGING,
    CACHING
}

data class GeneratedFile(
    val filename: String,
    val content: String
)

data class GenerateCodeResponse(
    val projectName: String,
    val files: List<GeneratedFile>,
    val message: String
)

data class HealthResponse(
    val status: String,
    val service: String = "code-generator-api",
    val timestamp: String = java.time.Instant.now().toString()
)

data class Metric<T>(
    val name: String,
    val value: T
)

data class MetricsResponse<T>(
    val metrics: List<Metric<T>>
)
