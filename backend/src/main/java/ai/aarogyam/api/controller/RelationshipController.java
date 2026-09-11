package ai.aarogyam.api.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import ai.aarogyam.api.dto.CreateRelationshipRequest;
import ai.aarogyam.api.dto.RelationshipDecisionRequest;
import ai.aarogyam.api.dto.RelationshipResponse;
import ai.aarogyam.api.security.AuthPrincipal;
import ai.aarogyam.api.service.DoctorPatientService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/relationships")
public class RelationshipController {

    private final DoctorPatientService relationshipService;

    public RelationshipController(DoctorPatientService relationshipService) {
        this.relationshipService = relationshipService;
    }

    @PostMapping("/requests")
    public ResponseEntity<RelationshipResponse> request(
            @AuthenticationPrincipal AuthPrincipal principal,
            @Valid @RequestBody CreateRelationshipRequest request
    ) {
        return ResponseEntity.ok(relationshipService.request(principal, request));
    }

    @GetMapping("/requests")
    public List<RelationshipResponse> pendingRequests(@AuthenticationPrincipal AuthPrincipal principal) {
        return relationshipService.pendingRequests(principal);
    }

    @PatchMapping("/{relationshipId}")
    public ResponseEntity<RelationshipResponse> decide(
            @AuthenticationPrincipal AuthPrincipal principal,
            @PathVariable String relationshipId,
            @RequestBody RelationshipDecisionRequest request
    ) {
        return ResponseEntity.ok(relationshipService.decide(principal, relationshipId, request));
    }

    @GetMapping("/patients")
    public List<RelationshipResponse> patients(@AuthenticationPrincipal AuthPrincipal principal) {
        return relationshipService.patients(principal);
    }

    @GetMapping("/doctors")
    public List<RelationshipResponse> doctors(@AuthenticationPrincipal AuthPrincipal principal) {
        return relationshipService.doctors(principal);
    }
}
