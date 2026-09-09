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
    string Type,              // "Sell" | "Buy"
    string SellCurrencyCode,  // XOF, XAF, NGN, GHS
    string BuyCurrencyCode,   // CAD, USD, EUR
    string SellCountryCode,
    string BuyCountryCode,
    decimal Amount,
    decimal Rate,
    decimal MinAmount,
    decimal MaxAmount,
    string? Notes,
    int ExpiryHours = 24,
    IList<OfferPaymentMethodInput>? PaymentMethods = null
) : IRequest<OfferDto>;

public record OfferPaymentMethodInput(Guid PaymentMethodId, string Side);

public class CreateOfferCommandValidator : AbstractValidator<CreateOfferCommand>
{
    public CreateOfferCommandValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.Type).NotEmpty()
            .Must(t => t == "Sell" || t == "Buy")
            .WithMessage("Type doit être 'Sell' ou 'Buy'.");
        RuleFor(x => x.SellCurrencyCode).NotEmpty().MaximumLength(5);
        RuleFor(x => x.BuyCurrencyCode).NotEmpty().MaximumLength(5);
        RuleFor(x => x.SellCountryCode).NotEmpty().Length(2, 3);
        RuleFor(x => x.BuyCountryCode).NotEmpty().Length(2, 3);
        RuleFor(x => x.Amount).GreaterThan(0);
        RuleFor(x => x.Rate).GreaterThan(0);
        RuleFor(x => x.MinAmount).GreaterThan(0);
        RuleFor(x => x.MaxAmount).GreaterThanOrEqualTo(x => x.MinAmount);
        RuleFor(x => x.Notes).MaximumLength(500).When(x => x.Notes != null);
        RuleFor(x => x.ExpiryHours).InclusiveBetween(1, 168);
        RuleForEach(x => x.PaymentMethods)
            .Must(pm => pm.Side == "From" || pm.Side == "To")
            .WithMessage("Side doit être 'From' ou 'To'.")
            .When(x => x.PaymentMethods != null);
    }
}

public class CreateOfferCommandHandler(IOfferRepository offerRepo) : IRequestHandler<CreateOfferCommand, OfferDto>
{
    public async Task<OfferDto> Handle(CreateOfferCommand req, CancellationToken ct)
    {
        if (!Enum.TryParse<OfferType>(req.Type, out var offerType))
            throw new ConflictException("Type d'offre invalide.");

        var offer = Offer.Create(
            userId: req.UserId,
            type: offerType,
            sellCurrencyCode: req.SellCurrencyCode,
            buyCurrencyCode: req.BuyCurrencyCode,
            sellCountryCode: req.SellCountryCode,
            buyCountryCode: req.BuyCountryCode,
            amount: req.Amount,
            rate: req.Rate,
            minAmount: req.MinAmount,
            maxAmount: req.MaxAmount,
            notes: req.Notes,
            expiryHours: req.ExpiryHours
        );

        if (req.PaymentMethods != null)
        {
            foreach (var pm in req.PaymentMethods)
                if (Enum.TryParse<OfferSide>(pm.Side, out var side))
                    offer.AddPaymentMethod(pm.PaymentMethodId, side);
        }

        await offerRepo.AddAsync(offer, ct);
        await offerRepo.SaveChangesAsync(ct);

        var saved = await offerRepo.GetByIdWithDetailsAsync(offer.Id, ct)
            ?? throw new NotFoundException("Offer", offer.Id);

        return OfferDto.From(saved, isAuthenticated: true);
    }
}
