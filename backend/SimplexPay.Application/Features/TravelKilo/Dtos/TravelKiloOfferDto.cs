using SimplexPay.Domain.Entities;

namespace SimplexPay.Application.Features.TravelKilo.Dtos;

public record TravelKiloOfferDto(
    Guid Id,
    Guid CreatorId,
    string CreatorFirstName,
    decimal CreatorRating,
    int CreatorTransactionCount,
    string? CreatorPhone,
    string? CreatorWhatsApp,
    decimal AvailableKg,
    decimal PricePerKg,
    DateTime TravelDate,
    string DepartureCity,
    string DestinationCity,
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
    public static TravelKiloOfferDto From(TravelKiloOffer o, bool isAuthenticated) => new(
        o.Id,
        o.UserId,
        o.User.FirstName,
        o.User.Rating,
        o.User.TransactionCount,
        isAuthenticated ? o.User.PhoneNumber : MaskPhone(o.User.PhoneNumber),
        isAuthenticated ? o.User.WhatsAppNumber : null,
        o.AvailableKg,
        o.PricePerKg,
        o.TravelDate,
        o.DepartureCity,
        o.DestinationCity,
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
