using SimplexPay.Domain.Entities;

namespace SimplexPay.Application.Interfaces;

public interface IBoatShippingOfferRepository
{
    Task<BoatShippingOffer?> GetByIdWithDetailsAsync(Guid id, CancellationToken ct = default);
    Task<(IList<BoatShippingOffer> Items, int Total)> GetPagedAsync(
        string? departureCountryCode,
        string? destinationCountryCode,
        string? search,
        decimal? minLbs,
        decimal? maxLbs,
        string? sortBy,
        string? sortDir,
        int page,
        int pageSize,
        bool verifiedOnly = false,
        decimal? minRating = null,
        CancellationToken ct = default);
    Task<(IList<BoatShippingOffer> Items, int Total)> GetByUserIdPagedAsync(
        Guid userId, int page, int pageSize, CancellationToken ct = default);
    Task AddAsync(BoatShippingOffer offer, CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);
}
