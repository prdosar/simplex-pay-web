using SimplexPay.Domain.Entities;

namespace SimplexPay.Application.Features.Admin.Dtos;

/// <summary>Un moyen de paiement dans le contexte d'un pays (avec IsPopular).</summary>
public record AdminCountryPaymentMethodDto(
    Guid Id,
    string Name,
    string? Description,
    string Type,          // "Cash" | "BankTransfer" | "MobileMoney" | "Other"
    bool IsActive,
    bool IsPopular,
    int OfferUsageCount   // nombre d'offres actives qui utilisent ce PM (0 → suppression safe)
);

/// <summary>Vue globale d'un moyen de paiement (indépendant du pays).</summary>
public record AdminPaymentMethodDto(
    Guid Id,
    string Name,
    string? Description,
    string Type,
    bool IsActive,
    int CountryCount,     // nombre de pays où ce PM est rattaché
    int OfferUsageCount
)
{
    public static AdminPaymentMethodDto From(PaymentMethod pm, int countryCount, int offerUsageCount) =>
        new(pm.Id, pm.Name, pm.Description, pm.Type.ToString(), pm.IsActive, countryCount, offerUsageCount);
}

/// <summary>Pays avec le compteur de moyens de paiement rattachés.</summary>
public record AdminCountrySummaryDto(
    string Code,
    string Name,
    string NameFr,
    string CurrencyCode,
    string Flag,
    int PaymentMethodCount
);
