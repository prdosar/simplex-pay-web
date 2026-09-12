using SimplexPay.Domain.Entities;

namespace SimplexPay.Application.Interfaces;

public interface IActivityLogRepository
{
    Task AddAsync(ActivityLog log, CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);

    // Filtres: action, ipAddress, country, userId, from, to. Tri par Timestamp DESC.
    Task<(IList<ActivityLog> Items, int Total)> GetPagedAsync(
        string? action,
        string? ipAddress,
        string? country,
        Guid? userId,
        DateTime? from,
        DateTime? to,
        int page,
        int pageSize,
        CancellationToken ct = default);

    // Backfill géo (utilisé par le background service).
    Task<IList<ActivityLog>> GetUngeoTaggedAsync(int limit, CancellationToken ct = default);
}
