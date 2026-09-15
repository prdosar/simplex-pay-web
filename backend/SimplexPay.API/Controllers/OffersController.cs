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
        [FromQuery] bool verifiedOnly = false,
        [FromQuery] decimal? minRating = null,
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
            PaymentMethodIds: paymentMethodIds,
            VerifiedOnly: verifiedOnly,
            MinRating: minRating
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

    /// <summary>Retourne le nombre d'offres actives par pays vendeur (pour le libellé des dropdowns).</summary>
    [HttpGet("facets/countries")]
    [AllowAnonymous]
    public async Task<IActionResult> GetCountryFacets(CancellationToken ct)
    {
        var result = await mediator.Send(new GetOfferCountryFacetsQuery(), ct);
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
            SellCountryCodes: request.SellCountryCodes ?? [],
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

    /// <summary>Met à jour une offre existante (créateur uniquement, email vérifié).</summary>
    [HttpPut("{id:guid}")]
    [Authorize]
    [RequireVerifiedEmail]
    public async Task<IActionResult> UpdateOffer(Guid id, [FromBody] UpdateOfferRequest request, CancellationToken ct)
    {
        var command = new UpdateOfferCommand(
            OfferId: id,
            UserId: CurrentUserId,
            Amount: request.Amount,
            RemainingAmount: request.RemainingAmount,
            RateMode: request.RateMode,
            Rate: request.Rate,
            MinAmount: request.MinAmount,
            MaxAmount: request.MaxAmount,
            Notes: request.Notes,
            ExpiresAt: request.ExpiresAt,
            Status: request.Status,
            PaymentMethodIds: request.PaymentMethodIds,
            SellCountryCodes: request.SellCountryCodes
        );
        var result = await mediator.Send(command, ct);
        return Ok(result);
    }
}

public record UpdateOfferRequest(
    decimal Amount,
    decimal RemainingAmount,
    string RateMode,
    decimal? Rate,
    decimal MinAmount,
    decimal? MaxAmount,
    string? Notes,
    // Null = ne jamais expirer.
    DateTime? ExpiresAt,
    string Status,
    IList<Guid>? PaymentMethodIds,
    // Null = pas de changement. Sinon liste complète des pays (≥1, tous même devise que l'offre).
    IList<string>? SellCountryCodes = null
);

public record CreateOfferRequest(
    // Multi-pays : au moins 1. Tous doivent partager la même devise (UEMOA/CEMAC). La devise
    // est déduite côté serveur — le client n'a pas à l'envoyer.
    IList<string> SellCountryCodes,
    decimal Amount,
    string RateMode,
    decimal? Rate,
    decimal MinAmount,
    string? Notes,
    // Null (défaut) = ne jamais expirer. Le créateur clôture manuellement via /cancel.
    int? ExpiryHours = null,
    IList<Guid>? PaymentMethodIds = null
);
