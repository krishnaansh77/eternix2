package ai.aarogyam.api.dto;

import ai.aarogyam.api.domain.Role;

public record AuthUserResponse(
        String id,
        String name,
        String email,
        Role role
) {
}
