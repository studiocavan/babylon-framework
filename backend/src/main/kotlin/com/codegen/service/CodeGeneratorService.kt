package com.codegen.service

import com.codegen.model.*
import org.springframework.stereotype.Service

@Service
class CodeGeneratorService {

    fun generateProject(config: ProjectConfig): GenerateCodeResponse {
        val files = mutableListOf<GeneratedFile>()

        // Generate base files
        files.add(generatePackageJson(config))
        files.add(generateDockerfile())
        files.add(generateDockerCompose(config.database))
        files.add(generateEnvFile(config.database))
        files.add(generateReadme(config))

        // Generate project-specific files
        when (config.projectType) {
            ProjectType.REST_API -> files.addAll(generateRestApiFiles(config))
            ProjectType.GRAPHQL_API -> files.addAll(generateGraphQLFiles(config))
            ProjectType.MICROSERVICE -> files.addAll(generateMicroserviceFiles(config))
            ProjectType.CRUD_APP -> files.addAll(generateCrudAppFiles(config))
        }

        // Generate database configuration
        files.add(generateDatabaseConfig(config.database))

        // Add authentication if requested
        if (config.authentication) {
            files.addAll(generateAuthFiles())
        }

        // Add additional features
        if (Feature.SWAGGER in config.features) {
            files.add(generateSwaggerConfig())
        }
        if (Feature.TESTING in config.features) {
            files.addAll(generateTestFiles())
        }
        if (Feature.LOGGING in config.features) {
            files.add(generateLoggerConfig())
        }

        return GenerateCodeResponse(
            projectName = config.projectName,
            files = files,
            message = "Code generated successfully"
        )
    }

    private fun generatePackageJson(config: ProjectConfig): GeneratedFile {
        val dependencies = mutableMapOf(
            "express" to "^4.18.2",
            "cors" to "^2.8.5",
            "dotenv" to "^16.0.3"
        )

        if (Feature.SWAGGER in config.features) {
            dependencies["swagger-ui-express"] = "^4.6.3"
        }

        val content = """
{
  "name": "${config.projectName}",
  "version": "1.0.0",
  "description": "Generated full stack application",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  },
  "dependencies": ${dependencies.entries.joinToString(",\n    ", "{\n    ", "\n  }") { "\"${it.key}\": \"${it.value}\"" }},
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
        """.trimIndent()

        return GeneratedFile("package.json", content)
    }

    private fun generateDockerfile(): GeneratedFile {
        val content = """
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
        """.trimIndent()

        return GeneratedFile("Dockerfile", content)
    }

    private fun generateDockerCompose(database: DatabaseType): GeneratedFile {
        val dbService = when (database) {
            DatabaseType.POSTGRESQL -> """
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: ${'$'}{DB_USER}
      POSTGRES_PASSWORD: ${'$'}{DB_PASSWORD}
      POSTGRES_DB: ${'$'}{DB_NAME}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
            """.trimIndent()
            DatabaseType.MONGODB -> """
  mongodb:
    image: mongo:6
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${'$'}{DB_USER}
      MONGO_INITDB_ROOT_PASSWORD: ${'$'}{DB_PASSWORD}
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
            """.trimIndent()
            DatabaseType.MYSQL -> """
  mysql:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: ${'$'}{DB_PASSWORD}
      MYSQL_DATABASE: ${'$'}{DB_NAME}
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
            """.trimIndent()
            DatabaseType.REDIS -> """
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
            """.trimIndent()
        }

        val volumeName = when (database) {
            DatabaseType.POSTGRESQL -> "postgres_data"
            DatabaseType.MONGODB -> "mongo_data"
            DatabaseType.MYSQL -> "mysql_data"
            DatabaseType.REDIS -> "redis_data"
        }

        val content = """
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
    depends_on:
      - ${database.name.lowercase()}
$dbService

volumes:
  $volumeName:
        """.trimIndent()

        return GeneratedFile("docker-compose.yml", content)
    }

    private fun generateEnvFile(database: DatabaseType): GeneratedFile {
        val port = when (database) {
            DatabaseType.POSTGRESQL -> "5432"
            DatabaseType.MONGODB -> "27017"
            DatabaseType.MYSQL -> "3306"
            DatabaseType.REDIS -> "6379"
        }

        val content = """
PORT=3001
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=$port
DB_NAME=myapp
DB_USER=admin
DB_PASSWORD=password

# JWT Configuration
JWT_SECRET=your-secret-key-change-this
JWT_EXPIRE=7d

# CORS
ALLOWED_ORIGINS=http://localhost:3000
        """.trimIndent()

        return GeneratedFile(".env.example", content)
    }

    private fun generateReadme(config: ProjectConfig): GeneratedFile {
        val content = """
# ${config.projectName}

Generated ${config.projectType} with ${config.database} database.

## Getting Started

### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- ${config.database}

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Update the .env file with your configuration

### Running with Docker

```bash
docker-compose up -d
```

### Running locally

```bash
npm run dev
```

## API Documentation

The API runs on port 3001 by default.

## License

MIT
        """.trimIndent()

        return GeneratedFile("README.md", content)
    }

    private fun generateRestApiFiles(config: ProjectConfig): List<GeneratedFile> {
        return listOf(
            GeneratedFile("src/routes/api.js", 
                "// REST API Routes\nmodule.exports = router;"),
            GeneratedFile("src/controllers/apiController.js", 
                "// API Controller\nmodule.exports = {};")
        )
    }

    private fun generateGraphQLFiles(config: ProjectConfig): List<GeneratedFile> {
        return listOf(
            GeneratedFile("src/schema/schema.graphql", "type Query { hello: String }"),
            GeneratedFile("src/resolvers/resolvers.js", "// GraphQL Resolvers")
        )
    }

    private fun generateMicroserviceFiles(config: ProjectConfig): List<GeneratedFile> {
        return listOf(
            GeneratedFile("src/services/messageQueue.js", "// Message Queue Service"),
            GeneratedFile("src/handlers/eventHandler.js", "// Event Handler")
        )
    }

    private fun generateCrudAppFiles(config: ProjectConfig): List<GeneratedFile> {
        return listOf(
            GeneratedFile("src/models/User.js", "// User Model"),
            GeneratedFile("src/controllers/userController.js", "// User Controller"),
            GeneratedFile("src/routes/users.js", "// User Routes")
        )
    }

    private fun generateDatabaseConfig(database: DatabaseType): GeneratedFile {
        val content = when (database) {
            DatabaseType.POSTGRESQL -> """
const { Pool } = require('pg');
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});
module.exports = pool;
            """.trimIndent()
            DatabaseType.MONGODB -> """
const mongoose = require('mongoose');
const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
};
module.exports = connectDB;
            """.trimIndent()
            DatabaseType.MYSQL -> """
const mysql = require('mysql2/promise');
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});
module.exports = pool;
            """.trimIndent()
            DatabaseType.REDIS -> """
const redis = require('redis');
const client = redis.createClient({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
});
module.exports = client;
            """.trimIndent()
        }

        return GeneratedFile("src/config/database.js", content)
    }

    private fun generateAuthFiles(): List<GeneratedFile> {
        return listOf(
            GeneratedFile("src/middleware/auth.js", "// Authentication Middleware"),
            GeneratedFile("src/controllers/authController.js", "// Auth Controller"),
            GeneratedFile("src/routes/auth.js", "// Auth Routes")
        )
    }

    private fun generateSwaggerConfig(): GeneratedFile {
        return GeneratedFile("src/config/swagger.js", "// Swagger Configuration")
    }

    private fun generateTestFiles(): List<GeneratedFile> {
        return listOf(
            GeneratedFile("tests/api.test.js", "// API Tests"),
            GeneratedFile("jest.config.js", "// Jest Configuration")
        )
    }

    private fun generateLoggerConfig(): GeneratedFile {
        return GeneratedFile("src/config/logger.js", "// Logger Configuration")
    }
}
