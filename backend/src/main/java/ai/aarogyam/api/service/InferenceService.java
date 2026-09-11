package ai.aarogyam.api.service;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import ai.aarogyam.api.domain.Report;
import ai.aarogyam.api.domain.ReportType;

@Service
public class InferenceService {

    private final RestClient restClient;
    private final String cbcBaseUrl;

    public InferenceService(@Value("${aarogyam.inference.cbc-url}") String cbcBaseUrl) {
        this.cbcBaseUrl = cbcBaseUrl.replaceAll("/$", "");
        this.restClient = RestClient.create();
    }

    public Map<String, Object> predict(Report report) {
        if (report.getReportType() == ReportType.CBC) {
            Map<String, Object> live = tryCbcInference(report);
            if (live != null) {
                return live;
            }
            // TODO: replace with real model inference call
            return stubPrediction(report.getReportType(), "CBC inference service was unavailable.");
        }

        if (report.getReportType() == ReportType.PNEUMOTHORAX) {
            Map<String, Object> live = tryGenericInference(report);
            if (live != null) {
                return live;
            }
            // TODO: replace with real model inference call
            return stubPrediction(report.getReportType(), "Pneumothorax inference service was unavailable.");
        }

        throw new UnsupportedOperationException(report.getReportType().name() + " analysis is coming soon");
    }

    private Map<String, Object> tryCbcInference(Report report) {
        try {
            MultipartBodyBuilder builder = new MultipartBodyBuilder();
            builder.part("file", new FileSystemResource(report.getFilePath()));
            Map<?, ?> parsed = restClient.post()
                    .uri(cbcBaseUrl + "/api/cbc/parse-report")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(builder.build())
                    .retrieve()
                    .body(Map.class);
            if (parsed == null) {
                return null;
            }
            Map<String, Object> result = new LinkedHashMap<>();
            result.put("source", "fastapi");
            result.put("stub", false);
            result.put("module", "CBC");
            result.put("extraction", parsed);
            result.put("summary", "CBC values were extracted. Doctor review of the extracted values is recommended before treating this as a diagnosis.");
            return result;
        } catch (RestClientException ignored) {
            return null;
        }
    }

    private Map<String, Object> tryGenericInference(Report report) {
        try {
            restClient.get()
                    .uri(cbcBaseUrl + "/health")
                    .retrieve()
                    .toBodilessEntity();
            return null;
        } catch (RestClientException ignored) {
            return null;
        }
    }

    private Map<String, Object> stubPrediction(ReportType type, String reason) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("source", "stub");
        result.put("stub", true);
        result.put("module", type.name());
        result.put("summary", "The " + type.name() + " inference service is unavailable; this report requires clinical review.");
        result.put("reason", reason);
        result.put("disclaimer", "AI-generated insight for clinical review. This is not a diagnosis.");
        return result;
    }
}
