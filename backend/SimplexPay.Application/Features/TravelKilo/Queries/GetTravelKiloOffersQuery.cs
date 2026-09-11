using MediatR;
using SimplexPay.Application.Features.Offers.Queries;
using SimplexPay.Application.Features.TravelKilo.Dtos;
using SimplexPay.Application.Interfaces;

namespace SimplexPay.Application.Features.TravelKilo.Queries;

public record GetTravelKiloOffersQuery(
    string? DepartureCountryCode = null,
    string? DestinationCountryCode = null,
    string? Search = null,
    decimal? MinKg = null,
    decimal? MaxKg = null,
    string? SortBy = null,
    string? SortDir = null,
    int Page = 1,
    int PageSize = 20,
    bool IsAuthenticated = false,
    bool VerifiedOnly = false,
    decimal? MinRating = null
) : IRequest<PagedResult<TravelKiloOfferDto>>;

public class GetTravelKiloOffersQueryHandler(ITravelKiloOfferRepository repo)
    : IRequestHandler<GetTravelKiloOffersQuery, PagedResult<TravelKiloOfferDto>>
{
    public async Task<PagedResult<TravelKiloOfferDto>> Handle(GetTravelKiloOffersQuery req, CancellationToken ct)
    {
        var (items, total) = await repo.GetPagedAsync(
            req.DepartureCountryCode,
            req.DestinationCountryCode,
            req.Search,
            req.MinKg,
            req.MaxKg,
            req.SortBy,
            req.SortDir,
            req.Page,
            Math.Min(req.PageSize, 50),
            req.VerifiedOnly,
            req.MinRating,
            ct);

        var dtos = items.Select(o => TravelKiloOfferDto.From(o, req.IsAuthenticated)).ToList();
        return new PagedResult<TravelKiloOfferDto>(dtos, total, req.Page, Math.Min(req.PageSize, 50));
    }
}
