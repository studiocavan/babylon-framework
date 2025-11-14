package templates.backend.spring.src.main.kotlin.com.`babylon-backend`

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class BabylonApplication

fun main(args: Array<String>) {
    runApplication<BabylonApplication>(*args)
}
