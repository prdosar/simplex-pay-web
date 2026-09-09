using MediatR;
using SimplexPay.Application.Common.Exceptions;
using SimplexPay.Application.Interfaces;

namespace SimplexPay.Application.Features.Offers.Commands;

public record CancelOfferCommand(Guid OfferId, Guid UserId) : IRequest;

public class CancelOfferCommandHandler(IOfferRepository offerRepo)
    : IRequestHandler<CancelOfferCommand>
{
    public async Task Handle(CancelOfferCommand req, CancellationToken ct)
    {
        var offer = await offerRepo.GetByIdAsync(req.OfferId, ct)
            ?? throw new NotFoundException("Offre", req.OfferId);

        if (offer.UserId != req.UserId)
            throw new ForbiddenException("Vous n'êtes pas le créateur de cette offre.");

        offer.Cancel();
        await offerRepo.SaveChangesAsync(ct);
    }
}
