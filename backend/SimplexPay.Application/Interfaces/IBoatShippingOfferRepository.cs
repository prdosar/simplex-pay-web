using SimplexPay.Domain.Entities;

namespace SimplexPay.Application.Interfaces;

public interface IBoatShippingOfferRepository
{
    Task<BoatShippingOffer?> GetByIdWithDetailsAsync(Guid id, CancellationToken ct = default);
    Task<(IList<BoatShippingOffer> Items, int Total)> GetPagedAsync(
        string? departureCountryCode,
        string? destinationCountryCode,
        string? search,
        int page,
        int pageSize,
        CancellationToken ct = default);
    Task AddAsync(BoatShippingOffer offer, CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);
}
