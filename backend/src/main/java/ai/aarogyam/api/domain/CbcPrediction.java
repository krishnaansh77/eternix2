package ai.aarogyam.api.domain;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "cbc_predictions")
public class CbcPrediction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cbc_report_id", nullable = false, unique = true)
    private CbcReport cbcReport;

    @Column(name = "predicted_class", nullable = false)
    private String predictedClass;
    @Column(precision = 8, scale = 6)
    private BigDecimal confidence;
    private String severity;
    @Column(name = "probabilities_json", columnDefinition = "jsonb")
    private String probabilitiesJson;
    @Column(name = "contributing_features_json", columnDefinition = "jsonb")
    private String contributingFeaturesJson;
    @Column(name = "assessment_json", columnDefinition = "jsonb")
    private String assessmentJson;
    @Column(name = "model_version", nullable = false)
    private String modelVersion;
    @Column(nullable = false, name = "created_at", updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() { createdAt = Instant.now(); }

    public UUID getId() { return id; }
    public CbcReport getCbcReport() { return cbcReport; }
    public void setCbcReport(CbcReport cbcReport) { this.cbcReport = cbcReport; }
    public String getPredictedClass() { return predictedClass; }
    public void setPredictedClass(String predictedClass) { this.predictedClass = predictedClass; }
    public BigDecimal getConfidence() { return confidence; }
    public void setConfidence(BigDecimal confidence) { this.confidence = confidence; }
    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }
    public String getProbabilitiesJson() { return probabilitiesJson; }
    public void setProbabilitiesJson(String probabilitiesJson) { this.probabilitiesJson = probabilitiesJson; }
    public String getContributingFeaturesJson() { return contributingFeaturesJson; }
    public void setContributingFeaturesJson(String contributingFeaturesJson) { this.contributingFeaturesJson = contributingFeaturesJson; }
    public String getAssessmentJson() { return assessmentJson; }
    public void setAssessmentJson(String assessmentJson) { this.assessmentJson = assessmentJson; }
    public String getModelVersion() { return modelVersion; }
    public void setModelVersion(String modelVersion) { this.modelVersion = modelVersion; }
    public Instant getCreatedAt() { return createdAt; }
}
