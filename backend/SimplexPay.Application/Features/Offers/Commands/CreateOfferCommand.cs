using FluentValidation;
using MediatR;
using SimplexPay.Application.Common.Exceptions;
using SimplexPay.Application.Features.Offers.Dtos;
using SimplexPay.Application.Interfaces;
using SimplexPay.Domain.Entities;
using SimplexPay.Domain.Enums;

namespace SimplexPay.Application.Features.Offers.Commands;

public record CreateOfferCommand(
    Guid UserId,              // injecté depuis le JWT dans le controller
    string SellCurrencyCode,  // XOF, XAF, NGN, GHS…
    string SellCountryCode,
    decimal Amount,
    string RateMode,          // "Fixed" | "GoogleDaily" | "XeDaily"
    decimal? Rate,            // requis uniquement si RateMode == Fixed
    decimal MinAmount,
    string? Notes,
    int ExpiryHours = 24,
    IList<Guid>? PaymentMethodIds = null
) : IRequest<OfferDto>;

public class CreateOfferCommandValidator : AbstractValidator<CreateOfferCommand>
{
    public CreateOfferCommandValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.SellCurrencyCode).NotEmpty().MaximumLength(5);
        RuleFor(x => x.SellCountryCode).NotEmpty().Length(2, 3);
        RuleFor(x => x.Amount).GreaterThan(0);
        RuleFor(x => x.RateMode).NotEmpty()
            .Must(m => m == "Fixed" || m == "GoogleDaily" || m == "XeDaily")
            .WithMessage("RateMode doit être 'Fixed', 'GoogleDaily' ou 'XeDaily'.");
        RuleFor(x => x.Rate).GreaterThan(0)
            .When(x => x.RateMode == "Fixed")
            .WithMessage("Le taux doit être renseigné et positif quand RateMode = Fixed.");
        RuleFor(x => x.MinAmount).GreaterThan(0);
        RuleFor(x => x.Notes).MaximumLength(500).When(x => x.Notes != null);
        RuleFor(x => x.ExpiryHours).InclusiveBetween(1, 168);
    }
}

public class CreateOfferCommandHandler(IOfferRepository offerRepo) : IRequestHandler<CreateOfferCommand, OfferDto>
{
    private const string BuyCurrencyCode = "CAD";
    private const string BuyCountryCode = "CA";

    public async Task<OfferDto> Handle(CreateOfferCommand req, CancellationToken ct)
    {
        if (!Enum.TryParse<OfferRateMode>(req.RateMode, out var rateMode))
            throw new ConflictException("RateMode d'offre invalide.");

        var offer = Offer.Create(
            userId: req.UserId,
            type: OfferType.Sell,
            sellCurrencyCode: req.SellCurrencyCode,
            buyCurrencyCode: BuyCurrencyCode,
            sellCountryCode: req.SellCountryCode,
            buyCountryCode: BuyCountryCode,
            amount: req.Amount,
            rateMode: rateMode,
            rate: req.Rate,
            minAmount: req.MinAmount,
            maxAmount: null,
            notes: req.Notes,
            expiryHours: req.ExpiryHours
        );

        if (req.PaymentMethodIds != null)
        {
            foreach (var pmId in req.PaymentMethodIds)
                offer.AddPaymentMethod(pmId, OfferSide.From);
        }

        await offerRepo.AddAsync(offer, ct);
        await offerRepo.SaveChangesAsync(ct);

        var saved = await offerRepo.GetByIdWithDetailsAsync(offer.Id, ct)
            ?? throw new NotFoundException("Offer", offer.Id);

        return OfferDto.From(saved, isAuthenticated: true);
    }
}
