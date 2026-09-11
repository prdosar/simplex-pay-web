using SimplexPay.Domain.Entities;

namespace SimplexPay.Application.Features.Admin.Dtos;

public record AdminUserDto(
    Guid Id,
    string FirstName,
    string LastName,
    string Email,
    string? PhoneNumber,
    string? WhatsAppNumber,
    string Country,
    string Status,
    bool IsCertified,
    decimal Rating,
    int ReviewCount,
    int TransactionCount,
    DateTime CreatedAt
)
{
    public static AdminUserDto From(User u) => new(
        u.Id, u.FirstName, u.LastName, u.Email,
        u.PhoneNumber, u.WhatsAppNumber, u.Country,
        u.Status.ToString(), u.IsCertified, u.Rating, u.ReviewCount, u.TransactionCount, u.CreatedAt);
}

public record AdminStatsDto(
    int TotalUsers,
    int TotalOffers,
    int ActiveOffers,
    int TotalTransactions,
    int NewUsersThisWeek,
    int NewOffersThisWeek
);
