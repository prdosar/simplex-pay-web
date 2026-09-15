using FluentValidation;
using MediatR;
using SimplexPay.Application.Common.Exceptions;
using SimplexPay.Application.Features.Offers.Dtos;
using SimplexPay.Application.Interfaces;
using SimplexPay.Domain.Entities;
using SimplexPay.Domain.Enums;

namespace SimplexPay.Application.Features.Offers.Commands;

public record CreateOfferCommand(
    Guid UserId,                       // injecté depuis le JWT dans le controller
    IList<string> SellCountryCodes,    // au moins 1. Tous doivent partager la même devise (UEMOA/CEMAC).
    decimal Amount,
    string RateMode,                   // "Fixed" | "GoogleDaily" | "XeDaily"
    decimal? Rate,                     // requis uniquement si RateMode == Fixed
    decimal MinAmount,
    string? Notes,
    // Null (défaut) = ne jamais expirer. Sinon nombre d'heures avant expiration (legacy).
    int? ExpiryHours = null,
    IList<Guid>? PaymentMethodIds = null
) : IRequest<OfferDto>;

public class CreateOfferCommandValidator : AbstractValidator<CreateOfferCommand>
{
    public CreateOfferCommandValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.SellCountryCodes)
            .NotNull()
            .Must(c => c != null && c.Count > 0)
            .WithMessage("Sélectionne au moins un pays.");
        RuleForEach(x => x.SellCountryCodes).NotEmpty().Length(2, 3);
        RuleFor(x => x.Amount).GreaterThan(0);
        RuleFor(x => x.RateMode).NotEmpty()
            .Must(m => m == "Fixed" || m == "GoogleDaily" || m == "XeDaily")
            .WithMessage("RateMode doit être 'Fixed', 'GoogleDaily' ou 'XeDaily'.");
        RuleFor(x => x.Rate).GreaterThan(0)
            .When(x => x.RateMode == "Fixed")
            .WithMessage("Le taux doit être renseigné et positif quand RateMode = Fixed.");
        RuleFor(x => x.MinAmount).GreaterThan(0);
        RuleFor(x => x.Notes).MaximumLength(500).When(x => x.Notes != null);
        RuleFor(x => x.ExpiryHours).InclusiveBetween(1, 168)
            .When(x => x.ExpiryHours.HasValue);
    }
}

public class CreateOfferCommandHandler(
    IOfferRepository offerRepo,
    ICurrencyRepository currencyRepo,
    IRealtimeNotifier realtime)
    : IRequestHandler<CreateOfferCommand, OfferDto>
{
    private const string BuyCurrencyCode = "CAD";
    private const string BuyCountryCode = "CA";

    public async Task<OfferDto> Handle(CreateOfferCommand req, CancellationToken ct)
    {
        if (!Enum.TryParse<OfferRateMode>(req.RateMode, out var rateMode))
            throw new ConflictException("RateMode d'offre invalide.");

        var codes = req.SellCountryCodes
            .Where(c => !string.IsNullOrWhiteSpace(c))
            .Select(c => c.ToUpperInvariant())
            .Distinct()
            .ToList();
        if (codes.Count == 0)
            throw new ConflictException("Sélectionne au moins un pays.");

        // On charge tous les pays (petite table), filtre par codes, vérifie qu'ils partagent la devise.
        var allCountries = await currencyRepo.GetCountriesAsync(null, ct);
        var selected = allCountries.Where(c => codes.Contains(c.Code)).ToList();
        if (selected.Count != codes.Count)
        {
            var missing = codes.Except(selected.Select(c => c.Code));
            throw new ConflictException($"Pays inconnu(s) : {string.Join(", ", missing)}.");
        }
        var currencies = selected.Select(c => c.CurrencyCode).Distinct().ToList();
        if (currencies.Count > 1)
            throw new ConflictException($"Les pays sélectionnés doivent partager la même devise (trouvé : {string.Join(", ", currencies)}).");
        var sellCurrencyCode = currencies[0];

        var offer = Offer.Create(
            userId: req.UserId,
            type: OfferType.Sell,
            sellCurrencyCode: sellCurrencyCode,
            buyCurrencyCode: BuyCurrencyCode,
            sellCountryCodes: codes,
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

        await realtime.NotifyNewOfferAsync("devises", saved.Id, ct);

        return OfferDto.From(saved, isAuthenticated: true);
    }
}
