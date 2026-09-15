using Microsoft.EntityFrameworkCore;
using SimplexPay.Application.Interfaces;
using SimplexPay.Domain.Entities;
using SimplexPay.Infrastructure.Persistence;

namespace SimplexPay.Infrastructure.Repositories;

public class PaymentMethodAdminRepository(AppDbContext db) : IPaymentMethodAdminRepository
{
    public Task<IList<PaymentMethod>> GetAllAsync(CancellationToken ct) =>
        db.PaymentMethods
            .Include(p => p.Countries)
            .OrderBy(p => p.Name)
            .ToListAsync(ct)
            .ContinueWith(t => (IList<PaymentMethod>)t.Result, ct);

    public Task<PaymentMethod?> GetByIdAsync(Guid id, CancellationToken ct) =>
        db.PaymentMethods.FirstOrDefaultAsync(p => p.Id == id, ct);

    public Task<Country?> GetCountryWithPaymentMethodsAsync(string countryCode, CancellationToken ct) =>
        db.Countries
            .Include(c => c.PaymentMethods)
                .ThenInclude(cpm => cpm.PaymentMethod)
            .FirstOrDefaultAsync(c => c.Code == countryCode, ct);

    public Task<IList<Country>> GetAllCountriesWithCountsAsync(CancellationToken ct) =>
        db.Countries
            .Include(c => c.PaymentMethods)
            .OrderBy(c => c.Name)
            .ToListAsync(ct)
            .ContinueWith(t => (IList<Country>)t.Result, ct);

    public Task<int> CountOfferUsageAsync(Guid paymentMethodId, CancellationToken ct) =>
        db.OfferPaymentMethods.CountAsync(opm => opm.PaymentMethodId == paymentMethodId, ct);

    public async Task AddAsync(PaymentMethod paymentMethod, CancellationToken ct) =>
        await db.PaymentMethods.AddAsync(paymentMethod, ct);

    public Task RemoveAsync(PaymentMethod paymentMethod, CancellationToken ct)
    {
        db.PaymentMethods.Remove(paymentMethod);
        return Task.CompletedTask;
    }

    public Task SaveChangesAsync(CancellationToken ct) => db.SaveChangesAsync(ct);
}
