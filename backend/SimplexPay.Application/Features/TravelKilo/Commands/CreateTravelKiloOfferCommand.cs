using FluentValidation;
using MediatR;
using SimplexPay.Application.Common.Exceptions;
using SimplexPay.Application.Features.TravelKilo.Dtos;
using SimplexPay.Application.Interfaces;
using SimplexPay.Domain.Entities;

namespace SimplexPay.Application.Features.TravelKilo.Commands;

public record CreateTravelKiloOfferCommand(
    Guid UserId,
    decimal AvailableKg,
    decimal PricePerKg,
    DateTime TravelDate,
    string DepartureCity,
    string DestinationCity,
    string DepartureCountryCode,
    string DestinationCountryCode,
    string? Notes
) : IRequest<TravelKiloOfferDto>;

public class CreateTravelKiloOfferCommandValidator : AbstractValidator<CreateTravelKiloOfferCommand>
{
    public CreateTravelKiloOfferCommandValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.AvailableKg).GreaterThan(0).LessThanOrEqualTo(500);
        RuleFor(x => x.PricePerKg).GreaterThan(0);
        RuleFor(x => x.TravelDate).GreaterThan(DateTime.UtcNow).WithMessage("La date de voyage doit être dans le futur.");
        RuleFor(x => x.DepartureCity).NotEmpty().MaximumLength(100);
        RuleFor(x => x.DestinationCity).NotEmpty().MaximumLength(100);
        RuleFor(x => x.DepartureCountryCode).NotEmpty().Length(2, 3);
        RuleFor(x => x.DestinationCountryCode).NotEmpty().Length(2, 3);
        RuleFor(x => x.Notes).MaximumLength(500).When(x => x.Notes != null);
    }
}

public class CreateTravelKiloOfferCommandHandler(ITravelKiloOfferRepository repo)
    : IRequestHandler<CreateTravelKiloOfferCommand, TravelKiloOfferDto>
{
    public async Task<TravelKiloOfferDto> Handle(CreateTravelKiloOfferCommand req, CancellationToken ct)
    {
        var offer = TravelKiloOffer.Create(
            req.UserId, req.AvailableKg, req.PricePerKg, req.TravelDate,
            req.DepartureCity, req.DestinationCity,
            req.DepartureCountryCode, req.DestinationCountryCode,
            req.Notes);

        await repo.AddAsync(offer, ct);
        await repo.SaveChangesAsync(ct);

        var saved = await repo.GetByIdWithDetailsAsync(offer.Id, ct)
            ?? throw new NotFoundException("TravelKiloOffer", offer.Id);

        return TravelKiloOfferDto.From(saved, isAuthenticated: true);
    }
}
