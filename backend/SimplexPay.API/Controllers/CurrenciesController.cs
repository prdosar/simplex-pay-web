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
    /// <summary>Liste les devises supportées. Filtrer par type: Buy ou Sell.</summary>
    [HttpGet]
    public async Task<IActionResult> GetCurrencies([FromQuery] string? type, CancellationToken ct)
    {
        var result = await mediator.Send(new GetCurrenciesQuery(type), ct);
        return Ok(result);
    }

    /// <summary>Liste les pays supportés. Filtrer par code de devise (ex: XOF, CAD).</summary>
    [HttpGet("/api/countries")]
    public async Task<IActionResult> GetCountries([FromQuery] string? currencyCode, CancellationToken ct)
    {
        var result = await mediator.Send(new GetCountriesQuery(currencyCode), ct);
        return Ok(result);
    }
}
