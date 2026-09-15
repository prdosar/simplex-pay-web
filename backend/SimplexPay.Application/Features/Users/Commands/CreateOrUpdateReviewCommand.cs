using MediatR;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
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
    IUserRepository users,
    INotificationRepository notifRepo,
    IEmailService email,
    IConfiguration config,
    ILogger<CreateOrUpdateReviewCommandHandler> logger)
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
        bool isNew;
        if (existing is null)
        {
            review = Review.Create(req.ReviewerId, req.ReviewedUserId, req.Rating, req.Comment);
            await reviews.AddAsync(review, ct);
            isNew = true;
        }
        else
        {
            existing.Update(req.Rating, req.Comment);
            review = existing;
            isNew = false;
        }

        await reviews.SaveChangesAsync(ct);

        // Recompute cached stats on target user.
        var (avg, count) = await reviews.GetStatsAsync(req.ReviewedUserId, ct);
        target.UpdateRating(avg, count);
        await users.SaveChangesAsync(ct);

        // Notification + email — uniquement à la création (les updates spamment inutilement).
        if (isNew)
            await NotifyReviewedUserAsync(reviewer, target, review, ct);

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

    private async Task NotifyReviewedUserAsync(User reviewer, User target, Review review, CancellationToken ct)
    {
        var stars = new string('★', review.Rating) + new string('☆', 5 - review.Rating);
        var reviewerName = $"{reviewer.FirstName} {reviewer.LastName}".Trim();
        var commentPart = string.IsNullOrWhiteSpace(review.Comment) ? "" : $" — « {review.Comment} »";

        var notif = Notification.Create(
            userId: target.Id,
            type: "NewReview",
            title: $"{reviewerName} vous a noté {stars}",
            body: string.IsNullOrWhiteSpace(review.Comment)
                ? $"{reviewerName} vous a donné {review.Rating}/5."
                : $"{reviewerName} ({review.Rating}/5) : « {review.Comment} »",
            link: $"/profile/{target.Id}#reviews"
        );
        await notifRepo.AddAsync(notif, ct);
        await notifRepo.SaveChangesAsync(ct);

        var webUrl = config["Cors:Origins:0"] ?? "https://simplex-pay.com";
        var html = $@"<!DOCTYPE html><html><body style=""font-family:system-ui,-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0f172a;"">
  <h2 style=""color:#0d9488;margin:0 0 12px;"">Nouvelle évaluation reçue</h2>
  <p style=""color:#334155;line-height:1.5;"">
    <strong>{System.Net.WebUtility.HtmlEncode(reviewerName)}</strong> vous a laissé une évaluation :
  </p>
  <div style=""background:#fef3c7;border:1px solid #fde68a;padding:12px 16px;margin:16px 0;border-radius:8px;font-size:18px;color:#92400e;text-align:center;letter-spacing:2px;"">
    {stars} <span style=""font-size:14px;color:#78350f;"">({review.Rating}/5)</span>
  </div>
  {(string.IsNullOrWhiteSpace(review.Comment) ? "" : $@"<div style=""background:#f8fafc;border-left:3px solid #0d9488;padding:12px 16px;margin:16px 0;color:#334155;font-size:14px;font-style:italic;"">« {System.Net.WebUtility.HtmlEncode(review.Comment)} »</div>")}
  <p style=""margin-top:24px;""><a href=""{webUrl}/fr/mon-compte"" style=""display:inline-block;background:#0d9488;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;"">Voir mes évaluations</a></p>
  <p style=""color:#94a3b8;font-size:12px;margin-top:24px;"">SimplexPay — plateforme sécurisée d'échange P2P.</p>
</body></html>";

        try
        {
            await email.SendEmailAsync(
                toEmail: target.Email,
                subject: $"{reviewerName} vous a noté {review.Rating}/5",
                htmlBody: html);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "[CreateReview] Échec envoi email à {Email}", target.Email);
        }
    }
}
