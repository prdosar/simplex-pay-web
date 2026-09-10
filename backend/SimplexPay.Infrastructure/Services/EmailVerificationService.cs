using System.Security.Cryptography;
using Microsoft.Extensions.Configuration;
using SimplexPay.Application.Interfaces;
using SimplexPay.Domain.Entities;

namespace SimplexPay.Infrastructure.Services;

public class EmailVerificationService(
    IEmailService emailService,
    IPasswordHasher passwordHasher,
    IConfiguration configuration
) : IEmailVerificationService
{
    public async Task IssueCodeAsync(User user, CancellationToken ct = default)
    {
        var code = GenerateSixDigitCode();
        var hash = passwordHasher.Hash(code);
        var expiryMinutes = int.TryParse(configuration["App:EmailVerificationCodeExpiryMinutes"], out var m) ? m : 15;
        var expiresAt = DateTime.UtcNow.AddMinutes(expiryMinutes);

        user.SetEmailVerificationCode(hash, expiresAt);

        var subject = "Votre code de vérification SimplexPay";
        var body = BuildEmailBody(user.FirstName, code, expiryMinutes);
        await emailService.SendEmailAsync(user.Email, subject, body);
    }

    public bool VerifyCode(User user, string providedCode)
    {
        if (string.IsNullOrWhiteSpace(user.EmailVerificationCodeHash)) return false;
        if (user.EmailVerificationCodeExpiresAt is null || user.EmailVerificationCodeExpiresAt < DateTime.UtcNow) return false;

        var maxAttempts = int.TryParse(configuration["App:EmailVerificationMaxAttempts"], out var a) ? a : 5;
        if (user.EmailVerificationAttempts >= maxAttempts) return false;

        return passwordHasher.Verify(providedCode, user.EmailVerificationCodeHash);
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
              Voici votre code de vérification pour activer votre compte SimplexPay :
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
            Si vous n'avez pas demandé ce code, ignorez cet email.
          </p>
        </div>
        """;
}
