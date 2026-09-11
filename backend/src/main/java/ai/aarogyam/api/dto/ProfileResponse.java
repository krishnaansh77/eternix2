package ai.aarogyam.api.dto;

import ai.aarogyam.api.domain.Role;

public record ProfileResponse(
        String id,
        String name,
        String email,
        Role role,
        String phone,
        String address,
        String specialization,
        String organization
) {
}
