using Microsoft.EntityFrameworkCore;
using SimplexPay.Application.Interfaces;
using SimplexPay.Domain.Entities;
using SimplexPay.Domain.Enums;
using SimplexPay.Infrastructure.Persistence;

namespace SimplexPay.Infrastructure.Repositories;

public class CurrencyRepository(AppDbContext db) : ICurrencyRepository
{
    public async Task<IList<SupportedCurrency>> GetCurrenciesAsync(string? type, CancellationToken ct)
    {
        var query = db.SupportedCurrencies.Where(c => c.IsActive).AsQueryable();

        if (!string.IsNullOrWhiteSpace(type) && Enum.TryParse<CurrencyType>(type, true, out var currencyType))
            query = query.Where(c => c.Type == currencyType);

        return await query.OrderBy(c => c.Code).ToListAsync(ct);
    }

    public async Task<IList<Country>> GetCountriesAsync(string? currencyCode, CancellationToken ct)
    {
        var query = db.Countries
            .Include(c => c.Currency)
            .Include(c => c.PaymentMethods)
                .ThenInclude(pm => pm.PaymentMethod)
            .Where(c => c.IsActive)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(currencyCode))
            query = query.Where(c => c.CurrencyCode == currencyCode.ToUpperInvariant());

        return await query.OrderBy(c => c.Name).ToListAsync(ct);
    }
}
