package ai.aarogyam.api.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import ai.aarogyam.api.domain.CbcReport;

public interface CbcReportRepository extends JpaRepository<CbcReport, UUID> {
    List<CbcReport> findByPatient_User_IdOrderByCreatedAtDesc(UUID patientUserId);
}
