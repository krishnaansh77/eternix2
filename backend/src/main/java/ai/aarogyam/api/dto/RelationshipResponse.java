package ai.aarogyam.api.dto;

import ai.aarogyam.api.domain.RelationshipStatus;

public record RelationshipResponse(
        String id,
        RelationshipStatus status,
        AuthUserResponse doctor,
        AuthUserResponse patient
) {
}
