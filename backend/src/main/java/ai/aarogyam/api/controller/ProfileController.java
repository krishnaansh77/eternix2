package ai.aarogyam.api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import ai.aarogyam.api.dto.ProfileResponse;
import ai.aarogyam.api.dto.UpdateProfileRequest;
import ai.aarogyam.api.security.AuthPrincipal;
import ai.aarogyam.api.service.ProfileService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping("/me")
    public ProfileResponse me(@AuthenticationPrincipal AuthPrincipal principal) {
        return profileService.me(principal);
    }

    @PatchMapping("/me")
    public ResponseEntity<ProfileResponse> update(
            @AuthenticationPrincipal AuthPrincipal principal,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        return ResponseEntity.ok(profileService.update(principal, request));
    }
}
