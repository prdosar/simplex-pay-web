using FluentValidation;
using MediatR;
using SimplexPay.Application.Common.Exceptions;
using SimplexPay.Application.Features.BoatShipping.Dtos;
using SimplexPay.Application.Interfaces;
using SimplexPay.Domain.Enums;

namespace SimplexPay.Application.Features.BoatShipping.Commands;

public record UpdateBoatShippingOfferCommand(
    Guid OfferId,
    Guid UserId,
    decimal AvailableLbs,
    decimal PricePerLb,
    DateTime ShipDepartureDate,
    string DeparturePort,
    string DestinationPort,
    string DepartureCountryCode,
    string DestinationCountryCode,
    string? Notes,
    string Status
) : IRequest<BoatShippingOfferDto>;

public class UpdateBoatShippingOfferCommandValidator : AbstractValidator<UpdateBoatShippingOfferCommand>
{
    public UpdateBoatShippingOfferCommandValidator()
    {
        RuleFor(x => x.AvailableLbs).GreaterThan(0);
        RuleFor(x => x.PricePerLb).GreaterThan(0);
        RuleFor(x => x.DeparturePort).NotEmpty().MaximumLength(100);
        RuleFor(x => x.DestinationPort).NotEmpty().MaximumLength(100);
        RuleFor(x => x.DepartureCountryCode).NotEmpty().Length(2, 3);
        RuleFor(x => x.DestinationCountryCode).NotEmpty().Length(2, 3);
        RuleFor(x => x.Notes).MaximumLength(500).When(x => x.Notes != null);
        RuleFor(x => x.Status).NotEmpty()
            .Must(s => s == "Open" || s == "PartiallyFilled" || s == "Filled" || s == "Cancelled" || s == "Expired");
    }
}

public class UpdateBoatShippingOfferCommandHandler(IBoatShippingOfferRepository repo)
    : IRequestHandler<UpdateBoatShippingOfferCommand, BoatShippingOfferDto>
{
    public async Task<BoatShippingOfferDto> Handle(UpdateBoatShippingOfferCommand req, CancellationToken ct)
    {
        var offer = await repo.GetByIdWithDetailsAsync(req.OfferId, ct)
            ?? throw new NotFoundException("BoatShippingOffer", req.OfferId);

        if (offer.UserId != req.UserId)
            throw new ForbiddenException("Vous n'êtes pas propriétaire de cette offre.");

        if (!Enum.TryParse<OfferStatus>(req.Status, out var status))
            throw new ConflictException("Status invalide.");

        offer.Update(
            availableLbs: req.AvailableLbs,
            pricePerLb: req.PricePerLb,
            shipDepartureDate: req.ShipDepartureDate,
            departurePort: req.DeparturePort,
            destinationPort: req.DestinationPort,
            departureCountryCode: req.DepartureCountryCode,
            destinationCountryCode: req.DestinationCountryCode,
            notes: req.Notes,
            status: status);

        await repo.SaveChangesAsync(ct);

        var saved = await repo.GetByIdWithDetailsAsync(offer.Id, ct)
            ?? throw new NotFoundException("BoatShippingOffer", offer.Id);
        return BoatShippingOfferDto.From(saved, isAuthenticated: true);
    }
}
