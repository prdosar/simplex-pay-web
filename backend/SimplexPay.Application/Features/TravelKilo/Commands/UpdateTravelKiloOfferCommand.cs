using FluentValidation;
using MediatR;
using SimplexPay.Application.Common.Exceptions;
using SimplexPay.Application.Features.TravelKilo.Dtos;
using SimplexPay.Application.Interfaces;
using SimplexPay.Domain.Enums;

namespace SimplexPay.Application.Features.TravelKilo.Commands;

public record UpdateTravelKiloOfferCommand(
    Guid OfferId,
    Guid UserId,
    decimal AvailableKg,
    decimal PricePerKg,
    DateTime TravelDate,
    string DepartureCity,
    string DestinationCity,
    string DepartureCountryCode,
    string DestinationCountryCode,
    string? Notes,
    string Status
) : IRequest<TravelKiloOfferDto>;

public class UpdateTravelKiloOfferCommandValidator : AbstractValidator<UpdateTravelKiloOfferCommand>
{
    public UpdateTravelKiloOfferCommandValidator()
    {
        RuleFor(x => x.AvailableKg).GreaterThan(0);
        RuleFor(x => x.PricePerKg).GreaterThan(0);
        RuleFor(x => x.DepartureCity).NotEmpty().MaximumLength(100);
        RuleFor(x => x.DestinationCity).NotEmpty().MaximumLength(100);
        RuleFor(x => x.DepartureCountryCode).NotEmpty().Length(2, 3);
        RuleFor(x => x.DestinationCountryCode).NotEmpty().Length(2, 3);
        RuleFor(x => x.Notes).MaximumLength(500).When(x => x.Notes != null);
        RuleFor(x => x.Status).NotEmpty()
            .Must(s => s == "Open" || s == "PartiallyFilled" || s == "Filled" || s == "Cancelled" || s == "Expired");
    }
}

public class UpdateTravelKiloOfferCommandHandler(ITravelKiloOfferRepository repo)
    : IRequestHandler<UpdateTravelKiloOfferCommand, TravelKiloOfferDto>
{
    public async Task<TravelKiloOfferDto> Handle(UpdateTravelKiloOfferCommand req, CancellationToken ct)
    {
        var offer = await repo.GetByIdWithDetailsAsync(req.OfferId, ct)
            ?? throw new NotFoundException("TravelKiloOffer", req.OfferId);

        if (offer.UserId != req.UserId)
            throw new ForbiddenException("Vous n'êtes pas propriétaire de cette offre.");

        if (!Enum.TryParse<OfferStatus>(req.Status, out var status))
            throw new ConflictException("Status invalide.");

        offer.Update(
            availableKg: req.AvailableKg,
            pricePerKg: req.PricePerKg,
            travelDate: req.TravelDate,
            departureCity: req.DepartureCity,
            destinationCity: req.DestinationCity,
            departureCountryCode: req.DepartureCountryCode,
            destinationCountryCode: req.DestinationCountryCode,
            notes: req.Notes,
            status: status);

        await repo.SaveChangesAsync(ct);

        var saved = await repo.GetByIdWithDetailsAsync(offer.Id, ct)
            ?? throw new NotFoundException("TravelKiloOffer", offer.Id);
        return TravelKiloOfferDto.From(saved, isAuthenticated: true);
    }
}
