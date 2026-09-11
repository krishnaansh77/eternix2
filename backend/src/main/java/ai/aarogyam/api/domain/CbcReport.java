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
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "cbc_reports")
public class CbcReport {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private PatientProfile patient;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "submitted_by", nullable = false)
    private User submittedBy;

    @Column(nullable = false)
    private int age;
    @Column(nullable = false, precision = 8, scale = 2)
    private BigDecimal height;
    @Column(nullable = false, precision = 8, scale = 2)
    private BigDecimal weight;
    @Column(nullable = false, precision = 8, scale = 2)
    private BigDecimal bmi;
    private BigDecimal hb;
    private BigDecimal rbc;
    private BigDecimal wbc;
    private BigDecimal platelets;
    private BigDecimal neutrophils;
    private BigDecimal lymphocytes;
    private BigDecimal monocytes;
    private BigDecimal eosinophils;
    private BigDecimal basophils;
    private BigDecimal mcv;
    private BigDecimal mch;
    private BigDecimal mchc;
    private BigDecimal rdw;
    @Column(nullable = false)
    private String source;
    private String notes;
    @Column(nullable = false, name = "created_at", updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() { createdAt = Instant.now(); }

    public UUID getId() { return id; }
    public PatientProfile getPatient() { return patient; }
    public void setPatient(PatientProfile patient) { this.patient = patient; }
    public User getSubmittedBy() { return submittedBy; }
    public void setSubmittedBy(User submittedBy) { this.submittedBy = submittedBy; }
    public int getAge() { return age; }
    public void setAge(int age) { this.age = age; }
    public BigDecimal getHeight() { return height; }
    public void setHeight(BigDecimal height) { this.height = height; }
    public BigDecimal getWeight() { return weight; }
    public void setWeight(BigDecimal weight) { this.weight = weight; }
    public BigDecimal getBmi() { return bmi; }
    public void setBmi(BigDecimal bmi) { this.bmi = bmi; }
    public BigDecimal getHb() { return hb; }
    public void setHb(BigDecimal hb) { this.hb = hb; }
    public BigDecimal getRbc() { return rbc; }
    public void setRbc(BigDecimal rbc) { this.rbc = rbc; }
    public BigDecimal getWbc() { return wbc; }
    public void setWbc(BigDecimal wbc) { this.wbc = wbc; }
    public BigDecimal getPlatelets() { return platelets; }
    public void setPlatelets(BigDecimal platelets) { this.platelets = platelets; }
    public BigDecimal getNeutrophils() { return neutrophils; }
    public void setNeutrophils(BigDecimal neutrophils) { this.neutrophils = neutrophils; }
    public BigDecimal getLymphocytes() { return lymphocytes; }
    public void setLymphocytes(BigDecimal lymphocytes) { this.lymphocytes = lymphocytes; }
    public BigDecimal getMonocytes() { return monocytes; }
    public void setMonocytes(BigDecimal monocytes) { this.monocytes = monocytes; }
    public BigDecimal getEosinophils() { return eosinophils; }
    public void setEosinophils(BigDecimal eosinophils) { this.eosinophils = eosinophils; }
    public BigDecimal getBasophils() { return basophils; }
    public void setBasophils(BigDecimal basophils) { this.basophils = basophils; }
    public BigDecimal getMcv() { return mcv; }
    public void setMcv(BigDecimal mcv) { this.mcv = mcv; }
    public BigDecimal getMch() { return mch; }
    public void setMch(BigDecimal mch) { this.mch = mch; }
    public BigDecimal getMchc() { return mchc; }
    public void setMchc(BigDecimal mchc) { this.mchc = mchc; }
    public BigDecimal getRdw() { return rdw; }
    public void setRdw(BigDecimal rdw) { this.rdw = rdw; }
    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public Instant getCreatedAt() { return createdAt; }
}
