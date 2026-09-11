package ai.aarogyam.api.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileStorageService {

    private final Path uploadsDir;

    public FileStorageService(@Value("${aarogyam.uploads-dir}") String uploadsDir) throws IOException {
        this.uploadsDir = Path.of(uploadsDir).toAbsolutePath().normalize();
        Files.createDirectories(this.uploadsDir);
    }

    public String store(MultipartFile file) {
        String original = file.getOriginalFilename() == null ? "report" : file.getOriginalFilename();
        String safeName = original.replaceAll("[^a-zA-Z0-9._-]", "_");
        String filename = UUID.randomUUID() + "-" + safeName;
        Path destination = uploadsDir.resolve(filename);
        try {
            file.transferTo(destination);
        } catch (IOException exception) {
            throw new IllegalStateException("Unable to store uploaded file.", exception);
        }
        return destination.toString();
    }
}
