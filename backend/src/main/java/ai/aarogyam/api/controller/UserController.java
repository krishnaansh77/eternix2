package ai.aarogyam.api.controller;

import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import ai.aarogyam.api.dto.AuthUserResponse;
import ai.aarogyam.api.dto.RelationshipResponse;
import ai.aarogyam.api.domain.Role;
import ai.aarogyam.api.repository.UserRepository;
import ai.aarogyam.api.security.AuthPrincipal;
import ai.aarogyam.api.service.AuthService;
import ai.aarogyam.api.service.DoctorPatientService;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final DoctorPatientService relationshipService;
    private final UserRepository userRepository;

    public UserController(DoctorPatientService relationshipService, UserRepository userRepository) {
        this.relationshipService = relationshipService;
        this.userRepository = userRepository;
    }

    @GetMapping("/doctors")
    @PreAuthorize("hasRole('PATIENT')")
    public List<AuthUserResponse> doctors() {
        return userRepository.findByRoleOrderByNameAsc(Role.DOCTOR).stream()
                .map(AuthService::toUserResponse)
                .toList();
    }

    @GetMapping("/patients")
    @PreAuthorize("hasRole('DOCTOR')")
    public List<AuthUserResponse> patients(@AuthenticationPrincipal AuthPrincipal principal) {
        return relationshipService.patients(principal).stream()
                .map(RelationshipResponse::patient)
                .toList();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('DOCTOR')")
    public AuthUserResponse patient(
            @AuthenticationPrincipal AuthPrincipal principal,
            @PathVariable String id
    ) {
        var patient = relationshipService.requireAccessiblePatient(principal, id);
        return AuthService.toUserResponse(patient);
    }
}
