using SimplexPay.Domain.Entities;

namespace SimplexPay.Application.Features.Auth.Dtos;

public record AuthResponse(
    string AccessToken,
    string RefreshToken,
    DateTime ExpiresAt,
    UserDto User
);

public record UserDto(
    Guid Id,
    string FirstName,
    string LastName,
    string Email,
    string PhoneNumber,
    string? WhatsAppNumber,
    string Country,
    decimal Rating,
    int TransactionCount,
    string Status,
    bool EmailVerified,
    bool IsAdmin
)
{
    public static UserDto From(User user) => new(
        user.Id,
        user.FirstName,
        user.LastName,
        user.Email,
        user.PhoneNumber,
        user.WhatsAppNumber,
        user.Country,
        user.Rating,
        user.TransactionCount,
        user.Status.ToString(),
        user.EmailVerified,
        user.IsAdmin
    );
}
