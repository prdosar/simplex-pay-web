using SimplexPay.Domain.Entities;

namespace SimplexPay.Application.Interfaces;

public interface ICurrencyRepository
{
    Task<IList<SupportedCurrency>> GetCurrenciesAsync(string? type, CancellationToken ct);
    Task<IList<Country>> GetCountriesAsync(string? currencyCode, CancellationToken ct);
}
