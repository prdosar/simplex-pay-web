using MediatR;
using SimplexPay.Application.Features.Offers.Queries;
using SimplexPay.Application.Features.TravelKilo.Dtos;
using SimplexPay.Application.Interfaces;

namespace SimplexPay.Application.Features.TravelKilo.Queries;

public record GetTravelKiloOffersQuery(
    string? DepartureCountryCode = null,
    string? DestinationCountryCode = null,
    string? Search = null,
    int Page = 1,
    int PageSize = 20,
    bool IsAuthenticated = false
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
            req.Page,
            Math.Min(req.PageSize, 50),
            ct);

        var dtos = items.Select(o => TravelKiloOfferDto.From(o, req.IsAuthenticated)).ToList();
        return new PagedResult<TravelKiloOfferDto>(dtos, total, req.Page, Math.Min(req.PageSize, 50));
    }
}
