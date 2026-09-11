package ai.aarogyam.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;

public record AuthResponse(
        @JsonIgnore String token,
        AuthUserResponse user
) {
}
