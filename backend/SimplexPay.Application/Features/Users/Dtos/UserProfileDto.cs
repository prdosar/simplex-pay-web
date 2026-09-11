using SimplexPay.Domain.Entities;

namespace SimplexPay.Application.Features.Users.Dtos;

public record UserProfileDto(
    Guid Id,
    string FirstName,
    string? LastName,          // null pour non-authentifié
    string Country,
    bool IsCertified,
    decimal Rating,
    int ReviewCount,
    int TransactionCount,
    DateTime MemberSince
)
{
    public static UserProfileDto From(User u, bool isAuthenticated) => new(
        u.Id,
        u.FirstName,
        isAuthenticated ? u.LastName : null,
        u.Country,
        u.IsCertified,
        u.Rating,
        u.ReviewCount,
        u.TransactionCount,
        u.CreatedAt
    );
}
