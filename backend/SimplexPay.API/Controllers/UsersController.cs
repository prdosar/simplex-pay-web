using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SimplexPay.API.Authorization;
using SimplexPay.Application.Features.Users.Commands;
using SimplexPay.Application.Features.Users.Queries;
using System.Security.Claims;

namespace SimplexPay.API.Controllers;

[ApiController]
[Route("api/users")]
public class UsersController(IMediator mediator) : ControllerBase
{
    private Guid CurrentUserId => Guid.Parse(
        User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? User.FindFirstValue("sub")
        ?? throw new UnauthorizedAccessException());

    [HttpGet("{userId:guid}/profile")]
    [AllowAnonymous]
    public async Task<IActionResult> GetProfile(Guid userId, CancellationToken ct)
    {
        var dto = await mediator.Send(new GetUserProfileQuery(userId, User.Identity?.IsAuthenticated ?? false), ct);
        return dto is null ? NotFound() : Ok(dto);
    }

    [HttpGet("{userId:guid}/reviews")]
    [AllowAnonymous]
    public async Task<IActionResult> GetReviews(
        Guid userId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var result = await mediator.Send(new GetUserReviewsQuery(userId, page, pageSize), ct);
        return Ok(result);
    }

    /// <summary>Met à jour son propre profil (firstName/lastName/country/phone/whatsapp). Email non modifiable.</summary>
    [HttpPatch("me/profile")]
    [Authorize]
    public async Task<IActionResult> UpdateMyProfile([FromBody] UpdateProfileRequest req, CancellationToken ct)
    {
        var dto = await mediator.Send(new UpdateUserProfileCommand(
            UserId: CurrentUserId,
            FirstName: req.FirstName,
            LastName: req.LastName,
            Country: req.Country,
            PhoneNumber: req.PhoneNumber,
            WhatsAppNumber: req.WhatsAppNumber
        ), ct);
        return Ok(dto);
    }

    [HttpPost("{userId:guid}/reviews")]
    [Authorize]
    [RequireVerifiedEmail]
    public async Task<IActionResult> CreateOrUpdateReview(
        Guid userId,
        [FromBody] CreateReviewRequest request,
        CancellationToken ct)
    {
        if (userId == CurrentUserId)
            return BadRequest(new { error = "CannotReviewSelf", message = "Vous ne pouvez pas vous noter vous-même." });

        try
        {
            var dto = await mediator.Send(new CreateOrUpdateReviewCommand(
                ReviewerId: CurrentUserId,
                ReviewedUserId: userId,
                Rating: request.Rating,
                Comment: request.Comment
            ), ct);
            return Ok(dto);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = "ValidationError", message = ex.Message });
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }
}

public record CreateReviewRequest(int Rating, string? Comment);

public record UpdateProfileRequest(
    string FirstName,
    string LastName,
    string Country,
    string PhoneNumber,
    string? WhatsAppNumber
);
