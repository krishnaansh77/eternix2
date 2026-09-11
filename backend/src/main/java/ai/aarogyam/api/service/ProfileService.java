package ai.aarogyam.api.service;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import ai.aarogyam.api.domain.DoctorProfile;
import ai.aarogyam.api.domain.PatientProfile;
import ai.aarogyam.api.domain.Role;
import ai.aarogyam.api.domain.User;
import ai.aarogyam.api.dto.ProfileResponse;
import ai.aarogyam.api.dto.UpdateProfileRequest;
import ai.aarogyam.api.repository.DoctorProfileRepository;
import ai.aarogyam.api.repository.PatientProfileRepository;
import ai.aarogyam.api.repository.UserRepository;
import ai.aarogyam.api.security.AuthPrincipal;

@Service
public class ProfileService {

    private final UserRepository userRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final DoctorProfileRepository doctorProfileRepository;

    public ProfileService(
            UserRepository userRepository,
            PatientProfileRepository patientProfileRepository,
            DoctorProfileRepository doctorProfileRepository
    ) {
        this.userRepository = userRepository;
        this.patientProfileRepository = patientProfileRepository;
        this.doctorProfileRepository = doctorProfileRepository;
    }

    @Transactional
    public void createForUser(User user) {
        String[] names = splitName(user.getName());
        if (user.getRole() == Role.PATIENT) {
            PatientProfile profile = new PatientProfile();
            profile.setUser(user);
            profile.setFirstName(names[0]);
            profile.setLastName(names[1]);
            patientProfileRepository.save(profile);
            return;
        }
        DoctorProfile profile = new DoctorProfile();
        profile.setUser(user);
        profile.setFirstName(names[0]);
        profile.setLastName(names[1]);
        doctorProfileRepository.save(profile);
    }

    @Transactional(readOnly = true)
    public ProfileResponse me(AuthPrincipal principal) {
        return toResponse(getUser(principal.getUserId()));
    }

    @Transactional
    public ProfileResponse update(AuthPrincipal principal, UpdateProfileRequest request) {
        User user = getUser(principal.getUserId());
        if (hasText(request.name())) {
            user.setName(request.name().trim());
        }

        if (user.getRole() == Role.PATIENT) {
            PatientProfile profile = patientProfileRepository.findByUser_Id(user.getId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient profile not found."));
            if (hasText(request.phone())) profile.setPhone(request.phone().trim());
            if (hasText(request.address())) profile.setAddress(request.address().trim());
        } else {
            DoctorProfile profile = doctorProfileRepository.findByUser_Id(user.getId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Doctor profile not found."));
            if (hasText(request.phone())) profile.setPhone(request.phone().trim());
            if (hasText(request.specialization())) profile.setSpecialization(request.specialization().trim());
            if (hasText(request.organization())) profile.setOrganization(request.organization().trim());
        }
        return toResponse(user);
    }

    @Transactional(readOnly = true)
    public ProfileResponse toResponse(User user) {
        if (user.getRole() == Role.PATIENT) {
            PatientProfile profile = patientProfileRepository.findByUser_Id(user.getId()).orElse(null);
            return new ProfileResponse(
                    user.getId().toString(), user.getName(), user.getEmail(), user.getRole(),
                    profile == null ? null : profile.getPhone(),
                    profile == null ? null : profile.getAddress(), null, null
            );
        }
        DoctorProfile profile = doctorProfileRepository.findByUser_Id(user.getId()).orElse(null);
        return new ProfileResponse(
                user.getId().toString(), user.getName(), user.getEmail(), user.getRole(),
                profile == null ? null : profile.getPhone(), null,
                profile == null ? null : profile.getSpecialization(),
                profile == null ? null : profile.getOrganization()
        );
    }

    private User getUser(String userId) {
        return userRepository.findById(parseId(userId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Session is no longer valid."));
    }

    private UUID parseId(String id) {
        try {
            return UUID.fromString(id);
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Session is no longer valid.");
        }
    }

    private String[] splitName(String name) {
        String[] pieces = name.trim().split("\\s+", 2);
        return new String[] { pieces[0], pieces.length > 1 ? pieces[1] : "" };
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
