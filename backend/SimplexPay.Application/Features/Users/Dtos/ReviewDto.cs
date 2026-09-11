using SimplexPay.Domain.Entities;

namespace SimplexPay.Application.Features.Users.Dtos;

public record ReviewDto(
    Guid Id,
    Guid ReviewerId,
    string ReviewerFirstName,
    int Rating,
    string? Comment,
    DateTime CreatedAt,
    DateTime? UpdatedAt
)
{
    public static ReviewDto From(Review r) => new(
        r.Id,
        r.ReviewerId,
        r.Reviewer.FirstName,
        r.Rating,
        r.Comment,
        r.CreatedAt,
        r.UpdatedAt
    );
}
