using MediatR;
using SimplexPay.Application.Features.Offers.Queries;
using SimplexPay.Application.Features.TravelKilo.Dtos;
using SimplexPay.Application.Interfaces;

namespace SimplexPay.Application.Features.TravelKilo.Queries;

public record GetMyTravelKiloOffersQuery(Guid UserId, int Page = 1, int PageSize = 20)
    : IRequest<PagedResult<TravelKiloOfferDto>>;

public class GetMyTravelKiloOffersQueryHandler(ITravelKiloOfferRepository repo)
    : IRequestHandler<GetMyTravelKiloOffersQuery, PagedResult<TravelKiloOfferDto>>
{
    public async Task<PagedResult<TravelKiloOfferDto>> Handle(GetMyTravelKiloOffersQuery req, CancellationToken ct)
    {
        var pageSize = Math.Min(req.PageSize, 50);
        var (items, total) = await repo.GetByUserIdPagedAsync(req.UserId, req.Page, pageSize, ct);
        var dtos = items.Select(o => TravelKiloOfferDto.From(o, isAuthenticated: true)).ToList();
        return new PagedResult<TravelKiloOfferDto>(dtos, total, req.Page, pageSize);
    }
}
