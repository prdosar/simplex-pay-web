using Microsoft.EntityFrameworkCore;
using SimplexPay.Application.Interfaces;
using SimplexPay.Domain.Entities;
using SimplexPay.Infrastructure.Persistence;

namespace SimplexPay.Infrastructure.Repositories;

public class ActivityLogRepository(AppDbContext db) : IActivityLogRepository
{
    public async Task AddAsync(ActivityLog log, CancellationToken ct) =>
        await db.ActivityLogs.AddAsync(log, ct);

    public Task SaveChangesAsync(CancellationToken ct) => db.SaveChangesAsync(ct);

    public async Task<(IList<ActivityLog> Items, int Total)> GetPagedAsync(
        ActivityLogSource? source, string? action, string? ipAddress, string? country, Guid? userId,
        DateTime? from, DateTime? to, int page, int pageSize, CancellationToken ct)
    {
        var q = db.ActivityLogs.AsQueryable();

        if (source.HasValue)
            q = q.Where(x => x.Source == source.Value);
        if (!string.IsNullOrWhiteSpace(action))
            q = q.Where(x => x.Action == action);
        if (!string.IsNullOrWhiteSpace(ipAddress))
            q = q.Where(x => x.IpAddress == ipAddress);
        if (!string.IsNullOrWhiteSpace(country))
            q = q.Where(x => x.Country == country.ToUpperInvariant());
        if (userId.HasValue)
            q = q.Where(x => x.UserId == userId);
        if (from.HasValue)
            q = q.Where(x => x.Timestamp >= from);
        if (to.HasValue)
            q = q.Where(x => x.Timestamp <= to);

        var total = await q.CountAsync(ct);
        var items = await q.OrderByDescending(x => x.Timestamp)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);
        return (items, total);
    }

    public Task<IList<ActivityLog>> GetUngeoTaggedAsync(int limit, CancellationToken ct) =>
        db.ActivityLogs
            .Where(x => x.Country == null)
            .OrderByDescending(x => x.Timestamp)
            .Take(limit)
            .ToListAsync(ct)
            .ContinueWith(t => (IList<ActivityLog>)t.Result, ct);
}
