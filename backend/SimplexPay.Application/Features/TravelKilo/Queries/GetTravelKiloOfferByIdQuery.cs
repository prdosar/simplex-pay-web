using MediatR;
using SimplexPay.Application.Common.Exceptions;
using SimplexPay.Application.Features.TravelKilo.Dtos;
using SimplexPay.Application.Interfaces;

namespace SimplexPay.Application.Features.TravelKilo.Queries;

public record GetTravelKiloOfferByIdQuery(Guid Id, bool IsAuthenticated = false)
    : IRequest<TravelKiloOfferDto>;

public class GetTravelKiloOfferByIdQueryHandler(ITravelKiloOfferRepository repo)
    : IRequestHandler<GetTravelKiloOfferByIdQuery, TravelKiloOfferDto>
{
    public async Task<TravelKiloOfferDto> Handle(GetTravelKiloOfferByIdQuery req, CancellationToken ct)
    {
        var offer = await repo.GetByIdWithDetailsAsync(req.Id, ct)
            ?? throw new NotFoundException("TravelKiloOffer", req.Id);
        return TravelKiloOfferDto.From(offer, req.IsAuthenticated);
    }
}
