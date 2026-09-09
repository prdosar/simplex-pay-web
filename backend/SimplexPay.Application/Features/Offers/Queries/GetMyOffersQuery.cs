using MediatR;
using SimplexPay.Application.Features.Offers.Dtos;
using SimplexPay.Application.Interfaces;

namespace SimplexPay.Application.Features.Offers.Queries;

public record GetMyOffersQuery(Guid UserId, int Page, int PageSize) : IRequest<PagedResult<OfferDto>>;

public class GetMyOffersQueryHandler(IOfferRepository offerRepo)
    : IRequestHandler<GetMyOffersQuery, PagedResult<OfferDto>>
{
    public async Task<PagedResult<OfferDto>> Handle(GetMyOffersQuery req, CancellationToken ct)
    {
        var pageSize = Math.Min(req.PageSize, 50);
        var (items, total) = await offerRepo.GetByUserIdPagedAsync(req.UserId, req.Page, pageSize, ct);
        var dtos = items.Select(o => OfferDto.From(o, isAuthenticated: true)).ToList();
        return new PagedResult<OfferDto>(dtos, total, req.Page, pageSize);
    }
}
