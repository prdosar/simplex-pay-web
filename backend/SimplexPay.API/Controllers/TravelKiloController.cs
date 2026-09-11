using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SimplexPay.API.Authorization;
using SimplexPay.Application.Features.TravelKilo.Commands;
using SimplexPay.Application.Features.TravelKilo.Queries;
using System.Security.Claims;

namespace SimplexPay.API.Controllers;

[ApiController]
[Route("api/travel-kilo")]
public class TravelKiloController(IMediator mediator) : ControllerBase
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
        [FromQuery] decimal? minKg,
        [FromQuery] decimal? maxKg,
        [FromQuery] string? sortBy,
        [FromQuery] string? sortDir,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] bool verifiedOnly = false,
        [FromQuery] decimal? minRating = null,
        CancellationToken ct = default)
    {
        var result = await mediator.Send(new GetTravelKiloOffersQuery(
            DepartureCountryCode: departureCountryCode,
            DestinationCountryCode: destinationCountryCode,
            Search: search,
            MinKg: minKg,
            MaxKg: maxKg,
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

    [HttpPost]
    [Authorize]
    [RequireVerifiedEmail]
    public async Task<IActionResult> CreateOffer([FromBody] CreateTravelKiloOfferRequest request, CancellationToken ct)
    {
        var result = await mediator.Send(new CreateTravelKiloOfferCommand(
            UserId: CurrentUserId,
            AvailableKg: request.AvailableKg,
            PricePerKg: request.PricePerKg,
            TravelDate: request.TravelDate,
            DepartureCity: request.DepartureCity,
            DestinationCity: request.DestinationCity,
            DepartureCountryCode: request.DepartureCountryCode,
            DestinationCountryCode: request.DestinationCountryCode,
            Notes: request.Notes
        ), ct);
        return Created($"/api/travel-kilo/{result.Id}", result);
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetMyOffers(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var result = await mediator.Send(new GetMyTravelKiloOffersQuery(CurrentUserId, page, pageSize), ct);
        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    [Authorize]
    [RequireVerifiedEmail]
    public async Task<IActionResult> UpdateOffer(Guid id, [FromBody] UpdateTravelKiloOfferRequest request, CancellationToken ct)
    {
        var result = await mediator.Send(new UpdateTravelKiloOfferCommand(
            OfferId: id,
            UserId: CurrentUserId,
            AvailableKg: request.AvailableKg,
            PricePerKg: request.PricePerKg,
            TravelDate: request.TravelDate,
            DepartureCity: request.DepartureCity,
            DestinationCity: request.DestinationCity,
            DepartureCountryCode: request.DepartureCountryCode,
            DestinationCountryCode: request.DestinationCountryCode,
            Notes: request.Notes,
            Status: request.Status
        ), ct);
        return Ok(result);
    }
}

public record CreateTravelKiloOfferRequest(
    decimal AvailableKg,
    decimal PricePerKg,
    DateTime TravelDate,
    string DepartureCity,
    string DestinationCity,
    string DepartureCountryCode,
    string DestinationCountryCode,
    string? Notes
);

public record UpdateTravelKiloOfferRequest(
    decimal AvailableKg,
    decimal PricePerKg,
    DateTime TravelDate,
    string DepartureCity,
    string DestinationCity,
    string DepartureCountryCode,
    string DestinationCountryCode,
    string? Notes,
    string Status
);
