using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SimplexPay.Application.Features.Currencies.Queries;

namespace SimplexPay.API.Controllers;

[ApiController]
[Route("api/currencies")]
[AllowAnonymous]
public class CurrenciesController(IMediator mediator) : ControllerBase
{
    // Ces référentiels (devises + pays + moyens de paiement par pays) ne changent qu'au déploiement.
    // Cache navigateur 24h — évite un fetch à chaque page. VaryByQueryKeys pour ne pas mélanger
    // les réponses filtrées par currencyCode/type.

    /// <summary>Liste les devises supportées. Filtrer par type: Buy ou Sell.</summary>
    [HttpGet]
    [ResponseCache(Duration = 86400, Location = ResponseCacheLocation.Any, VaryByQueryKeys = new[] { "type" })]
    public async Task<IActionResult> GetCurrencies([FromQuery] string? type, CancellationToken ct)
    {
        var result = await mediator.Send(new GetCurrenciesQuery(type), ct);
        return Ok(result);
    }

    /// <summary>Liste les pays supportés (avec leurs moyens de paiement).</summary>
    [HttpGet("/api/countries")]
    [ResponseCache(Duration = 86400, Location = ResponseCacheLocation.Any, VaryByQueryKeys = new[] { "currencyCode" })]
    public async Task<IActionResult> GetCountries([FromQuery] string? currencyCode, CancellationToken ct)
    {
        var result = await mediator.Send(new GetCountriesQuery(currencyCode), ct);
        return Ok(result);
    }
}
