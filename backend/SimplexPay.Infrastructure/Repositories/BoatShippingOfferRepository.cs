using Microsoft.EntityFrameworkCore;
using SimplexPay.Application.Interfaces;
using SimplexPay.Domain.Entities;
using SimplexPay.Domain.Enums;
using SimplexPay.Infrastructure.Persistence;

namespace SimplexPay.Infrastructure.Repositories;

public class BoatShippingOfferRepository(AppDbContext db) : IBoatShippingOfferRepository
{
    public Task<BoatShippingOffer?> GetByIdWithDetailsAsync(Guid id, CancellationToken ct) =>
        db.BoatShippingOffers
          .Include(o => o.User)
          .Include(o => o.DepartureCountry)
          .Include(o => o.DestinationCountry)
          .FirstOrDefaultAsync(o => o.Id == id, ct);

    public async Task<(IList<BoatShippingOffer> Items, int Total)> GetPagedAsync(
        string? departureCountryCode,
        string? destinationCountryCode,
        string? search,
        decimal? minLbs,
        decimal? maxLbs,
        string? sortBy,
        string? sortDir,
        int page,
        int pageSize,
        bool verifiedOnly,
        decimal? minRating,
        CancellationToken ct)
    {
        var query = db.BoatShippingOffers
            .Include(o => o.User)
            .Include(o => o.DepartureCountry)
            .Include(o => o.DestinationCountry)
            .Where(o => (o.Status == OfferStatus.Open || o.Status == OfferStatus.PartiallyFilled) && o.ExpiresAt > DateTime.UtcNow)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(departureCountryCode))
            query = query.Where(o => o.DepartureCountryCode == departureCountryCode.ToUpperInvariant());

        if (!string.IsNullOrWhiteSpace(destinationCountryCode))
            query = query.Where(o => o.DestinationCountryCode == destinationCountryCode.ToUpperInvariant());

        if (minLbs.HasValue)
            query = query.Where(o => o.AvailableLbs >= minLbs.Value);

        if (maxLbs.HasValue)
            query = query.Where(o => o.AvailableLbs <= maxLbs.Value);

        if (verifiedOnly)
            query = query.Where(o => o.User.IsCertified);

        if (minRating.HasValue)
            query = query.Where(o => o.User.Rating >= minRating.Value);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(o =>
                o.DeparturePort.ToLower().Contains(s) ||
                o.DestinationPort.ToLower().Contains(s) ||
                o.User.FirstName.ToLower().Contains(s));
        }

        query = sortBy switch
        {
            "price" when sortDir == "desc" => query.OrderByDescending(o => o.PricePerLb),
            "price" => query.OrderBy(o => o.PricePerLb),
            "lbs" => query.OrderByDescending(o => o.AvailableLbs),
            "date" => query.OrderBy(o => o.ShipDepartureDate),
            _ => query.OrderByDescending(o => o.CreatedAt)
        };

        var total = await query.CountAsync(ct);
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);
        return (items, total);
    }

    public async Task<(IList<BoatShippingOffer> Items, int Total)> GetByUserIdPagedAsync(
        Guid userId, int page, int pageSize, CancellationToken ct)
    {
        var query = db.BoatShippingOffers
            .Include(o => o.DepartureCountry)
            .Include(o => o.DestinationCountry)
            .Include(o => o.User)
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
        var total = await db.BoatShippingOffers.CountAsync(ct);
        var active = await db.BoatShippingOffers.CountAsync(o => (o.Status == OfferStatus.Open || o.Status == OfferStatus.PartiallyFilled) && o.ExpiresAt > now, ct);
        var newThisWeek = await db.BoatShippingOffers.CountAsync(o => o.CreatedAt >= weekAgo, ct);
        return (total, active, newThisWeek);
    }

    public async Task AddAsync(BoatShippingOffer offer, CancellationToken ct) =>
        await db.BoatShippingOffers.AddAsync(offer, ct);

    public Task SaveChangesAsync(CancellationToken ct) =>
        db.SaveChangesAsync(ct);
}
