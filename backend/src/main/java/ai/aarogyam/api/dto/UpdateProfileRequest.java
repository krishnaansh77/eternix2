package ai.aarogyam.api.dto;

import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @Size(max = 200) String name,
        @Size(max = 40) String phone,
        @Size(max = 2000) String address,
        @Size(max = 160) String specialization,
        @Size(max = 200) String organization
) {
}
