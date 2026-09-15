using SimplexPay.Domain.Entities;

namespace SimplexPay.Application.Interfaces;

public interface INotificationRepository
{
    Task<Notification?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<(IList<Notification> Items, int Total)> GetPagedForUserAsync(Guid userId, int page, int pageSize, CancellationToken ct);
    Task<int> CountUnreadAsync(Guid userId, CancellationToken ct);
    Task AddAsync(Notification notification, CancellationToken ct);
    Task MarkAllReadAsync(Guid userId, CancellationToken ct);
    Task SaveChangesAsync(CancellationToken ct);
}
