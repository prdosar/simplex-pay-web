using SimplexPay.Domain.Entities;

namespace SimplexPay.Application.Interfaces;

public interface IReviewRepository
{
    Task<Review?> GetByPairAsync(Guid reviewerId, Guid reviewedUserId, CancellationToken ct = default);
    Task<(IList<Review> Items, int Total)> GetPagedByReviewedUserAsync(
        Guid reviewedUserId, int page, int pageSize, CancellationToken ct = default);
    Task<(decimal Average, int Count)> GetStatsAsync(Guid reviewedUserId, CancellationToken ct = default);
    Task AddAsync(Review review, CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);
}
