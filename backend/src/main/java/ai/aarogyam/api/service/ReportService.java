package ai.aarogyam.api.service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import ai.aarogyam.api.domain.Report;
import ai.aarogyam.api.domain.ReportStatus;
import ai.aarogyam.api.domain.ReportType;
import ai.aarogyam.api.domain.Role;
import ai.aarogyam.api.domain.User;
import ai.aarogyam.api.dto.DoctorReviewRequest;
import ai.aarogyam.api.dto.ReportResponse;
import ai.aarogyam.api.repository.ReportRepository;
import ai.aarogyam.api.repository.UserRepository;
import ai.aarogyam.api.security.AuthPrincipal;

@Service
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final InferenceService inferenceService;
    private final ObjectMapper objectMapper;
    private final DoctorPatientService relationshipService;

    public ReportService(
            ReportRepository reportRepository,
            UserRepository userRepository,
            FileStorageService fileStorageService,
            InferenceService inferenceService,
            ObjectMapper objectMapper,
            DoctorPatientService relationshipService
    ) {
        this.reportRepository = reportRepository;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
        this.inferenceService = inferenceService;
        this.objectMapper = objectMapper;
        this.relationshipService = relationshipService;
    }

    public ReportResponse upload(AuthPrincipal principal, MultipartFile file, ReportType reportType, String patientId) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A report file is required.");
        }

        User ownerPatient = resolvePatient(principal, patientId);
        Report report = new Report();
        report.setPatient(ownerPatient);
        report.setReportType(reportType);
        report.setUploadDate(Instant.now());
        report.setOriginalFileName(file.getOriginalFilename());
        report.setFilePath(fileStorageService.store(file));
        report.setStatus(ReportStatus.PENDING);
        return toResponse(reportRepository.save(report));
    }

    public List<ReportResponse> listForPatient(AuthPrincipal principal, String patientId) {
        assertCanReadPatient(principal, patientId);
        UUID parsedPatientId = parseId(patientId, "Patient not found.");
        if (!userRepository.existsById(parsedPatientId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient not found.");
        }
        return reportRepository.findByPatient_IdOrderByUploadDateDesc(parsedPatientId).stream()
                .map(this::toResponse)
                .toList();
    }

    public List<ReportResponse> listMine(AuthPrincipal principal) {
        if (principal.getRole() == Role.DOCTOR) {
            List<UUID> patientIds = relationshipService.accessiblePatientUserIds(principal.getUserId());
            if (patientIds.isEmpty()) {
                return List.of();
            }
            return reportRepository.findByPatient_IdInOrderByUploadDateDesc(patientIds).stream()
                    .map(this::toResponse)
                    .toList();
        }
        return listForPatient(principal, principal.getUserId());
    }

    public ReportResponse predict(AuthPrincipal principal, String reportId) {
        requireDoctor(principal);
        Report report = getReport(reportId);
        assertCanReadPatient(principal, report.getPatient().getId().toString());
        if (report.getReportType() == ReportType.ECG
                || report.getReportType() == ReportType.MRI
                || report.getReportType() == ReportType.OTHER) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_IMPLEMENTED,
                    comingSoonMessage(report.getReportType())
            );
        }
        try {
            report.setPredictionResult(writePrediction(inferenceService.predict(report)));
            report.setStatus(ReportStatus.PREDICTED);
            return toResponse(reportRepository.save(report));
        } catch (UnsupportedOperationException exception) {
            throw new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED, exception.getMessage());
        }
    }

    public ReportResponse review(AuthPrincipal principal, String reportId, DoctorReviewRequest request) {
        requireDoctor(principal);
        request.validate();
        Report report = getReport(reportId);
        assertCanReadPatient(principal, report.getPatient().getId().toString());
        report.setReviewedByDoctor(userRepository.findById(parseId(principal.getUserId(), "Session is no longer valid."))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Session is no longer valid.")));
        if (request.confirmed()) {
            report.setStatus(ReportStatus.CONFIRMED);
            report.setDoctorCorrection(request.correction());
        } else {
            report.setStatus(ReportStatus.CORRECTED);
            report.setDoctorCorrection(request.correction());
        }
        return toResponse(reportRepository.save(report));
    }

    private Report getReport(String reportId) {
        return reportRepository.findById(parseId(reportId, "Report not found."))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Report not found."));
    }

    private User resolvePatient(AuthPrincipal principal, String patientId) {
        if (principal.getRole() == Role.PATIENT) {
            return userRepository.findById(parseId(principal.getUserId(), "Session is no longer valid."))
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Session is no longer valid."));
        }
        if (patientId == null || patientId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "patientId is required when a doctor uploads a report.");
        }
        return relationshipService.requireAccessiblePatient(principal, patientId);
    }

    private void assertCanReadPatient(AuthPrincipal principal, String patientId) {
        if (principal.getRole() == Role.DOCTOR) {
            relationshipService.requireAccessiblePatient(principal, patientId);
            return;
        }
        if (!principal.getUserId().equals(patientId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Patients can only access their own reports.");
        }
    }

    private void requireDoctor(AuthPrincipal principal) {
        if (principal.getRole() != Role.DOCTOR) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This action is limited to doctors.");
        }
    }

    private ReportResponse toResponse(Report report) {
        boolean comingSoon = report.getReportType() == ReportType.ECG
                || report.getReportType() == ReportType.MRI
                || report.getReportType() == ReportType.OTHER;
        return new ReportResponse(
                report.getId().toString(),
                report.getPatient().getId().toString(),
                report.getReportType(),
                report.getUploadDate(),
                report.getOriginalFileName(),
                readPrediction(report.getPredictionResult()),
                report.getDoctorCorrection(),
                report.getStatus(),
                report.getReviewedByDoctor() == null ? null : report.getReviewedByDoctor().getId().toString(),
                comingSoon
        );
    }

    private UUID parseId(String value, String message) {
        try {
            return UUID.fromString(value);
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
        }
    }

    private String writePrediction(Map<String, Object> prediction) {
        try {
            return objectMapper.writeValueAsString(prediction);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Unable to save prediction result.", exception);
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> readPrediction(String prediction) {
        if (prediction == null || prediction.isBlank()) {
            return null;
        }
        try {
            return objectMapper.readValue(prediction, Map.class);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Stored prediction result could not be read.", exception);
        }
    }

    public static String comingSoonMessage(ReportType type) {
        return switch (type) {
            case ECG -> "ECG analysis is coming soon";
            case MRI -> "MRI analysis is coming soon";
            case OTHER -> "This report type is coming soon";
            default -> type.name() + " analysis is coming soon";
        };
    }
}
