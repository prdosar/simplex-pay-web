using FluentValidation;
using MediatR;
using SimplexPay.Application.Common.Exceptions;
using SimplexPay.Application.Features.Offers.Dtos;
using SimplexPay.Application.Interfaces;
using SimplexPay.Domain.Enums;

namespace SimplexPay.Application.Features.Offers.Commands;

public record UpdateOfferCommand(
    Guid OfferId,
    Guid UserId,
    decimal Amount,
    decimal RemainingAmount,
    string RateMode,
    decimal? Rate,
    decimal MinAmount,
    decimal? MaxAmount,
    string? Notes,
    // Null = ne jamais expirer.
    DateTime? ExpiresAt,
    string Status,
    IList<Guid>? PaymentMethodIds,
    // Null = ne pas toucher aux pays. Sinon liste complète (au moins 1, tous même devise que l'offre).
    IList<string>? SellCountryCodes
) : IRequest<OfferDto>;

public class UpdateOfferCommandValidator : AbstractValidator<UpdateOfferCommand>
{
    public UpdateOfferCommandValidator()
    {
        RuleFor(x => x.OfferId).NotEmpty();
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.Amount).GreaterThan(0);
        RuleFor(x => x.RemainingAmount).GreaterThanOrEqualTo(0);
        RuleFor(x => x.RateMode).NotEmpty()
            .Must(m => m == "Fixed" || m == "GoogleDaily" || m == "XeDaily");
        RuleFor(x => x.Rate).GreaterThan(0).When(x => x.RateMode == "Fixed");
        RuleFor(x => x.MinAmount).GreaterThan(0);
        RuleFor(x => x.Notes).MaximumLength(500).When(x => x.Notes != null);
        RuleFor(x => x.Status).NotEmpty()
            .Must(s => s == "Open" || s == "PartiallyFilled" || s == "Filled" || s == "Cancelled" || s == "Expired");
        RuleFor(x => x.SellCountryCodes)
            .Must(c => c == null || c.Count > 0)
            .WithMessage("Sélectionne au moins un pays.");
        RuleForEach(x => x.SellCountryCodes!)
            .NotEmpty().Length(2, 3)
            .When(x => x.SellCountryCodes != null);
    }
}

public class UpdateOfferCommandHandler(IOfferRepository offerRepo, ICurrencyRepository currencyRepo)
    : IRequestHandler<UpdateOfferCommand, OfferDto>
{
    public async Task<OfferDto> Handle(UpdateOfferCommand req, CancellationToken ct)
    {
        var offer = await offerRepo.GetByIdWithDetailsAsync(req.OfferId, ct)
            ?? throw new NotFoundException("Offer", req.OfferId);

        if (offer.UserId != req.UserId)
            throw new ForbiddenException("Vous n'êtes pas propriétaire de cette offre.");

        if (!Enum.TryParse<OfferRateMode>(req.RateMode, out var rateMode))
            throw new ConflictException("RateMode invalide.");
        if (!Enum.TryParse<OfferStatus>(req.Status, out var status))
            throw new ConflictException("Status invalide.");

        offer.Update(
            amount: req.Amount,
            remainingAmount: req.RemainingAmount,
            rateMode: rateMode,
            rate: req.Rate,
            minAmount: req.MinAmount,
            maxAmount: req.MaxAmount,
            notes: req.Notes,
            expiresAt: req.ExpiresAt,
            status: status
        );

        // Mise à jour de la liste de pays si fournie — tous doivent partager offer.SellCurrencyCode.
        if (req.SellCountryCodes != null)
        {
            var codes = req.SellCountryCodes
                .Where(c => !string.IsNullOrWhiteSpace(c))
                .Select(c => c.ToUpperInvariant())
                .Distinct()
                .ToList();
            if (codes.Count == 0)
                throw new ConflictException("Sélectionne au moins un pays.");

            var allCountries = await currencyRepo.GetCountriesAsync(null, ct);
            var selected = allCountries.Where(c => codes.Contains(c.Code)).ToList();
            if (selected.Count != codes.Count)
            {
                var missing = codes.Except(selected.Select(c => c.Code));
                throw new ConflictException($"Pays inconnu(s) : {string.Join(", ", missing)}.");
            }
            if (selected.Any(c => c.CurrencyCode != offer.SellCurrencyCode))
                throw new ConflictException($"Les pays doivent utiliser la devise {offer.SellCurrencyCode}.");

            offer.SetCountries(codes);
        }

        // Remplacer entièrement les méthodes de paiement si fourni.
        if (req.PaymentMethodIds != null)
        {
            offer.ClearPaymentMethods();
            foreach (var pmId in req.PaymentMethodIds)
                offer.AddPaymentMethod(pmId, OfferSide.From);
        }

        await offerRepo.SaveChangesAsync(ct);

        var saved = await offerRepo.GetByIdWithDetailsAsync(offer.Id, ct)
            ?? throw new NotFoundException("Offer", offer.Id);
        return OfferDto.From(saved, isAuthenticated: true);
    }
}
