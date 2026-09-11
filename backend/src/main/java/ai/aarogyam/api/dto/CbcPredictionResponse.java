package ai.aarogyam.api.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;

public record CbcPredictionResponse(
        String reportId,
        String patientId,
        Instant createdAt,
        String predictedClass,
        BigDecimal confidence,
        String severity,
        Map<String, Object> probabilities,
        List<Map<String, Object>> contributingFeatures,
        String modelVersion,
        Map<String, Object> assessment
) {
}
