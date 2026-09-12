using System.Security.Cryptography;
using FluentValidation;
using MediatR;
using Microsoft.Extensions.Configuration;
using SimplexPay.Application.Common.Exceptions;
using SimplexPay.Application.Features.Auth.Dtos;
using SimplexPay.Application.Interfaces;
using SimplexPay.Domain.Enums;

namespace SimplexPay.Application.Features.Auth.Commands;

// Étape 1 du login avec 2FA email : vérifier email+password, générer un code 6 chiffres,
// l'envoyer par email, ne PAS émettre de token. Le front doit ensuite appeler
// VerifyLoginCommand (POST /api/auth/login-verify) avec le code reçu.
public record LoginCommand(string Email, string Password) : IRequest<LoginResponse>;

public class LoginCommandValidator : AbstractValidator<LoginCommand>
{
    public LoginCommandValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty();
    }
}

public class LoginCommandHandler(
    IUserRepository userRepo,
    IPasswordHasher passwordHasher,
    IEmailService emailService,
    IConfiguration config
) : IRequestHandler<LoginCommand, LoginResponse>
{
    public async Task<LoginResponse> Handle(LoginCommand request, CancellationToken ct)
    {
        var user = await userRepo.GetByEmailAsync(request.Email, ct)
            ?? throw new UnauthorizedException();

        if (!passwordHasher.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedException();

        if (user.Status == UserStatus.Suspended)
            throw new ForbiddenException("Votre compte est suspendu.");

        if (user.Status == UserStatus.Banned)
            throw new ForbiddenException("Votre compte a été banni.");

        // Génère et enregistre le code 2FA (invalide l'ancien s'il existait).
        var code = GenerateSixDigitCode();
        var codeHash = passwordHasher.Hash(code);
        var expiryMinutes = int.TryParse(config["App:TwoFactorCodeExpiryMinutes"], out var m) ? m : 10;
        user.SetTwoFactorCode(codeHash, DateTime.UtcNow.AddMinutes(expiryMinutes));
        await userRepo.SaveChangesAsync(ct);

        // Envoi email — si SMTP tombe, remonte 500 (le user attendrait un code jamais arrivé).
        var subject = "Votre code de connexion SimplexPay";
        var body = BuildEmailBody(user.FirstName, code, expiryMinutes);
        await emailService.SendEmailAsync(user.Email, subject, body);

        return new LoginResponse(RequiresTwoFactor: true, Email: user.Email, CodeExpiryMinutes: expiryMinutes);
    }

    private static string GenerateSixDigitCode()
    {
        var n = RandomNumberGenerator.GetInt32(0, 1_000_000);
        return n.ToString("D6");
    }

    private static string BuildEmailBody(string firstName, string code, int expiryMinutes) => $$"""
        <div style="font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8fafc; color: #0f172a;">
          <div style="text-align: center; margin-bottom: 24px;">
            <span style="font-size: 24px; font-weight: 800;"><span style="color: #0d9488;">Simplex</span><span style="color: #0f172a;">Pay</span></span>
          </div>
          <div style="background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px;">
            <h1 style="font-size: 20px; margin: 0 0 12px;">Bonjour {{firstName}},</h1>
            <p style="font-size: 15px; line-height: 1.6; color: #475569; margin: 0 0 24px;">
              Voici votre code de connexion à SimplexPay :
            </p>
            <div style="text-align: center; margin: 24px 0;">
              <span style="display: inline-block; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0d9488; background: #f0fdfa; padding: 16px 24px; border-radius: 12px;">
                {{code}}
              </span>
            </div>
            <p style="font-size: 13px; color: #94a3b8; text-align: center; margin: 0;">
              Ce code expire dans {{expiryMinutes}} minutes.
            </p>
          </div>
          <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 24px;">
            Si vous n'avez pas tenté de vous connecter, ignorez cet email et changez votre mot de passe.
          </p>
        </div>
        """;
}
