package ai.aarogyam.api.repository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import ai.aarogyam.api.domain.EmailVerificationToken;

public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, UUID> {
    Optional<EmailVerificationToken> findByTokenHashAndUsedAtIsNull(String tokenHash);

    long countByUser_IdAndCreatedAtAfter(UUID userId, Instant after);

    @Modifying
    @Query("update EmailVerificationToken token set token.usedAt = :usedAt where token.user.id = :userId and token.usedAt is null")
    void invalidateUnusedForUser(@Param("userId") UUID userId, @Param("usedAt") Instant usedAt);
}
