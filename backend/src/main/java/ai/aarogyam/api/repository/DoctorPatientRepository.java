package ai.aarogyam.api.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import ai.aarogyam.api.domain.DoctorPatient;
import ai.aarogyam.api.domain.RelationshipStatus;

public interface DoctorPatientRepository extends JpaRepository<DoctorPatient, UUID> {
    Optional<DoctorPatient> findByDoctor_IdAndPatient_Id(UUID doctorId, UUID patientId);
    List<DoctorPatient> findByDoctor_User_IdAndStatusOrderByUpdatedAtDesc(UUID doctorUserId, RelationshipStatus status);
    List<DoctorPatient> findByPatient_User_IdOrderByUpdatedAtDesc(UUID patientUserId);
    boolean existsByDoctor_User_IdAndPatient_User_IdAndStatus(UUID doctorUserId, UUID patientUserId, RelationshipStatus status);
}
