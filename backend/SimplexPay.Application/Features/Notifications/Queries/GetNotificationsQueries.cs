using MediatR;
using SimplexPay.Application.Features.Notifications.Dtos;
using SimplexPay.Application.Interfaces;

namespace SimplexPay.Application.Features.Notifications.Queries;

public record GetNotificationsQuery(Guid UserId, int Page, int PageSize)
    : IRequest<PagedNotifications>;

public record PagedNotifications(IList<NotificationDto> Items, int Total, int UnreadCount);

public class GetNotificationsQueryHandler(INotificationRepository repo)
    : IRequestHandler<GetNotificationsQuery, PagedNotifications>
{
    public async Task<PagedNotifications> Handle(GetNotificationsQuery req, CancellationToken ct)
    {
        var page = Math.Max(1, req.Page);
        var pageSize = Math.Clamp(req.PageSize, 1, 50);
        var (items, total) = await repo.GetPagedForUserAsync(req.UserId, page, pageSize, ct);
        var unread = await repo.CountUnreadAsync(req.UserId, ct);
        return new PagedNotifications(items.Select(NotificationDto.From).ToList(), total, unread);
    }
}

public record GetUnreadCountQuery(Guid UserId) : IRequest<int>;

public class GetUnreadCountQueryHandler(INotificationRepository repo)
    : IRequestHandler<GetUnreadCountQuery, int>
{
    public Task<int> Handle(GetUnreadCountQuery req, CancellationToken ct) =>
        repo.CountUnreadAsync(req.UserId, ct);
}
