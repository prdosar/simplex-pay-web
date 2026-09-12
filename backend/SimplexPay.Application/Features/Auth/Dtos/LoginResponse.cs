namespace SimplexPay.Application.Features.Auth.Dtos;

// Réponse du premier POST /api/auth/login — password OK, code 2FA envoyé par email.
// Le frontend doit alors appeler POST /api/auth/login-verify avec le code reçu.
public record LoginResponse(
    bool RequiresTwoFactor,
    string Email,
    int CodeExpiryMinutes
);
