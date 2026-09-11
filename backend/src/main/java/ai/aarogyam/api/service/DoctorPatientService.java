package ai.aarogyam.api.service;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import ai.aarogyam.api.domain.DoctorPatient;
import ai.aarogyam.api.domain.DoctorProfile;
import ai.aarogyam.api.domain.PatientProfile;
import ai.aarogyam.api.domain.RelationshipStatus;
import ai.aarogyam.api.domain.Role;
import ai.aarogyam.api.domain.User;
import ai.aarogyam.api.dto.CreateRelationshipRequest;
import ai.aarogyam.api.dto.RelationshipDecisionRequest;
import ai.aarogyam.api.dto.RelationshipResponse;
import ai.aarogyam.api.repository.DoctorPatientRepository;
import ai.aarogyam.api.repository.DoctorProfileRepository;
import ai.aarogyam.api.repository.PatientProfileRepository;
import ai.aarogyam.api.repository.UserRepository;
import ai.aarogyam.api.security.AuthPrincipal;

@Service
public class DoctorPatientService {

    private final DoctorPatientRepository relationshipRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final UserRepository userRepository;

    public DoctorPatientService(
            DoctorPatientRepository relationshipRepository,
            DoctorProfileRepository doctorProfileRepository,
            PatientProfileRepository patientProfileRepository,
            UserRepository userRepository
    ) {
        this.relationshipRepository = relationshipRepository;
        this.doctorProfileRepository = doctorProfileRepository;
        this.patientProfileRepository = patientProfileRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public RelationshipResponse request(AuthPrincipal principal, CreateRelationshipRequest request) {
        User patientUser = requireUser(principal, Role.PATIENT);
        DoctorProfile doctor = doctorProfileRepository.findByUser_Id(parseId(request.doctorUserId(), "Doctor not found."))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Doctor not found."));
        PatientProfile patient = patientProfileRepository.findByUser_Id(patientUser.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient profile not found."));

        DoctorPatient relationship = relationshipRepository.findByDoctor_IdAndPatient_Id(doctor.getId(), patient.getId())
                .orElseGet(DoctorPatient::new);
        relationship.setDoctor(doctor);
        relationship.setPatient(patient);
        relationship.setStatus(RelationshipStatus.PENDING);
        return toResponse(relationshipRepository.save(relationship));
    }

    @Transactional
    public RelationshipResponse decide(AuthPrincipal principal, String relationshipId, RelationshipDecisionRequest request) {
        User doctorUser = requireUser(principal, Role.DOCTOR);
        DoctorPatient relationship = relationshipRepository.findById(parseId(relationshipId, "Connection request not found."))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Connection request not found."));
        if (!relationship.getDoctor().getUser().getId().equals(doctorUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot manage this connection request.");
        }
        if (relationship.getStatus() != RelationshipStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This connection request has already been handled.");
        }
        relationship.setStatus(request.accepted() ? RelationshipStatus.ACTIVE : RelationshipStatus.REJECTED);
        return toResponse(relationshipRepository.save(relationship));
    }

    @Transactional(readOnly = true)
    public List<RelationshipResponse> patients(AuthPrincipal principal) {
        User doctor = requireUser(principal, Role.DOCTOR);
        return relationshipRepository.findByDoctor_User_IdAndStatusOrderByUpdatedAtDesc(doctor.getId(), RelationshipStatus.ACTIVE)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<RelationshipResponse> pendingRequests(AuthPrincipal principal) {
        User doctor = requireUser(principal, Role.DOCTOR);
        return relationshipRepository.findByDoctor_User_IdAndStatusOrderByUpdatedAtDesc(doctor.getId(), RelationshipStatus.PENDING)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<RelationshipResponse> doctors(AuthPrincipal principal) {
        User patient = requireUser(principal, Role.PATIENT);
        return relationshipRepository.findByPatient_User_IdOrderByUpdatedAtDesc(patient.getId())
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public boolean canAccess(String doctorUserId, String patientUserId) {
        return relationshipRepository.existsByDoctor_User_IdAndPatient_User_IdAndStatus(
                parseId(doctorUserId, "Session is no longer valid."),
                parseId(patientUserId, "Patient not found."),
                RelationshipStatus.ACTIVE
        );
    }

    @Transactional(readOnly = true)
    public List<UUID> accessiblePatientUserIds(String doctorUserId) {
        UUID doctorId = parseId(doctorUserId, "Session is no longer valid.");
        return relationshipRepository.findByDoctor_User_IdAndStatusOrderByUpdatedAtDesc(doctorId, RelationshipStatus.ACTIVE)
                .stream().map(relationship -> relationship.getPatient().getUser().getId()).toList();
    }

    @Transactional(readOnly = true)
    public User requireAccessiblePatient(AuthPrincipal principal, String patientUserId) {
        UUID patientId = parseId(patientUserId, "Patient not found.");
        User patient = userRepository.findById(patientId)
                .filter(user -> user.getRole() == Role.PATIENT)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient not found."));
        if (principal.getRole() == Role.DOCTOR && !canAccess(principal.getUserId(), patientUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have access to this patient's records.");
        }
        if (principal.getRole() == Role.PATIENT && !principal.getUserId().equals(patientUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Patients can only access their own records.");
        }
        return patient;
    }

    private User requireUser(AuthPrincipal principal, Role role) {
        if (principal.getRole() != role) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This action is not available for your account type.");
        }
        return userRepository.findById(parseId(principal.getUserId(), "Session is no longer valid."))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Session is no longer valid."));
    }

    private RelationshipResponse toResponse(DoctorPatient relationship) {
        return new RelationshipResponse(
                relationship.getId().toString(), relationship.getStatus(),
                AuthService.toUserResponse(relationship.getDoctor().getUser()),
                AuthService.toUserResponse(relationship.getPatient().getUser())
        );
    }

    private UUID parseId(String id, String message) {
        try {
            return UUID.fromString(id);
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
        }
    }
}
