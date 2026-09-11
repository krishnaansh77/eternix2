package ai.aarogyam.api.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import ai.aarogyam.api.dto.AuthResponse;
import ai.aarogyam.api.dto.AuthUserResponse;
import ai.aarogyam.api.dto.LoginRequest;
import ai.aarogyam.api.dto.MessageResponse;
import ai.aarogyam.api.dto.RegisterRequest;
import ai.aarogyam.api.dto.ResendVerificationRequest;
import ai.aarogyam.api.dto.VerifyEmailRequest;
import ai.aarogyam.api.security.AuthPrincipal;
import ai.aarogyam.api.security.JwtAuthFilter;
import ai.aarogyam.api.service.AuthService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@Validated
public class AuthController {

    private final AuthService authService;
    private final boolean secureCookie;

    public AuthController(AuthService authService, @Value("${aarogyam.jwt.cookie-secure}") boolean secureCookie) {
        this.authService = authService;
        this.secureCookie = secureCookie;
    }

    @PostMapping("/register")
    public ResponseEntity<MessageResponse> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.ok(new MessageResponse("Account created. Check your email to verify your account before signing in."));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse body = authService.login(request);
        ResponseCookie.ResponseCookieBuilder cookieBuilder = ResponseCookie.from(JwtAuthFilter.COOKIE_NAME, body.token())
                .httpOnly(true)
                .secure(secureCookie)
                .sameSite("Strict")
                .path("/");
        if (Boolean.TRUE.equals(request.remember())) {
            cookieBuilder.maxAge(60L * 60L * 24L);
        }
        ResponseCookie cookie = cookieBuilder.build();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(body);
    }

    @PostMapping("/verify-email")
    public ResponseEntity<MessageResponse> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        authService.verifyEmail(request);
        return ResponseEntity.ok(new MessageResponse("Email verified. You can now sign in."));
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<MessageResponse> resendVerification(@Valid @RequestBody ResendVerificationRequest request) {
        authService.resendVerification(request);
        return ResponseEntity.ok(new MessageResponse("If that account needs verification, a new email has been sent."));
    }

    @GetMapping("/me")
    public AuthUserResponse me(@AuthenticationPrincipal AuthPrincipal principal) {
        return authService.me(principal.getUserId());
    }

    @PostMapping("/logout")
    public ResponseEntity<MessageResponse> logout() {
        ResponseCookie cookie = ResponseCookie.from(JwtAuthFilter.COOKIE_NAME, "")
                .httpOnly(true)
                .secure(secureCookie)
                .sameSite("Strict")
                .path("/")
                .maxAge(0)
                .build();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(new MessageResponse("Signed out."));
    }
}
