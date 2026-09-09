using Microsoft.EntityFrameworkCore;
using SimplexPay.Application.Interfaces;
using SimplexPay.Domain.Entities;
using SimplexPay.Domain.Enums;
using SimplexPay.Infrastructure.Persistence;

namespace SimplexPay.Infrastructure.Repositories;

public class TravelKiloOfferRepository(AppDbContext db) : ITravelKiloOfferRepository
{
    public Task<TravelKiloOffer?> GetByIdWithDetailsAsync(Guid id, CancellationToken ct) =>
        db.TravelKiloOffers
          .Include(o => o.User)
          .Include(o => o.DepartureCountry)
          .Include(o => o.DestinationCountry)
          .FirstOrDefaultAsync(o => o.Id == id, ct);

    public async Task<(IList<TravelKiloOffer> Items, int Total)> GetPagedAsync(
        string? departureCountryCode,
        string? destinationCountryCode,
        string? search,
        int page,
        int pageSize,
        CancellationToken ct)
    {
        var query = db.TravelKiloOffers
            .Include(o => o.User)
            .Include(o => o.DepartureCountry)
            .Include(o => o.DestinationCountry)
            .Where(o => o.Status == OfferStatus.Open && o.ExpiresAt > DateTime.UtcNow)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(departureCountryCode))
            query = query.Where(o => o.DepartureCountryCode == departureCountryCode.ToUpperInvariant());

        if (!string.IsNullOrWhiteSpace(destinationCountryCode))
            query = query.Where(o => o.DestinationCountryCode == destinationCountryCode.ToUpperInvariant());

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(o =>
                o.DepartureCity.ToLower().Contains(s) ||
                o.DestinationCity.ToLower().Contains(s) ||
                o.User.FirstName.ToLower().Contains(s));
        }

        query = query.OrderBy(o => o.TravelDate);

        var total = await query.CountAsync(ct);
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);
        return (items, total);
    }

    public async Task AddAsync(TravelKiloOffer offer, CancellationToken ct) =>
        await db.TravelKiloOffers.AddAsync(offer, ct);

    public Task SaveChangesAsync(CancellationToken ct) =>
        db.SaveChangesAsync(ct);
}
