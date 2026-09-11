using MediatR;
using SimplexPay.Application.Common.Exceptions;
using SimplexPay.Application.Features.BoatShipping.Dtos;
using SimplexPay.Application.Interfaces;

namespace SimplexPay.Application.Features.BoatShipping.Queries;

public record GetBoatShippingOfferByIdQuery(Guid Id, bool IsAuthenticated = false)
    : IRequest<BoatShippingOfferDto>;

public class GetBoatShippingOfferByIdQueryHandler(IBoatShippingOfferRepository repo)
    : IRequestHandler<GetBoatShippingOfferByIdQuery, BoatShippingOfferDto>
{
    public async Task<BoatShippingOfferDto> Handle(GetBoatShippingOfferByIdQuery req, CancellationToken ct)
    {
        var offer = await repo.GetByIdWithDetailsAsync(req.Id, ct)
            ?? throw new NotFoundException("BoatShippingOffer", req.Id);
        return BoatShippingOfferDto.From(offer, req.IsAuthenticated);
    }
}
