using SimplexPay.Domain.Entities;

namespace SimplexPay.Application.Features.Notifications.Dtos;

public record NotificationDto(
    Guid Id,
    string Type,
    string Title,
    string Body,
    string? Link,
    bool IsRead,
    DateTime CreatedAt
)
{
    public static NotificationDto From(Notification n) =>
        new(n.Id, n.Type, n.Title, n.Body, n.Link, n.IsRead, n.CreatedAt);
}
