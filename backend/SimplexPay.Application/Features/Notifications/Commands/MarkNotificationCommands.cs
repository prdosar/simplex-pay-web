using MediatR;
using SimplexPay.Application.Common.Exceptions;
using SimplexPay.Application.Interfaces;

namespace SimplexPay.Application.Features.Notifications.Commands;

public record MarkNotificationReadCommand(Guid NotificationId, Guid UserId) : IRequest;

public class MarkNotificationReadCommandHandler(INotificationRepository repo)
    : IRequestHandler<MarkNotificationReadCommand>
{
    public async Task Handle(MarkNotificationReadCommand req, CancellationToken ct)
    {
        var n = await repo.GetByIdAsync(req.NotificationId, ct)
            ?? throw new NotFoundException("Notification", req.NotificationId);
        if (n.UserId != req.UserId)
            throw new ForbiddenException("Cette notification ne vous appartient pas.");
        n.MarkRead();
        await repo.SaveChangesAsync(ct);
    }
}

public record MarkAllNotificationsReadCommand(Guid UserId) : IRequest;

public class MarkAllNotificationsReadCommandHandler(INotificationRepository repo)
    : IRequestHandler<MarkAllNotificationsReadCommand>
{
    public Task Handle(MarkAllNotificationsReadCommand req, CancellationToken ct) =>
        repo.MarkAllReadAsync(req.UserId, ct);
}
