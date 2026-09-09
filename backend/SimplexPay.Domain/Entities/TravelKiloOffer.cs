using SimplexPay.Domain.Enums;

namespace SimplexPay.Domain.Entities;

public class TravelKiloOffer : BaseEntity
{
    public Guid UserId { get; private set; }
    public User User { get; private set; } = default!;

    public decimal AvailableKg { get; private set; }
    public decimal PricePerKg { get; private set; }
    public DateTime TravelDate { get; private set; }
    public string DepartureCity { get; private set; } = default!;
    public string DestinationCity { get; private set; } = default!;
    public string DepartureCountryCode { get; private set; } = default!;
    public string DestinationCountryCode { get; private set; } = default!;
    public Country DepartureCountry { get; private set; } = default!;
    public Country DestinationCountry { get; private set; } = default!;

    public string? Notes { get; private set; }
    public OfferStatus Status { get; private set; } = OfferStatus.Open;
    public DateTime ExpiresAt { get; private set; }

    private TravelKiloOffer() { }

    public static TravelKiloOffer Create(
        Guid userId,
        decimal availableKg,
        decimal pricePerKg,
        DateTime travelDate,
        string departureCity,
        string destinationCity,
        string departureCountryCode,
        string destinationCountryCode,
        string? notes,
        int expiryHours = 168)
    {
        if (availableKg <= 0) throw new ArgumentException("Le poids disponible doit être positif.");
        if (pricePerKg <= 0) throw new ArgumentException("Le prix par kilo doit être positif.");
        if (travelDate <= DateTime.UtcNow) throw new ArgumentException("La date de voyage doit être dans le futur.");

        return new TravelKiloOffer
        {
            UserId = userId,
            AvailableKg = availableKg,
            PricePerKg = pricePerKg,
            TravelDate = travelDate,
            DepartureCity = departureCity.Trim(),
            DestinationCity = destinationCity.Trim(),
            DepartureCountryCode = departureCountryCode.ToUpperInvariant(),
            DestinationCountryCode = destinationCountryCode.ToUpperInvariant(),
            Notes = notes,
            ExpiresAt = travelDate // expire le jour du voyage
        };
    }

    public void Cancel()
    {
        if (Status == OfferStatus.Filled)
            throw new InvalidOperationException("Impossible d'annuler une offre complétée.");
        Status = OfferStatus.Cancelled;
        MarkUpdated();
    }
}
