using FluentValidation;
using MediatR;
using Microsoft.Extensions.Configuration;
using SimplexPay.Application.Common.Exceptions;
using SimplexPay.Application.Features.Auth.Dtos;
using SimplexPay.Application.Interfaces;
using SimplexPay.Domain.Entities;

namespace SimplexPay.Application.Features.Auth.Commands;

public record VerifyEmailCommand(string Email, string Code) : IRequest<AuthResponse>;

public class VerifyEmailCommandValidator : AbstractValidator<VerifyEmailCommand>
{
    public VerifyEmailCommandValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Code).NotEmpty().Length(6).Matches(@"^\d{6}$")
            .WithMessage("Le code doit contenir 6 chiffres.");
    }
}

public class VerifyEmailCommandHandler(
    IUserRepository userRepo,
    IEmailVerificationService emailVerification,
    ITokenService tokenService,
    IConfiguration config
) : IRequestHandler<VerifyEmailCommand, AuthResponse>
{
    public async Task<AuthResponse> Handle(VerifyEmailCommand request, CancellationToken ct)
    {
        var user = await userRepo.GetByEmailAsync(request.Email, ct)
            ?? throw new NotFoundException("User", request.Email);

        if (!user.EmailVerified)
        {
            if (!emailVerification.VerifyCode(user, request.Code))
            {
                user.IncrementEmailVerificationAttempts();
                await userRepo.SaveChangesAsync(ct);
                throw new ForbiddenException("Code invalide, expiré, ou trop de tentatives.");
            }

            user.MarkEmailVerified();
            await userRepo.SaveChangesAsync(ct);
        }

        var (accessToken, expiresAt) = tokenService.GenerateAccessToken(user);
        var refreshTokenValue = tokenService.GenerateRefreshToken();
        var expiryDays = int.Parse(config["Jwt:RefreshExpiryDays"] ?? "30");
        var refreshToken = RefreshToken.Create(user.Id, refreshTokenValue, expiryDays);

        await userRepo.AddRefreshTokenAsync(refreshToken, ct);
        await userRepo.SaveChangesAsync(ct);

        return new AuthResponse(accessToken, refreshTokenValue, expiresAt, UserDto.From(user));
    }
}
