using FluentValidation;
using MediatR;
using SimplexPay.Application.Common.Exceptions;
using SimplexPay.Application.Features.BoatShipping.Dtos;
using SimplexPay.Application.Interfaces;
using SimplexPay.Domain.Entities;

namespace SimplexPay.Application.Features.BoatShipping.Commands;

public record CreateBoatShippingOfferCommand(
    Guid UserId,
    decimal AvailableLbs,
    decimal PricePerLb,
    DateTime ShipDepartureDate,
    string DeparturePort,
    string DestinationPort,
    string DepartureCountryCode,
    string DestinationCountryCode,
    string? Notes
) : IRequest<BoatShippingOfferDto>;

public class CreateBoatShippingOfferCommandValidator : AbstractValidator<CreateBoatShippingOfferCommand>
{
    public CreateBoatShippingOfferCommandValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.AvailableLbs).GreaterThan(0);
        RuleFor(x => x.PricePerLb).GreaterThan(0);
        RuleFor(x => x.ShipDepartureDate).GreaterThan(DateTime.UtcNow).WithMessage("La date de départ doit être dans le futur.");
        RuleFor(x => x.DeparturePort).NotEmpty().MaximumLength(100);
        RuleFor(x => x.DestinationPort).NotEmpty().MaximumLength(100);
        RuleFor(x => x.DepartureCountryCode).NotEmpty().Length(2, 3);
        RuleFor(x => x.DestinationCountryCode).NotEmpty().Length(2, 3);
        RuleFor(x => x.Notes).MaximumLength(500).When(x => x.Notes != null);
    }
}

public class CreateBoatShippingOfferCommandHandler(IBoatShippingOfferRepository repo, IRealtimeNotifier realtime)
    : IRequestHandler<CreateBoatShippingOfferCommand, BoatShippingOfferDto>
{
    public async Task<BoatShippingOfferDto> Handle(CreateBoatShippingOfferCommand req, CancellationToken ct)
    {
        var offer = BoatShippingOffer.Create(
            req.UserId, req.AvailableLbs, req.PricePerLb, req.ShipDepartureDate,
            req.DeparturePort, req.DestinationPort,
            req.DepartureCountryCode, req.DestinationCountryCode,
            req.Notes);

        await repo.AddAsync(offer, ct);
        await repo.SaveChangesAsync(ct);

        var saved = await repo.GetByIdWithDetailsAsync(offer.Id, ct)
            ?? throw new NotFoundException("BoatShippingOffer", offer.Id);

        await realtime.NotifyNewOfferAsync("bateau", saved.Id, ct);

        return BoatShippingOfferDto.From(saved, isAuthenticated: true);
    }
}
