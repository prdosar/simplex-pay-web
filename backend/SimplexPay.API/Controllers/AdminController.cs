using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SimplexPay.Application.Features.Admin.Commands;
using SimplexPay.Application.Features.Admin.Queries;

namespace SimplexPay.API.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Policy = "AdminOnly")]
public class AdminController(IMediator mediator) : ControllerBase
{
    [HttpGet("stats")]
    public async Task<IActionResult> GetStats(CancellationToken ct) =>
        Ok(await mediator.Send(new GetAdminStatsQuery(), ct));

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
}

public record CertifyRequest(bool IsCertified);
