using Microsoft.EntityFrameworkCore;
using SimplexPay.Application.Interfaces;
using SimplexPay.Domain.Entities;
using SimplexPay.Infrastructure.Persistence;

namespace SimplexPay.Infrastructure.Repositories;

public class ReviewRepository(AppDbContext db) : IReviewRepository
{
    public Task<Review?> GetByPairAsync(Guid reviewerId, Guid reviewedUserId, CancellationToken ct) =>
        db.Reviews.FirstOrDefaultAsync(r => r.ReviewerId == reviewerId && r.ReviewedUserId == reviewedUserId, ct);

    public async Task<(IList<Review> Items, int Total)> GetPagedByReviewedUserAsync(
        Guid reviewedUserId, int page, int pageSize, CancellationToken ct)
    {
        var query = db.Reviews
            .Include(r => r.Reviewer)
            .Where(r => r.ReviewedUserId == reviewedUserId)
            .OrderByDescending(r => r.CreatedAt);

        var total = await query.CountAsync(ct);
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);
        return (items, total);
    }

    public async Task<(decimal Average, int Count)> GetStatsAsync(Guid reviewedUserId, CancellationToken ct)
    {
        var count = await db.Reviews.CountAsync(r => r.ReviewedUserId == reviewedUserId, ct);
        if (count == 0) return (0m, 0);
        var avg = await db.Reviews
            .Where(r => r.ReviewedUserId == reviewedUserId)
            .AverageAsync(r => (decimal)r.Rating, ct);
        return (avg, count);
    }

    public async Task AddAsync(Review review, CancellationToken ct) =>
        await db.Reviews.AddAsync(review, ct);

    public Task SaveChangesAsync(CancellationToken ct) =>
        db.SaveChangesAsync(ct);
}
