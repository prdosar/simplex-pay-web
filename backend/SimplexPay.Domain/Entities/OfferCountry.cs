namespace SimplexPay.Domain.Entities;

public class OfferCountry
{
    public Guid OfferId { get; private set; }
    public Offer Offer { get; private set; } = default!;

    public string CountryCode { get; private set; } = default!;
    public Country Country { get; private set; } = default!;

    private OfferCountry() { }

    public static OfferCountry Create(Guid offerId, string countryCode) =>
        new() { OfferId = offerId, CountryCode = countryCode.ToUpperInvariant() };
}
