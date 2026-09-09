using MediatR;
using SimplexPay.Application.Common.Exceptions;
using SimplexPay.Application.Features.Offers.Dtos;
using SimplexPay.Application.Interfaces;

namespace SimplexPay.Application.Features.Offers.Queries;

public record GetOfferByIdQuery(Guid Id, bool IsAuthenticated = false) : IRequest<OfferDto>;

public class GetOfferByIdQueryHandler(IOfferRepository offerRepo)
    : IRequestHandler<GetOfferByIdQuery, OfferDto>
{
    public async Task<OfferDto> Handle(GetOfferByIdQuery req, CancellationToken ct)
    {
        var offer = await offerRepo.GetByIdWithDetailsAsync(req.Id, ct)
            ?? throw new NotFoundException("Offre", req.Id);

        return OfferDto.From(offer, req.IsAuthenticated);
    }
}
