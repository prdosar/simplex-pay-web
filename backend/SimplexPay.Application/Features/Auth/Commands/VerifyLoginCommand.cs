using FluentValidation;
using MediatR;
using Microsoft.Extensions.Configuration;
using SimplexPay.Application.Common.Exceptions;
using SimplexPay.Application.Features.Auth.Dtos;
using SimplexPay.Application.Interfaces;
using SimplexPay.Domain.Entities;

namespace SimplexPay.Application.Features.Auth.Commands;

// Étape 2 du login : vérifie le code 2FA reçu par email et émet AuthResponse.
public record VerifyLoginCommand(string Email, string Code) : IRequest<AuthResponse>;

public class VerifyLoginCommandValidator : AbstractValidator<VerifyLoginCommand>
{
    public VerifyLoginCommandValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Code).NotEmpty().Length(6).Matches(@"^\d{6}$")
            .WithMessage("Le code doit contenir 6 chiffres.");
    }
}

public class VerifyLoginCommandHandler(
    IUserRepository userRepo,
    ITokenService tokenService,
    IPasswordHasher passwordHasher,
    IConfiguration config
) : IRequestHandler<VerifyLoginCommand, AuthResponse>
{
    public async Task<AuthResponse> Handle(VerifyLoginCommand request, CancellationToken ct)
    {
        var user = await userRepo.GetByEmailAsync(request.Email, ct)
            ?? throw new UnauthorizedException();

        if (string.IsNullOrEmpty(user.TwoFactorCodeHash) || user.TwoFactorCodeExpiresAt is null)
            throw new ForbiddenException("Aucune tentative de connexion active. Recommence depuis login.");

        if (user.TwoFactorCodeExpiresAt < DateTime.UtcNow)
        {
            user.ClearTwoFactorCode();
            await userRepo.SaveChangesAsync(ct);
            throw new ForbiddenException("Le code a expiré. Recommence la connexion.");
        }

        var maxAttempts = int.TryParse(config["App:TwoFactorMaxAttempts"], out var m) ? m : 5;
        if (user.TwoFactorAttempts >= maxAttempts)
        {
            user.ClearTwoFactorCode();
            await userRepo.SaveChangesAsync(ct);
            throw new ForbiddenException("Trop de tentatives. Recommence la connexion.");
        }

        if (!passwordHasher.Verify(request.Code, user.TwoFactorCodeHash))
        {
            user.IncrementTwoFactorAttempts();
            await userRepo.SaveChangesAsync(ct);
            throw new ForbiddenException("Code invalide.");
        }

        // Code OK : purge, émet AuthResponse + refresh token.
        user.ClearTwoFactorCode();

        var (accessToken, expiresAt) = tokenService.GenerateAccessToken(user);
        var refreshTokenValue = tokenService.GenerateRefreshToken();
        var expiryDays = int.Parse(config["Jwt:RefreshExpiryDays"] ?? "30");
        var refreshToken = RefreshToken.Create(user.Id, refreshTokenValue, expiryDays);

        await userRepo.AddRefreshTokenAsync(refreshToken, ct);
        await userRepo.SaveChangesAsync(ct);

        return new AuthResponse(accessToken, refreshTokenValue, expiresAt, UserDto.From(user));
    }
}
