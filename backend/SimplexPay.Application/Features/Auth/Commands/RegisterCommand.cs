using FluentValidation;
using MediatR;
using Microsoft.Extensions.Configuration;
using SimplexPay.Application.Common.Exceptions;
using SimplexPay.Application.Features.Auth.Dtos;
using SimplexPay.Application.Interfaces;
using SimplexPay.Domain.Entities;

namespace SimplexPay.Application.Features.Auth.Commands;

public record RegisterCommand(
    string FirstName,
    string LastName,
    string Email,
    string Password,
    string PhoneNumber,
    string Country,
    string? WhatsAppNumber
) : IRequest<AuthResponse>;

public class RegisterCommandValidator : AbstractValidator<RegisterCommand>
{
    public RegisterCommandValidator()
    {
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(256);
        RuleFor(x => x.Password)
            .NotEmpty()
            .MinimumLength(8)
            .Matches(@"[A-Z]").WithMessage("Le mot de passe doit contenir au moins une majuscule.")
            .Matches(@"[0-9]").WithMessage("Le mot de passe doit contenir au moins un chiffre.");
        RuleFor(x => x.PhoneNumber).NotEmpty().MaximumLength(30);
        RuleFor(x => x.Country).NotEmpty().Length(2, 3);
    }
}

public class RegisterCommandHandler(
    IUserRepository userRepo,
    ITokenService tokenService,
    IPasswordHasher passwordHasher,
    IEmailVerificationService emailVerification,
    IConfiguration config
) : IRequestHandler<RegisterCommand, AuthResponse>
{
    public async Task<AuthResponse> Handle(RegisterCommand request, CancellationToken ct)
    {
        if (await userRepo.ExistsByEmailAsync(request.Email, ct))
            throw new ConflictException("Un compte avec cet email existe déjà.");

        var hash = passwordHasher.Hash(request.Password);
        var user = User.Create(request.FirstName, request.LastName, request.Email,
            hash, request.PhoneNumber, request.Country);

        if (request.WhatsAppNumber is not null)
            user.SetWhatsAppNumber(request.WhatsAppNumber);

        await emailVerification.IssueCodeAsync(user, ct);

        await userRepo.AddAsync(user, ct);
        await userRepo.SaveChangesAsync(ct);

        var (accessToken, expiresAt) = tokenService.GenerateAccessToken(user);
        var refreshTokenValue = tokenService.GenerateRefreshToken();
        var expiryDays = int.Parse(config["Jwt:RefreshExpiryDays"] ?? "30");
        var refreshToken = RefreshToken.Create(user.Id, refreshTokenValue, expiryDays);

        await userRepo.AddRefreshTokenAsync(refreshToken, ct);
        await userRepo.SaveChangesAsync(ct);

        return new AuthResponse(accessToken, refreshTokenValue, expiresAt, UserDto.From(user));
    }
}
