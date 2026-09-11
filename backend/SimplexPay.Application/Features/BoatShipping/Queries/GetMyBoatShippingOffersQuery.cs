using MediatR;
using SimplexPay.Application.Features.BoatShipping.Dtos;
using SimplexPay.Application.Features.Offers.Queries;
using SimplexPay.Application.Interfaces;

namespace SimplexPay.Application.Features.BoatShipping.Queries;

public record GetMyBoatShippingOffersQuery(Guid UserId, int Page = 1, int PageSize = 20)
    : IRequest<PagedResult<BoatShippingOfferDto>>;

public class GetMyBoatShippingOffersQueryHandler(IBoatShippingOfferRepository repo)
    : IRequestHandler<GetMyBoatShippingOffersQuery, PagedResult<BoatShippingOfferDto>>
{
    public async Task<PagedResult<BoatShippingOfferDto>> Handle(GetMyBoatShippingOffersQuery req, CancellationToken ct)
    {
        var pageSize = Math.Min(req.PageSize, 50);
        var (items, total) = await repo.GetByUserIdPagedAsync(req.UserId, req.Page, pageSize, ct);
        var dtos = items.Select(o => BoatShippingOfferDto.From(o, isAuthenticated: true)).ToList();
        return new PagedResult<BoatShippingOfferDto>(dtos, total, req.Page, pageSize);
    }
}
