using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SimplexPay.API.Authorization;
using SimplexPay.Application.Features.Offers.Commands;
using SimplexPay.Application.Features.Offers.Queries;
using System.Security.Claims;

namespace SimplexPay.API.Controllers;

[ApiController]
[Route("api/offers")]
public class OffersController(IMediator mediator) : ControllerBase
{
    private Guid CurrentUserId => Guid.Parse(
        User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? User.FindFirstValue("sub")
        ?? throw new UnauthorizedAccessException());

    /// <summary>Liste les offres actives avec filtres et pagination.</summary>
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetOffers(
        [FromQuery] string? sellCurrencyCode,
        [FromQuery] string? buyCurrencyCode,
        [FromQuery] string? type,
        [FromQuery] string? sellCountryCode,
        [FromQuery] string? buyCountryCode,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? sortBy = null,
        [FromQuery] string? sortDir = null,
        [FromQuery] string? search = null,
        [FromQuery] decimal? minAmount = null,
        [FromQuery] decimal? maxAmount = null,
        [FromQuery] List<Guid>? paymentMethodIds = null,
        CancellationToken ct = default)
    {
        var query = new GetOffersQuery(
            SellCurrencyCode: sellCurrencyCode,
            BuyCurrencyCode: buyCurrencyCode,
            Type: type,
            SellCountryCode: sellCountryCode,
            BuyCountryCode: buyCountryCode,
            Page: page,
            PageSize: pageSize,
            IsAuthenticated: User.Identity?.IsAuthenticated ?? false,
            SortBy: sortBy,
            SortDir: sortDir,
            Search: search,
            MinAmount: minAmount,
            MaxAmount: maxAmount,
            PaymentMethodIds: paymentMethodIds
        );

        var result = await mediator.Send(query, ct);
        return Ok(result);
    }

    /// <summary>Retourne les facettes de modes de paiement pour les offres filtrées.</summary>
    [HttpGet("facets/payment-methods")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPaymentMethodFacets(
        [FromQuery] string? sellCountryCode,
        [FromQuery] string? search,
        [FromQuery] decimal? minAmount,
        [FromQuery] decimal? maxAmount,
        CancellationToken ct = default)
    {
        var result = await mediator.Send(new GetPaymentMethodFacetsQuery(
            SellCountryCode: sellCountryCode,
            Search: search,
            MinAmount: minAmount,
            MaxAmount: maxAmount
        ), ct);
        return Ok(result);
    }

    /// <summary>Retourne le détail d'une offre.</summary>
    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetOffer(Guid id, CancellationToken ct)
    {
        var query = new GetOfferByIdQuery(id, User.Identity?.IsAuthenticated ?? false);
        var result = await mediator.Send(query, ct);
        return Ok(result);
    }

    /// <summary>Liste les offres de l'utilisateur connecté.</summary>
    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetMyOffers(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var result = await mediator.Send(new GetMyOffersQuery(CurrentUserId, page, pageSize), ct);
        return Ok(result);
    }

    /// <summary>Crée une nouvelle offre (authentification requise, email vérifié).</summary>
    [HttpPost]
    [Authorize]
    [RequireVerifiedEmail]
    public async Task<IActionResult> CreateOffer([FromBody] CreateOfferRequest request, CancellationToken ct)
    {
        var command = new CreateOfferCommand(
            UserId: CurrentUserId,
            SellCurrencyCode: request.SellCurrencyCode,
            SellCountryCode: request.SellCountryCode,
            Amount: request.Amount,
            RateMode: request.RateMode,
            Rate: request.Rate,
            MinAmount: request.MinAmount,
            Notes: request.Notes,
            ExpiryHours: request.ExpiryHours,
            PaymentMethodIds: request.PaymentMethodIds
        );

        var result = await mediator.Send(command, ct);
        return Created($"/api/offers/{result.Id}", result);
    }

    /// <summary>Annule une offre (créateur uniquement, email vérifié).</summary>
    [HttpDelete("{id:guid}/cancel")]
    [Authorize]
    [RequireVerifiedEmail]
    public async Task<IActionResult> CancelOffer(Guid id, CancellationToken ct)
    {
        await mediator.Send(new CancelOfferCommand(id, CurrentUserId), ct);
        return NoContent();
    }
}

public record CreateOfferRequest(
    string SellCurrencyCode,
    string SellCountryCode,
    decimal Amount,
    string RateMode,
    decimal? Rate,
    decimal MinAmount,
    string? Notes,
    int ExpiryHours = 24,
    IList<Guid>? PaymentMethodIds = null
);
