using SimplexPay.Domain.Entities;

namespace SimplexPay.Application.Interfaces;

public interface ITravelKiloOfferRepository
{
    Task<TravelKiloOffer?> GetByIdWithDetailsAsync(Guid id, CancellationToken ct = default);
    Task<(IList<TravelKiloOffer> Items, int Total)> GetPagedAsync(
        string? departureCountryCode,
        string? destinationCountryCode,
        string? search,
        decimal? minKg,
        decimal? maxKg,
        string? sortBy,
        string? sortDir,
        int page,
        int pageSize,
        bool verifiedOnly = false,
        decimal? minRating = null,
        CancellationToken ct = default);
    Task<(IList<TravelKiloOffer> Items, int Total)> GetByUserIdPagedAsync(
        Guid userId, int page, int pageSize, CancellationToken ct = default);
    Task<(int Total, int Active, int NewThisWeek)> GetStatsAsync(CancellationToken ct = default);
    Task<IList<CountryFacet>> GetCountryFacetsAsync(CancellationToken ct = default);
    Task AddAsync(TravelKiloOffer offer, CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);
}
