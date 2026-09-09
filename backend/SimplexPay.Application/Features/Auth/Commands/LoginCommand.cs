using FluentValidation;
using MediatR;
using Microsoft.Extensions.Configuration;
using SimplexPay.Application.Common.Exceptions;
using SimplexPay.Application.Features.Auth.Dtos;
using SimplexPay.Application.Interfaces;
using SimplexPay.Domain.Entities;
using SimplexPay.Domain.Enums;

namespace SimplexPay.Application.Features.Auth.Commands;

public record LoginCommand(string Email, string Password) : IRequest<AuthResponse>;

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
    ITokenService tokenService,
    IPasswordHasher passwordHasher,
    IConfiguration config
) : IRequestHandler<LoginCommand, AuthResponse>
{
    public async Task<AuthResponse> Handle(LoginCommand request, CancellationToken ct)
    {
        var user = await userRepo.GetByEmailAsync(request.Email, ct)
            ?? throw new UnauthorizedException();

        if (!passwordHasher.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedException();

        if (user.Status == UserStatus.Suspended)
            throw new ForbiddenException("Votre compte est suspendu.");

        if (user.Status == UserStatus.Banned)
            throw new ForbiddenException("Votre compte a été banni.");

        var (accessToken, expiresAt) = tokenService.GenerateAccessToken(user);
        var refreshTokenValue = tokenService.GenerateRefreshToken();
        var expiryDays = int.Parse(config["Jwt:RefreshExpiryDays"] ?? "30");
        var refreshToken = RefreshToken.Create(user.Id, refreshTokenValue, expiryDays);

        await userRepo.AddRefreshTokenAsync(refreshToken, ct);
        await userRepo.SaveChangesAsync(ct);

        return new AuthResponse(accessToken, refreshTokenValue, expiresAt, UserDto.From(user));
    }
}
