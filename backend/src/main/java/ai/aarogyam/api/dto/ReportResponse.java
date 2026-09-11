package ai.aarogyam.api.dto;

import java.time.Instant;
import java.util.Map;

import ai.aarogyam.api.domain.ReportStatus;
import ai.aarogyam.api.domain.ReportType;

public record ReportResponse(
        String id,
        String patientId,
        ReportType reportType,
        Instant uploadDate,
        String originalFileName,
        Map<String, Object> predictionResult,
        String doctorCorrection,
        ReportStatus status,
        String reviewedByDoctorId,
        boolean comingSoon
) {
}
