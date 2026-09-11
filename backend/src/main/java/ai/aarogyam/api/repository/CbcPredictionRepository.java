package ai.aarogyam.api.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import ai.aarogyam.api.domain.CbcPrediction;

public interface CbcPredictionRepository extends JpaRepository<CbcPrediction, UUID> {
    List<CbcPrediction> findByCbcReport_Patient_User_IdOrderByCreatedAtDesc(UUID patientUserId);
}
