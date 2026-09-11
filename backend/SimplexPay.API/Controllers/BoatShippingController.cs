using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SimplexPay.API.Authorization;
using SimplexPay.Application.Features.BoatShipping.Commands;
using SimplexPay.Application.Features.BoatShipping.Queries;
using System.Security.Claims;

namespace SimplexPay.API.Controllers;

[ApiController]
[Route("api/boat-shipping")]
public class BoatShippingController(IMediator mediator) : ControllerBase
{
    private Guid CurrentUserId => Guid.Parse(
        User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? User.FindFirstValue("sub")
        ?? throw new UnauthorizedAccessException());

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetOffers(
        [FromQuery] string? departureCountryCode,
        [FromQuery] string? destinationCountryCode,
        [FromQuery] string? search,
        [FromQuery] decimal? minLbs,
        [FromQuery] decimal? maxLbs,
        [FromQuery] string? sortBy,
        [FromQuery] string? sortDir,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] bool verifiedOnly = false,
        [FromQuery] decimal? minRating = null,
        CancellationToken ct = default)
    {
        var result = await mediator.Send(new GetBoatShippingOffersQuery(
            DepartureCountryCode: departureCountryCode,
            DestinationCountryCode: destinationCountryCode,
            Search: search,
            MinLbs: minLbs,
            MaxLbs: maxLbs,
            SortBy: sortBy,
            SortDir: sortDir,
            Page: page,
            PageSize: pageSize,
            IsAuthenticated: User.Identity?.IsAuthenticated ?? false,
            VerifiedOnly: verifiedOnly,
            MinRating: minRating
        ), ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetOffer(Guid id, CancellationToken ct)
    {
        var result = await mediator.Send(new GetBoatShippingOfferByIdQuery(
            id, User.Identity?.IsAuthenticated ?? false), ct);
        return Ok(result);
    }

    [HttpPost]
    [Authorize]
    [RequireVerifiedEmail]
    public async Task<IActionResult> CreateOffer([FromBody] CreateBoatShippingOfferRequest request, CancellationToken ct)
    {
        var result = await mediator.Send(new CreateBoatShippingOfferCommand(
            UserId: CurrentUserId,
            AvailableLbs: request.AvailableLbs,
            PricePerLb: request.PricePerLb,
            ShipDepartureDate: request.ShipDepartureDate,
            DeparturePort: request.DeparturePort,
            DestinationPort: request.DestinationPort,
            DepartureCountryCode: request.DepartureCountryCode,
            DestinationCountryCode: request.DestinationCountryCode,
            Notes: request.Notes
        ), ct);
        return Created($"/api/boat-shipping/{result.Id}", result);
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetMyOffers(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var result = await mediator.Send(new GetMyBoatShippingOffersQuery(CurrentUserId, page, pageSize), ct);
        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    [Authorize]
    [RequireVerifiedEmail]
    public async Task<IActionResult> UpdateOffer(Guid id, [FromBody] UpdateBoatShippingOfferRequest request, CancellationToken ct)
    {
        var result = await mediator.Send(new UpdateBoatShippingOfferCommand(
            OfferId: id,
            UserId: CurrentUserId,
            AvailableLbs: request.AvailableLbs,
            PricePerLb: request.PricePerLb,
            ShipDepartureDate: request.ShipDepartureDate,
            DeparturePort: request.DeparturePort,
            DestinationPort: request.DestinationPort,
            DepartureCountryCode: request.DepartureCountryCode,
            DestinationCountryCode: request.DestinationCountryCode,
            Notes: request.Notes,
            Status: request.Status
        ), ct);
        return Ok(result);
    }
}

public record CreateBoatShippingOfferRequest(
    decimal AvailableLbs,
    decimal PricePerLb,
    DateTime ShipDepartureDate,
    string DeparturePort,
    string DestinationPort,
    string DepartureCountryCode,
    string DestinationCountryCode,
    string? Notes
);

public record UpdateBoatShippingOfferRequest(
    decimal AvailableLbs,
    decimal PricePerLb,
    DateTime ShipDepartureDate,
    string DeparturePort,
    string DestinationPort,
    string DepartureCountryCode,
    string DestinationCountryCode,
    string? Notes,
    string Status
);
