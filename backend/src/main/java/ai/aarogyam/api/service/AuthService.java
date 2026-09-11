package ai.aarogyam.api.service;

import java.time.Instant;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import ai.aarogyam.api.domain.User;
import ai.aarogyam.api.dto.AuthResponse;
import ai.aarogyam.api.dto.AuthUserResponse;
import ai.aarogyam.api.dto.LoginRequest;
import ai.aarogyam.api.dto.RegisterRequest;
import ai.aarogyam.api.dto.ResendVerificationRequest;
import ai.aarogyam.api.dto.VerifyEmailRequest;
import ai.aarogyam.api.repository.UserRepository;
import ai.aarogyam.api.security.JwtService;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailVerificationService emailVerificationService;
    private final ProfileService profileService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            EmailVerificationService emailVerificationService,
            ProfileService profileService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.emailVerificationService = emailVerificationService;
        this.profileService = profileService;
    }

    public AuthUserResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists.");
        }

        User user = new User();
        user.setName(request.name().trim());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(request.role());
        user.setCreatedAt(Instant.now());
        User saved = userRepository.save(user);
        profileService.createForUser(saved);
        emailVerificationService.issue(saved);
        return toUserResponse(saved);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.email().trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password."));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password.");
        }
        if (!user.isEmailVerified()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Please verify your email address before signing in.");
        }

        user.setLastLogin(Instant.now());
        userRepository.save(user);
        String token = jwtService.createToken(user.getId().toString(), user.getRole());
        return new AuthResponse(token, toUserResponse(user));
    }

    public AuthUserResponse me(String userId) {
        User user = userRepository.findById(parseUserId(userId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Session is no longer valid."));
        return toUserResponse(user);
    }

    public void resendVerification(ResendVerificationRequest request) {
        userRepository.findByEmailIgnoreCase(request.email().trim())
                .filter(user -> !user.isEmailVerified())
                .ifPresent(emailVerificationService::issue);
    }

    public void verifyEmail(VerifyEmailRequest request) {
        emailVerificationService.verify(request.token());
    }

    public static AuthUserResponse toUserResponse(User user) {
        return new AuthUserResponse(user.getId().toString(), user.getName(), user.getEmail(), user.getRole());
    }

    private UUID parseUserId(String userId) {
        try {
            return UUID.fromString(userId);
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Session is no longer valid.");
        }
    }
}
