using System.Net.Http;
using System.Text.Json;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using SimplexPay.Application.Interfaces;

namespace SimplexPay.Infrastructure.Services;

// Sources publiques utilisées comme proxies (approximations) :
// - "Google" ≈ exchangerate-api.com (taux commerciaux quotidiens, sans clé API)
// - "XE" ≈ open.er-api.com (agrège plusieurs sources, sans clé API)
// Ni Google Finance ni XE.com n'exposent d'API publique gratuite officielle. Ces sources
// donnent des valeurs proches et distinctes, honnêtes pour un MVP.
public class ExchangeRateService(
    IHttpClientFactory httpFactory,
    IMemoryCache cache,
    ILogger<ExchangeRateService> logger
) : IExchangeRateService
{
    private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(10);

    public async Task<ExchangeRatePair> GetRatesAsync(string from, string to, CancellationToken ct = default)
    {
        var cacheKey = $"exrate:{from.ToUpperInvariant()}:{to.ToUpperInvariant()}";
        if (cache.TryGetValue<ExchangeRatePair>(cacheKey, out var cached) && cached is not null)
            return cached;

        var http = httpFactory.CreateClient("ExchangeRates");

        var googleTask = FetchAsync(http, $"https://api.exchangerate-api.com/v4/latest/{from}", to, "rates", "Google", ct);
        var xeTask     = FetchAsync(http, $"https://open.er-api.com/v6/latest/{from}",       to, "rates", "XE",     ct);

        await Task.WhenAll(googleTask, xeTask);

        var pair = new ExchangeRatePair(googleTask.Result, xeTask.Result, DateTime.UtcNow);
        cache.Set(cacheKey, pair, CacheDuration);
        return pair;
    }

    private async Task<decimal?> FetchAsync(HttpClient http, string url, string toCurrency, string ratesKey, string label, CancellationToken ct)
    {
        try
        {
            using var resp = await http.GetAsync(url, ct);
            if (!resp.IsSuccessStatusCode)
            {
                logger.LogWarning("[ExchangeRate:{Label}] HTTP {Status} pour {Url}", label, (int)resp.StatusCode, url);
                return null;
            }

            using var stream = await resp.Content.ReadAsStreamAsync(ct);
            using var doc = await JsonDocument.ParseAsync(stream, cancellationToken: ct);

            if (!doc.RootElement.TryGetProperty(ratesKey, out var rates)) return null;
            if (!rates.TryGetProperty(toCurrency.ToUpperInvariant(), out var value)) return null;

            return value.GetDecimal();
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "[ExchangeRate:{Label}] Échec fetch {Url}: {Msg}", label, url, ex.Message);
            return null;
        }
    }
}
