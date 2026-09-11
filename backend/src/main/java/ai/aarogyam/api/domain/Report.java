package ai.aarogyam.api.domain;

import java.time.Instant;
import java.util.UUID;
import java.util.Map;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "patient_reports")
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private User patient;

    @Column(nullable = false, name = "report_type")
    @Enumerated(EnumType.STRING)
    private ReportType reportType;

    @Column(nullable = false, name = "upload_date")
    private Instant uploadDate;

    @Column(nullable = false, name = "file_path")
    private String filePath;

    @Column(nullable = false, name = "original_file_name")
    private String originalFileName;

    @Column(name = "prediction_result", columnDefinition = "jsonb")
    private String predictionResult;

    @Column(name = "doctor_correction")
    private String doctorCorrection;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private ReportStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by_doctor_id")
    private User reviewedByDoctor;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public User getPatient() {
        return patient;
    }

    public void setPatient(User patient) {
        this.patient = patient;
    }

    public ReportType getReportType() {
        return reportType;
    }

    public void setReportType(ReportType reportType) {
        this.reportType = reportType;
    }

    public Instant getUploadDate() {
        return uploadDate;
    }

    public void setUploadDate(Instant uploadDate) {
        this.uploadDate = uploadDate;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public String getOriginalFileName() {
        return originalFileName;
    }

    public void setOriginalFileName(String originalFileName) {
        this.originalFileName = originalFileName;
    }

    public String getPredictionResult() {
        return predictionResult;
    }

    public void setPredictionResult(String predictionResult) {
        this.predictionResult = predictionResult;
    }

    public String getDoctorCorrection() {
        return doctorCorrection;
    }

    public void setDoctorCorrection(String doctorCorrection) {
        this.doctorCorrection = doctorCorrection;
    }

    public ReportStatus getStatus() {
        return status;
    }

    public void setStatus(ReportStatus status) {
        this.status = status;
    }

    public User getReviewedByDoctor() {
        return reviewedByDoctor;
    }

    public void setReviewedByDoctor(User reviewedByDoctor) {
        this.reviewedByDoctor = reviewedByDoctor;
    }
}
