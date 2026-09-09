using SimplexPay.Domain.Entities;

namespace SimplexPay.Application.Features.BoatShipping.Dtos;

public record BoatShippingOfferDto(
    Guid Id,
    Guid CreatorId,
    string CreatorFirstName,
    decimal CreatorRating,
    int CreatorTransactionCount,
    string? CreatorPhone,
    string? CreatorWhatsApp,
    decimal AvailableLbs,
    decimal PricePerLb,
    DateTime ShipDepartureDate,
    string DeparturePort,
    string DestinationPort,
    string DepartureCountryCode,
    string DestinationCountryCode,
    string DepartureCountryFlag,
    string DestinationCountryFlag,
    string? Notes,
    string Status,
    DateTime ExpiresAt,
    DateTime CreatedAt
)
{
    public static BoatShippingOfferDto From(BoatShippingOffer o, bool isAuthenticated) => new(
        o.Id,
        o.UserId,
        o.User.FirstName,
        o.User.Rating,
        o.User.TransactionCount,
        isAuthenticated ? o.User.PhoneNumber : MaskPhone(o.User.PhoneNumber),
        isAuthenticated ? o.User.WhatsAppNumber : null,
        o.AvailableLbs,
        o.PricePerLb,
        o.ShipDepartureDate,
        o.DeparturePort,
        o.DestinationPort,
        o.DepartureCountryCode,
        o.DestinationCountryCode,
        o.DepartureCountry?.Flag ?? "",
        o.DestinationCountry?.Flag ?? "",
        o.Notes,
        o.Status.ToString(),
        o.ExpiresAt,
        o.CreatedAt
    );

    private static string MaskPhone(string phone)
    {
        if (string.IsNullOrWhiteSpace(phone) || phone.Length < 4) return "••••••••••";
        return new string('•', phone.Length - 4) + phone[^4..];
    }
}
