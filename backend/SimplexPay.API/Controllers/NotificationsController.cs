using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SimplexPay.Application.Features.Notifications.Commands;
using SimplexPay.Application.Features.Notifications.Queries;
using System.Security.Claims;

namespace SimplexPay.API.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
public class NotificationsController(IMediator mediator) : ControllerBase
{
    private Guid CurrentUserId => Guid.Parse(
        User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? User.FindFirstValue("sub")
        ?? throw new UnauthorizedAccessException());

    /// <summary>Liste paginée des notifications de l'utilisateur courant + compteur non-lues.</summary>
    [HttpGet]
    public async Task<IActionResult> GetNotifications(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default) =>
        Ok(await mediator.Send(new GetNotificationsQuery(CurrentUserId, page, pageSize), ct));

    /// <summary>Compteur de notifications non-lues (pour badge cloche). Léger.</summary>
    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount(CancellationToken ct) =>
        Ok(new { count = await mediator.Send(new GetUnreadCountQuery(CurrentUserId), ct) });

    /// <summary>Marque une notification comme lue.</summary>
    [HttpPatch("{id:guid}/read")]
    public async Task<IActionResult> MarkRead(Guid id, CancellationToken ct)
    {
        await mediator.Send(new MarkNotificationReadCommand(id, CurrentUserId), ct);
        return NoContent();
    }

    /// <summary>Marque toutes les notifications comme lues.</summary>
    [HttpPatch("read-all")]
    public async Task<IActionResult> MarkAllRead(CancellationToken ct)
    {
        await mediator.Send(new MarkAllNotificationsReadCommand(CurrentUserId), ct);
        return NoContent();
    }
}
