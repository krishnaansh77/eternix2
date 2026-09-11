package ai.aarogyam.api.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import ai.aarogyam.api.domain.Report;

public interface ReportRepository extends JpaRepository<Report, UUID> {
    List<Report> findByPatient_IdOrderByUploadDateDesc(UUID patientId);
    List<Report> findByPatient_IdInOrderByUploadDateDesc(List<UUID> patientIds);
    List<Report> findAllByOrderByUploadDateDesc();
}
