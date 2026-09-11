package ai.aarogyam.api.controller;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import ai.aarogyam.api.domain.ReportType;
import ai.aarogyam.api.dto.DoctorReviewRequest;
import ai.aarogyam.api.dto.ReportResponse;
import ai.aarogyam.api.security.AuthPrincipal;
import ai.aarogyam.api.service.ReportService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @PostMapping(path = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ReportResponse upload(
            @AuthenticationPrincipal AuthPrincipal principal,
            @RequestPart("file") MultipartFile file,
            @RequestParam("reportType") ReportType reportType,
            @RequestParam(value = "patientId", required = false) String patientId
    ) {
        return reportService.upload(principal, file, reportType, patientId);
    }

    @GetMapping("/mine")
    public List<ReportResponse> mine(@AuthenticationPrincipal AuthPrincipal principal) {
        return reportService.listMine(principal);
    }

    @GetMapping("/patient/{patientId}")
    public List<ReportResponse> patientReports(
            @AuthenticationPrincipal AuthPrincipal principal,
            @PathVariable String patientId
    ) {
        return reportService.listForPatient(principal, patientId);
    }

    @PostMapping("/{reportId}/predict")
    @PreAuthorize("hasRole('DOCTOR')")
    public ReportResponse predict(
            @AuthenticationPrincipal AuthPrincipal principal,
            @PathVariable String reportId
    ) {
        return reportService.predict(principal, reportId);
    }

    @PostMapping("/{reportId}/doctor-review")
    @PreAuthorize("hasRole('DOCTOR')")
    public ReportResponse review(
            @AuthenticationPrincipal AuthPrincipal principal,
            @PathVariable String reportId,
            @Valid @RequestBody DoctorReviewRequest request
    ) {
        return reportService.review(principal, reportId, request);
    }
}
