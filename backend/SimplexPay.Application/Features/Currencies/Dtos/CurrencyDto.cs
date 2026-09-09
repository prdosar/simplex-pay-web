using SimplexPay.Domain.Entities;

namespace SimplexPay.Application.Features.Currencies.Dtos;

public record CurrencyDto(
    string Code,
    string Name,
    string NameFr,
    string Symbol,
    string Type,
    int DecimalPlaces
)
{
    public static CurrencyDto From(SupportedCurrency c) =>
        new(c.Code, c.Name, c.NameFr, c.Symbol, c.Type.ToString(), c.DecimalPlaces);
}

public record PaymentMethodDto(
    Guid Id,
    string Name,
    string? Description,
    string Type,
    string? LogoUrl,
    bool IsPopular
);

public record CountryDto(
    string Code,
    string Name,
    string NameFr,
    string CurrencyCode,
    string CurrencyType,
    string Flag,
    IList<PaymentMethodDto> PaymentMethods
)
{
    public static CountryDto From(Country c) =>
        new(
            c.Code,
            c.Name,
            c.NameFr,
            c.CurrencyCode,
            c.Currency?.Type.ToString() ?? "Sell",
            c.Flag,
            c.PaymentMethods
                .Select(pm => new PaymentMethodDto(
                    pm.PaymentMethodId,
                    pm.PaymentMethod.Name,
                    pm.PaymentMethod.Description,
                    pm.PaymentMethod.Type.ToString(),
                    pm.PaymentMethod.LogoUrl,
                    pm.IsPopular))
                .OrderByDescending(pm => pm.IsPopular)
                .ThenBy(pm => pm.Name)
                .ToList()
        );
}
