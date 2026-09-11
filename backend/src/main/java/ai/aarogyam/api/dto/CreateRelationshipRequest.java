package ai.aarogyam.api.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateRelationshipRequest(@NotBlank String doctorUserId) {
}
