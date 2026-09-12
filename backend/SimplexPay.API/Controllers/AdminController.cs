using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SimplexPay.Application.Features.Admin.Commands;
using SimplexPay.Application.Features.Admin.Queries;
using SimplexPay.Application.Features.Users.Commands;

namespace SimplexPay.API.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Policy = "AdminOnly")]
public class AdminController(IMediator mediator) : ControllerBase
{
    [HttpGet("stats")]
    public async Task<IActionResult> GetStats(CancellationToken ct) =>
        Ok(await mediator.Send(new GetAdminStatsQuery(), ct));

    /// <summary>Journal d'activité. Filtres : action, ipAddress, country (ISO 2), userId, from, to (ISO date).</summary>
    [HttpGet("activity-logs")]
    public async Task<IActionResult> GetActivityLogs(
        [FromQuery] string? action,
        [FromQuery] string? ipAddress,
        [FromQuery] string? country,
        [FromQuery] Guid? userId,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken ct = default)
    {
        var result = await mediator.Send(new GetActivityLogsQuery(
            Action: action,
            IpAddress: ipAddress,
            Country: country,
            UserId: userId,
            From: from,
            To: to,
            Page: page,
            PageSize: pageSize
        ), ct);
        return Ok(result);
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers(
        [FromQuery] string? search,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var (items, total) = await mediator.Send(new GetAdminUsersQuery(search, pageNumber, pageSize), ct);
        int totalPages = (int)Math.Ceiling(total / (double)pageSize);
        return Ok(new
        {
            items,
            total,
            page = pageNumber,
            pageSize,
            totalPages,
        });
    }

    [HttpPatch("users/{userId:guid}/certify")]
    public async Task<IActionResult> CertifyUser(Guid userId, [FromBody] CertifyRequest req, CancellationToken ct)
    {
        try
        {
            await mediator.Send(new CertifyUserCommand(userId, req.IsCertified), ct);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    /// <summary>Admin met à jour le profil de n'importe quel user. Email non modifiable.</summary>
    [HttpPatch("users/{userId:guid}/profile")]
    public async Task<IActionResult> UpdateUserProfile(Guid userId, [FromBody] AdminUpdateUserProfileRequest req, CancellationToken ct)
    {
        var dto = await mediator.Send(new UpdateUserProfileCommand(
            UserId: userId,
            FirstName: req.FirstName,
            LastName: req.LastName,
            Country: req.Country,
            PhoneNumber: req.PhoneNumber,
            WhatsAppNumber: req.WhatsAppNumber
        ), ct);
        return Ok(dto);
    }
}

public record CertifyRequest(bool IsCertified);

public record AdminUpdateUserProfileRequest(
    string FirstName,
    string LastName,
    string Country,
    string PhoneNumber,
    string? WhatsAppNumber
);
