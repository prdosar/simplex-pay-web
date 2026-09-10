using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SimplexPay.Application.Interfaces;

namespace SimplexPay.API.Controllers;

[ApiController]
[Route("api/exchange-rates")]
public class ExchangeRatesController(IExchangeRateService service) : ControllerBase
{
    /// <summary>Retourne les taux du jour "Google" et "XE" pour une paire de devises.</summary>
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetRates(
        [FromQuery] string from,
        [FromQuery] string to,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(from) || string.IsNullOrWhiteSpace(to))
            return BadRequest(new { message = "from et to sont requis." });

        var pair = await service.GetRatesAsync(from, to, ct);
        return Ok(new
        {
            from = from.ToUpperInvariant(),
            to = to.ToUpperInvariant(),
            google = pair.Google,
            xe = pair.Xe,
            fetchedAt = pair.FetchedAt
        });
    }
}
