using Microsoft.EntityFrameworkCore;
using SimplexPay.Application.Interfaces;
using SimplexPay.Domain.Entities;
using SimplexPay.Domain.Enums;
using SimplexPay.Infrastructure.Persistence;

namespace SimplexPay.Infrastructure.Repositories;

public class OfferRepository(AppDbContext db) : IOfferRepository
{
    public Task<Offer?> GetByIdAsync(Guid id, CancellationToken ct) =>
        db.Offers.FirstOrDefaultAsync(o => o.Id == id, ct);

    public Task<Offer?> GetByIdWithDetailsAsync(Guid id, CancellationToken ct) =>
        db.Offers
          .Include(o => o.User)
          .Include(o => o.SellCurrency)
          .Include(o => o.BuyCurrency)
          .Include(o => o.Countries)
              .ThenInclude(oc => oc.Country)
          .Include(o => o.BuyCountry)
          .Include(o => o.PaymentMethods)
              .ThenInclude(pm => pm.PaymentMethod)
          .FirstOrDefaultAsync(o => o.Id == id, ct);

    public async Task<(IList<Offer> Items, int Total)> GetPagedAsync(OfferFilter filter, CancellationToken ct)
    {
        var query = db.Offers
            .Include(o => o.User)
            .Include(o => o.SellCurrency)
            .Include(o => o.BuyCurrency)
            .Include(o => o.Countries)
                .ThenInclude(oc => oc.Country)
            .Include(o => o.BuyCountry)
            .Include(o => o.PaymentMethods)
                .ThenInclude(pm => pm.PaymentMethod)
            .AsQueryable();

        query = ApplyFilters(query, filter);

        query = filter.SortBy switch
        {
            "rate" when filter.SortDir == "asc" => query.OrderBy(o => o.Rate),
            "rate" => query.OrderByDescending(o => o.Rate),
            "amount" when filter.SortDir == "asc" => query.OrderBy(o => o.Amount - o.AmountFilled),
            "amount" => query.OrderByDescending(o => o.Amount - o.AmountFilled),
            _ => query.OrderByDescending(o => o.CreatedAt)
        };

        var total = await query.CountAsync(ct);
        var skip = (filter.Page - 1) * filter.PageSize;
        var items = await query.Skip(skip).Take(filter.PageSize).ToListAsync(ct);

        return (items, total);
    }

    public async Task<IList<PaymentMethodFacet>> GetPaymentMethodFacetsAsync(OfferFilter filter, CancellationToken ct)
    {
        var offerIds = ApplyFilters(db.Offers.AsQueryable(), filter, includePaymentMethodFilter: false)
            .Select(o => o.Id);

        var raw = await db.OfferPaymentMethods
            .Where(opm => offerIds.Contains(opm.OfferId))
            .GroupBy(opm => new { opm.PaymentMethodId, opm.PaymentMethod.Name })
            .Select(g => new { g.Key.PaymentMethodId, g.Key.Name, Count = g.Count() })
            .OrderByDescending(f => f.Count)
            .ToListAsync(ct);

        return raw.Select(r => new PaymentMethodFacet(r.PaymentMethodId, r.Name, r.Count)).ToList();
    }

    public async Task<(IList<Offer> Items, int Total)> GetByUserIdPagedAsync(Guid userId, int page, int pageSize, CancellationToken ct)
    {
        var query = db.Offers
            .Include(o => o.User)
            .Include(o => o.SellCurrency)
            .Include(o => o.BuyCurrency)
            .Include(o => o.Countries)
                .ThenInclude(oc => oc.Country)
            .Include(o => o.BuyCountry)
            .Include(o => o.PaymentMethods)
                .ThenInclude(pm => pm.PaymentMethod)
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt);

        var total = await query.CountAsync(ct);
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);
        return (items, total);
    }

    public async Task<(int Total, int Active, int NewThisWeek)> GetStatsAsync(CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        var weekAgo = now.AddDays(-7);
        var total = await db.Offers.CountAsync(ct);
        var active = await db.Offers.CountAsync(o => (o.Status == OfferStatus.Open || o.Status == OfferStatus.PartiallyFilled) && o.ExpiresAt > now, ct);
        var newThisWeek = await db.Offers.CountAsync(o => o.CreatedAt >= weekAgo, ct);
        return (total, active, newThisWeek);
    }

    public async Task AddAsync(Offer offer, CancellationToken ct) =>
        await db.Offers.AddAsync(offer, ct);

    public Task SaveChangesAsync(CancellationToken ct) =>
        db.SaveChangesAsync(ct);

    private IQueryable<Offer> ApplyFilters(IQueryable<Offer> query, OfferFilter filter, bool includePaymentMethodFilter = true)
    {
        if (!string.IsNullOrWhiteSpace(filter.SellCurrencyCode))
            query = query.Where(o => o.SellCurrencyCode == filter.SellCurrencyCode.ToUpperInvariant());

        if (!string.IsNullOrWhiteSpace(filter.BuyCurrencyCode))
            query = query.Where(o => o.BuyCurrencyCode == filter.BuyCurrencyCode.ToUpperInvariant());

        if (!string.IsNullOrWhiteSpace(filter.OfferType) && Enum.TryParse<OfferType>(filter.OfferType, out var offerType))
            query = query.Where(o => o.Type == offerType);

        // Multi-pays : l'offre est visible sous n'importe lequel des pays sélectionnés (UEMOA/CEMAC).
        if (!string.IsNullOrWhiteSpace(filter.SellCountryCode))
        {
            var sellCode = filter.SellCountryCode.ToUpperInvariant();
            query = query.Where(o => o.Countries.Any(oc => oc.CountryCode == sellCode));
        }

        if (!string.IsNullOrWhiteSpace(filter.BuyCountryCode))
            query = query.Where(o => o.BuyCountryCode == filter.BuyCountryCode.ToUpperInvariant());

        // "Open" côté public = statut visible utilisateur "Active" ou "Partiel" (offre encore disponible).
        // Une offre partielle reste vendable pour son montant restant.
        if (filter.Status == "Open")
            query = query.Where(o => o.Status == OfferStatus.Open || o.Status == OfferStatus.PartiallyFilled);
        else if (!string.IsNullOrWhiteSpace(filter.Status) && Enum.TryParse<OfferStatus>(filter.Status, out var status))
            query = query.Where(o => o.Status == status);

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim().ToLower();
            if (decimal.TryParse(filter.Search, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var amount))
                query = query.Where(o => o.Amount - o.AmountFilled >= amount && o.MinAmount <= amount);
            else
                query = query.Where(o =>
                    o.User.FirstName.ToLower().Contains(search) ||
                    o.User.LastName.ToLower().Contains(search) ||
                    (o.Notes != null && o.Notes.ToLower().Contains(search)));
        }

        if (filter.MinAmount.HasValue)
            query = query.Where(o => o.Amount - o.AmountFilled >= filter.MinAmount.Value);

        if (filter.MaxAmount.HasValue)
            query = query.Where(o => o.MinAmount <= filter.MaxAmount.Value);

        if (includePaymentMethodFilter && filter.PaymentMethodIds is { Count: > 0 } ids)
            query = query.Where(o => o.PaymentMethods.Any(pm => ids.Contains(pm.PaymentMethodId)));

        if (filter.VerifiedOnly)
            query = query.Where(o => o.User.IsCertified);

        if (filter.MinRating.HasValue)
            query = query.Where(o => o.User.Rating >= filter.MinRating.Value);

        query = query.Where(o => o.ExpiresAt > DateTime.UtcNow);

        return query;
    }
}
