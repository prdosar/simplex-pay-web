using MediatR;
using SimplexPay.Application.Features.Users.Dtos;
using SimplexPay.Application.Interfaces;
using SimplexPay.Domain.Entities;

namespace SimplexPay.Application.Features.Users.Commands;

public record CreateOrUpdateReviewCommand(
    Guid ReviewerId,
    Guid ReviewedUserId,
    int Rating,
    string? Comment
) : IRequest<ReviewDto>;

public class CreateOrUpdateReviewCommandHandler(
    IReviewRepository reviews,
    IUserRepository users)
    : IRequestHandler<CreateOrUpdateReviewCommand, ReviewDto>
{
    public async Task<ReviewDto> Handle(CreateOrUpdateReviewCommand req, CancellationToken ct)
    {
        if (req.ReviewerId == req.ReviewedUserId)
            throw new InvalidOperationException("Cannot review yourself.");

        var target = await users.GetByIdAsync(req.ReviewedUserId, ct)
            ?? throw new KeyNotFoundException("Target user not found.");

        var reviewer = await users.GetByIdAsync(req.ReviewerId, ct)
            ?? throw new KeyNotFoundException("Reviewer not found.");

        var existing = await reviews.GetByPairAsync(req.ReviewerId, req.ReviewedUserId, ct);
        Review review;
        if (existing is null)
        {
            review = Review.Create(req.ReviewerId, req.ReviewedUserId, req.Rating, req.Comment);
            await reviews.AddAsync(review, ct);
        }
        else
        {
            existing.Update(req.Rating, req.Comment);
            review = existing;
        }

        await reviews.SaveChangesAsync(ct);

        // Recompute cached stats on target user.
        var (avg, count) = await reviews.GetStatsAsync(req.ReviewedUserId, ct);
        target.UpdateRating(avg, count);
        await users.SaveChangesAsync(ct);

        // Reviewer nav may not be loaded — build DTO from the reviewer we already fetched.
        return new ReviewDto(
            review.Id,
            review.ReviewerId,
            reviewer.FirstName,
            review.Rating,
            review.Comment,
            review.CreatedAt,
            review.UpdatedAt);
    }
}
