package ai.aarogyam.api;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class AarogyamApplication {

    public static void main(String[] args) {
        loadLocalEnvFile();
        SpringApplication.run(AarogyamApplication.class, args);
    }

    private static void loadLocalEnvFile() {
        Path envFile = Path.of(".env");
        if (!Files.exists(envFile)) {
            envFile = Path.of("backend/.env");
        }
        if (!Files.exists(envFile)) {
            return;
        }
        try {
            List<String> lines = Files.readAllLines(envFile);
            for (String line : lines) {
                String trimmed = line.trim();
                if (trimmed.isEmpty() || trimmed.startsWith("#") || !trimmed.contains("=")) {
                    continue;
                }
                int split = trimmed.indexOf('=');
                String key = trimmed.substring(0, split).trim();
                String value = trimmed.substring(split + 1).trim();
                if (System.getenv(key) == null && System.getProperty(key) == null) {
                    System.setProperty(key, value);
                }
            }
        } catch (Exception ignored) {
            // Fall back to process environment / application.yml defaults.
        }
    }
}
