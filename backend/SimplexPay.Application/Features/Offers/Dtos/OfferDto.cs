using SimplexPay.Domain.Entities;

namespace SimplexPay.Application.Features.Offers.Dtos;

public record OfferDto(
    Guid Id,
    string Type,                    // "Sell" | "Buy"
    string SellCurrency,
    string SellCurrencySymbol,
    string BuyCurrency,
    string BuyCurrencySymbol,
    // Pays côté devise-produit : plusieurs (intégrations sous-régionnales UEMOA/CEMAC).
    // Tous partagent SellCurrency. Le frontend résout drapeau/nom via /api/countries.
    IList<string> SellCountries,
    string BuyCountry,
    string BuyCountryFlag,
    decimal Amount,
    decimal AmountFilled,
    decimal RemainingAmount,
    string RateMode,                // "Fixed" | "GoogleDaily" | "XeDaily"
    decimal? Rate,                  // unités de SellCurrency par 1 BuyCurrency (null si RateMode != Fixed)
    decimal BuyEquivalent,          // montant équivalent en BuyCurrency (0 si Rate non fixé)
    decimal MinAmount,
    decimal? MaxAmount,
    string Status,
    // Null = ne jamais expirer (offres devises). Le créateur clôture manuellement.
    DateTime? ExpiresAt,
    DateTime CreatedAt,
    OfferCreatorDto Creator,
    IList<OfferPaymentMethodDto> PaymentMethods,
    string? Notes
)
{
    public static OfferDto From(Offer offer, bool isAuthenticated)
    {
        return new OfferDto(
            offer.Id,
            offer.Type.ToString(),
            offer.SellCurrencyCode,
            offer.SellCurrency?.Symbol ?? offer.SellCurrencyCode,
            offer.BuyCurrencyCode,
            offer.BuyCurrency?.Symbol ?? offer.BuyCurrencyCode,
            offer.Countries.Select(c => c.CountryCode).OrderBy(c => c).ToList(),
            offer.BuyCountryCode,
            offer.BuyCountry?.Flag ?? "",
            offer.Amount,
            offer.AmountFilled,
            offer.RemainingAmount,
            offer.RateMode.ToString(),
            offer.Rate,
            offer.BuyEquivalent,
            offer.MinAmount,
            offer.MaxAmount,
            offer.Status.ToString(),
            offer.ExpiresAt,
            offer.CreatedAt,
            OfferCreatorDto.From(offer.User, isAuthenticated),
            offer.PaymentMethods
                .Select(pm => new OfferPaymentMethodDto(
                    pm.PaymentMethod?.Name ?? pm.PaymentMethodId.ToString(),
                    pm.PaymentMethod?.Type.ToString() ?? "",
                    pm.Side.ToString()))
                .ToList(),
            offer.Notes
        );
    }
}

public record OfferCreatorDto(
    Guid Id,
    string FirstName,
    string? LastName,               // null pour anonyme
    decimal Rating,
    int ReviewCount,
    int TransactionCount,
    bool IsCertified,
    string? Phone,                  // null pour anonyme
    string? WhatsApp                // null pour anonyme
)
{
    public static OfferCreatorDto From(User user, bool isAuthenticated) => new(
        user.Id,
        user.FirstName,
        isAuthenticated ? user.LastName : null,
        user.Rating,
        user.ReviewCount,
        user.TransactionCount,
        user.IsCertified,
        isAuthenticated ? user.PhoneNumber : MaskPhone(user.PhoneNumber),
        isAuthenticated ? user.WhatsAppNumber : null
    );

    private static string MaskPhone(string phone)
    {
        if (string.IsNullOrWhiteSpace(phone) || phone.Length < 4) return "••••••••••";
        return new string('•', phone.Length - 4) + phone[^4..];
    }
}

public record OfferPaymentMethodDto(string Name, string Type, string Side);
