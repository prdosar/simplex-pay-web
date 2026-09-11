using MediatR;
using SimplexPay.Application.Features.Offers.Dtos;
using SimplexPay.Application.Interfaces;

namespace SimplexPay.Application.Features.Offers.Queries;

public record GetOffersQuery(
    string? SellCurrencyCode = null,
    string? BuyCurrencyCode = null,
    string? Type = null,
    string? SellCountryCode = null,
    string? BuyCountryCode = null,
    int Page = 1,
    int PageSize = 20,
    bool IsAuthenticated = false,
    string? SortBy = null,
    string? SortDir = null,
    string? Search = null,
    decimal? MinAmount = null,
    decimal? MaxAmount = null,
    IReadOnlyList<Guid>? PaymentMethodIds = null,
    bool VerifiedOnly = false,
    decimal? MinRating = null
) : IRequest<PagedResult<OfferDto>>;

public record PagedResult<T>(IList<T> Items, int Total, int Page, int PageSize)
{
    public int TotalPages => (int)Math.Ceiling((double)Total / PageSize);
}

public class GetOffersQueryHandler(IOfferRepository offerRepo)
    : IRequestHandler<GetOffersQuery, PagedResult<OfferDto>>
{
    public async Task<PagedResult<OfferDto>> Handle(GetOffersQuery req, CancellationToken ct)
    {
        var filter = new OfferFilter(
            req.SellCurrencyCode,
            req.BuyCurrencyCode,
            req.Type,
            req.SellCountryCode,
            req.BuyCountryCode,
            Status: "Open",
            Page: req.Page,
            PageSize: Math.Min(req.PageSize, 50),
            SortBy: req.SortBy,
            SortDir: req.SortDir,
            Search: req.Search,
            MinAmount: req.MinAmount,
            MaxAmount: req.MaxAmount,
            PaymentMethodIds: req.PaymentMethodIds,
            VerifiedOnly: req.VerifiedOnly,
            MinRating: req.MinRating
        );

        var (items, total) = await offerRepo.GetPagedAsync(filter, ct);

        var dtos = items.Select(o => OfferDto.From(o, req.IsAuthenticated)).ToList();

        return new PagedResult<OfferDto>(dtos, total, req.Page, filter.PageSize);
    }
}
