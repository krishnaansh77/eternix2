package ai.aarogyam.api.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import ai.aarogyam.api.domain.EmailVerificationToken;
import ai.aarogyam.api.domain.User;
import ai.aarogyam.api.repository.EmailVerificationTokenRepository;
import ai.aarogyam.api.repository.UserRepository;

@Service
public class EmailVerificationService {

    private static final Logger logger = LoggerFactory.getLogger(EmailVerificationService.class);
    private final SecureRandom secureRandom = new SecureRandom();
    private final EmailVerificationTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final String deliveryMode;
    private final String from;
    private final String verificationUrl;
    private final long expirationMinutes;
    private final long maxResendsPerHour;
    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    public EmailVerificationService(
            EmailVerificationTokenRepository tokenRepository,
            UserRepository userRepository,
            @Value("${aarogyam.mail.delivery-mode}") String deliveryMode,
            @Value("${aarogyam.mail.from}") String from,
            @Value("${aarogyam.mail.verification-url}") String verificationUrl,
            @Value("${aarogyam.mail.verification-expiration-minutes}") long expirationMinutes,
            @Value("${aarogyam.mail.max-resends-per-hour}") long maxResendsPerHour,
            ObjectProvider<JavaMailSender> mailSenderProvider
    ) {
        this.tokenRepository = tokenRepository;
        this.userRepository = userRepository;
        this.deliveryMode = deliveryMode;
        this.from = from;
        this.verificationUrl = verificationUrl.replaceAll("/$", "");
        this.expirationMinutes = expirationMinutes;
        this.maxResendsPerHour = maxResendsPerHour;
        this.mailSenderProvider = mailSenderProvider;
    }

    @Transactional
    public void issue(User user) {
        Instant now = Instant.now();
        if (tokenRepository.countByUser_IdAndCreatedAtAfter(user.getId(), now.minus(1, ChronoUnit.HOURS)) >= maxResendsPerHour) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Too many verification emails requested. Please try again later.");
        }

        tokenRepository.invalidateUnusedForUser(user.getId(), now);
        String rawToken = newToken();
        EmailVerificationToken token = new EmailVerificationToken();
        token.setUser(user);
        token.setTokenHash(hash(rawToken));
        token.setCreatedAt(now);
        token.setExpiresAt(now.plus(expirationMinutes, ChronoUnit.MINUTES));
        tokenRepository.save(token);
        deliver(user, rawToken);
    }

    @Transactional
    public void verify(String rawToken) {
        EmailVerificationToken token = tokenRepository.findByTokenHashAndUsedAtIsNull(hash(rawToken))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "This verification link is invalid or has already been used."));
        if (token.getExpiresAt().isBefore(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This verification link has expired. Please request a new one.");
        }
        token.setUsedAt(Instant.now());
        User user = token.getUser();
        user.setEmailVerified(true);
        userRepository.save(user);
        tokenRepository.save(token);
    }

    private String newToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hash(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
            return java.util.HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable.", exception);
        }
    }

    private void deliver(User user, String rawToken) {
        String link = verificationUrl + "?token=" + rawToken;
        if ("console".equalsIgnoreCase(deliveryMode)) {
            logger.warn("Development verification email for {} from {}: {}", user.getEmail(), from, link);
            return;
        }
        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null) {
            throw new IllegalStateException("SMTP delivery is not configured. Set MAIL_DELIVERY_MODE=console for local development.");
        }
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(user.getEmail());
        message.setSubject("Verify your Aarogyam AI email address");
        message.setText("Welcome to Aarogyam AI. Verify your email address within " + expirationMinutes
                + " minutes to activate your account:\n\n" + link
                + "\n\nIf you did not create this account, you can safely ignore this email.");
        mailSender.send(message);
    }
}
