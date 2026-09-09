using MediatR;
using Microsoft.Extensions.Configuration;
using SimplexPay.Application.Common.Exceptions;
using SimplexPay.Application.Features.Auth.Dtos;
using SimplexPay.Application.Interfaces;
using SimplexPay.Domain.Entities;

namespace SimplexPay.Application.Features.Auth.Commands;

public record RefreshTokenCommand(string Token) : IRequest<AuthResponse>;

public class RefreshTokenCommandHandler(
    IUserRepository userRepo,
    ITokenService tokenService,
    IConfiguration config
) : IRequestHandler<RefreshTokenCommand, AuthResponse>
{
    public async Task<AuthResponse> Handle(RefreshTokenCommand request, CancellationToken ct)
    {
        var existing = await userRepo.GetActiveRefreshTokenAsync(request.Token, ct)
            ?? throw new UnauthorizedException("Token invalide ou expiré.");

        var user = existing.User;

        var (accessToken, expiresAt) = tokenService.GenerateAccessToken(user);
        var newRefreshTokenValue = tokenService.GenerateRefreshToken();
        var expiryDays = int.Parse(config["Jwt:RefreshExpiryDays"] ?? "30");
        var newRefreshToken = RefreshToken.Create(user.Id, newRefreshTokenValue, expiryDays);

        await userRepo.AddRefreshTokenAsync(newRefreshToken, ct);
        await userRepo.SaveChangesAsync(ct);

        return new AuthResponse(accessToken, newRefreshTokenValue, expiresAt, UserDto.From(user));
    }
}
