namespace SimplexPay.Application.Interfaces;

public record ExchangeRatePair(decimal? Google, decimal? Xe, DateTime FetchedAt);

public interface IExchangeRateService
{
    Task<ExchangeRatePair> GetRatesAsync(string from, string to, CancellationToken ct = default);
}
