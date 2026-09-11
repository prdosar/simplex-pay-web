using MediatR;
using SimplexPay.Application.Features.Offers.Queries;
using SimplexPay.Application.Features.BoatShipping.Dtos;
using SimplexPay.Application.Interfaces;

namespace SimplexPay.Application.Features.BoatShipping.Queries;

public record GetBoatShippingOffersQuery(
    string? DepartureCountryCode = null,
    string? DestinationCountryCode = null,
    string? Search = null,
    decimal? MinLbs = null,
    decimal? MaxLbs = null,
    string? SortBy = null,
    string? SortDir = null,
    int Page = 1,
    int PageSize = 20,
    bool IsAuthenticated = false,
    bool VerifiedOnly = false,
    decimal? MinRating = null
) : IRequest<PagedResult<BoatShippingOfferDto>>;

public class GetBoatShippingOffersQueryHandler(IBoatShippingOfferRepository repo)
    : IRequestHandler<GetBoatShippingOffersQuery, PagedResult<BoatShippingOfferDto>>
{
    public async Task<PagedResult<BoatShippingOfferDto>> Handle(GetBoatShippingOffersQuery req, CancellationToken ct)
    {
        var (items, total) = await repo.GetPagedAsync(
            req.DepartureCountryCode,
            req.DestinationCountryCode,
            req.Search,
            req.MinLbs,
            req.MaxLbs,
            req.SortBy,
            req.SortDir,
            req.Page,
            Math.Min(req.PageSize, 50),
            req.VerifiedOnly,
            req.MinRating,
            ct);

        var dtos = items.Select(o => BoatShippingOfferDto.From(o, req.IsAuthenticated)).ToList();
        return new PagedResult<BoatShippingOfferDto>(dtos, total, req.Page, Math.Min(req.PageSize, 50));
    }
}
