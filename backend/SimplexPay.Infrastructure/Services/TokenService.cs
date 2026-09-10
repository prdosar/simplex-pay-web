using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using SimplexPay.Application.Interfaces;
using SimplexPay.Domain.Entities;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace SimplexPay.Infrastructure.Services;

public class TokenService(IConfiguration config) : ITokenService
{
    public (string Token, DateTime ExpiresAt) GenerateAccessToken(User user)
    {
        var key = config["Jwt:Key"] ?? throw new InvalidOperationException("JWT key not configured.");
        var expiryMinutes = int.Parse(config["Jwt:ExpiryMinutes"] ?? "60");
        var expiresAt = DateTime.UtcNow.AddMinutes(expiryMinutes);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(JwtRegisteredClaimNames.GivenName, user.FirstName),
            new Claim(JwtRegisteredClaimNames.FamilyName, user.LastName),
            new Claim("country", user.Country),
            new Claim("status", user.Status.ToString()),
            new Claim("email_verified", user.EmailVerified ? "true" : "false"),
            new Claim("is_admin", user.IsAdmin ? "true" : "false"),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
        var creds = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: config["Jwt:Issuer"],
            audience: config["Jwt:Audience"],
            claims: claims,
            expires: expiresAt,
            signingCredentials: creds
        );

        return (new JwtSecurityTokenHandler().WriteToken(token), expiresAt);
    }

    public string GenerateRefreshToken()
    {
        var bytes = new byte[64];
        RandomNumberGenerator.Fill(bytes);
        return Convert.ToBase64String(bytes);
    }
}
