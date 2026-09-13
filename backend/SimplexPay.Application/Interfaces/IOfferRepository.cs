using SimplexPay.Domain.Entities;

namespace SimplexPay.Application.Interfaces;

public interface IOfferRepository
{
    Task<Offer?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Offer?> GetByIdWithDetailsAsync(Guid id, CancellationToken ct = default);
    Task<(IList<Offer> Items, int Total)> GetPagedAsync(OfferFilter filter, CancellationToken ct = default);
    Task<IList<PaymentMethodFacet>> GetPaymentMethodFacetsAsync(OfferFilter filter, CancellationToken ct = default);
    Task<IList<CountryFacet>> GetCountryFacetsAsync(CancellationToken ct = default);
    Task<(int Total, int Active, int NewThisWeek)> GetStatsAsync(CancellationToken ct = default);
    Task<(IList<Offer> Items, int Total)> GetByUserIdPagedAsync(Guid userId, int page, int pageSize, CancellationToken ct = default);
    Task AddAsync(Offer offer, CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);
}

public record OfferFilter(
    string? SellCurrencyCode = null,
    string? BuyCurrencyCode = null,
    string? OfferType = null,
    string? SellCountryCode = null,
    string? BuyCountryCode = null,
    string? Status = "Open",
    int Page = 1,
    int PageSize = 20,
    string? SortBy = null,
    string? SortDir = null,
    string? Search = null,
    decimal? MinAmount = null,
    decimal? MaxAmount = null,
    IReadOnlyList<Guid>? PaymentMethodIds = null,
    bool VerifiedOnly = false,
    decimal? MinRating = null
);

public record PaymentMethodFacet(Guid Id, string Name, int Count);

public record CountryFacet(string Code, int Count);
