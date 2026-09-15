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
    // Devises (référentiel figé) : cache 24h. Pays/moyens de paiement (modifiables via l'admin) :
    // cache court 5 min pour laisser les changements admin se propager rapidement.

    /// <summary>Liste les devises supportées. Filtrer par type: Buy ou Sell.</summary>
    [HttpGet]
    [ResponseCache(Duration = 86400, Location = ResponseCacheLocation.Any)]
    public async Task<IActionResult> GetCurrencies([FromQuery] string? type, CancellationToken ct)
    {
        var result = await mediator.Send(new GetCurrenciesQuery(type), ct);
        return Ok(result);
    }

    /// <summary>Liste les pays supportés (avec leurs moyens de paiement).</summary>
    [HttpGet("/api/countries")]
    [ResponseCache(Duration = 300, Location = ResponseCacheLocation.Any)]
    public async Task<IActionResult> GetCountries([FromQuery] string? currencyCode, CancellationToken ct)
    {
        var result = await mediator.Send(new GetCountriesQuery(currencyCode), ct);
        return Ok(result);
    }
}
