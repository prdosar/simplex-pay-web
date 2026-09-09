using SimplexPay.Domain.Enums;

namespace SimplexPay.Domain.Entities;

public class OfferPaymentMethod
{
    public Guid OfferId { get; private set; }
    public Offer Offer { get; private set; } = default!;

    public Guid PaymentMethodId { get; private set; }
    public PaymentMethod PaymentMethod { get; private set; } = default!;

    public OfferSide Side { get; private set; }

    private OfferPaymentMethod() { }

    public static OfferPaymentMethod Create(Guid offerId, Guid paymentMethodId, OfferSide side) =>
        new() { OfferId = offerId, PaymentMethodId = paymentMethodId, Side = side };
}
