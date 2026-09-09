using SimplexPay.Domain.Enums;

namespace SimplexPay.Domain.Entities;

public class BoatShippingOffer : BaseEntity
{
    public Guid UserId { get; private set; }
    public User User { get; private set; } = default!;

    public decimal AvailableLbs { get; private set; }
    public decimal PricePerLb { get; private set; }
    public DateTime ShipDepartureDate { get; private set; }
    public string DeparturePort { get; private set; } = default!;
    public string DestinationPort { get; private set; } = default!;
    public string DepartureCountryCode { get; private set; } = default!;
    public string DestinationCountryCode { get; private set; } = default!;
    public Country DepartureCountry { get; private set; } = default!;
    public Country DestinationCountry { get; private set; } = default!;

    public string? Notes { get; private set; }
    public OfferStatus Status { get; private set; } = OfferStatus.Open;
    public DateTime ExpiresAt { get; private set; }

    private BoatShippingOffer() { }

    public static BoatShippingOffer Create(
        Guid userId,
        decimal availableLbs,
        decimal pricePerLb,
        DateTime shipDepartureDate,
        string departurePort,
        string destinationPort,
        string departureCountryCode,
        string destinationCountryCode,
        string? notes,
        int expiryHours = 720)
    {
        if (availableLbs <= 0) throw new ArgumentException("Le poids disponible doit être positif.");
        if (pricePerLb <= 0) throw new ArgumentException("Le prix par livre doit être positif.");
        if (shipDepartureDate <= DateTime.UtcNow) throw new ArgumentException("La date de départ doit être dans le futur.");

        return new BoatShippingOffer
        {
            UserId = userId,
            AvailableLbs = availableLbs,
            PricePerLb = pricePerLb,
            ShipDepartureDate = shipDepartureDate,
            DeparturePort = departurePort.Trim(),
            DestinationPort = destinationPort.Trim(),
            DepartureCountryCode = departureCountryCode.ToUpperInvariant(),
            DestinationCountryCode = destinationCountryCode.ToUpperInvariant(),
            Notes = notes,
            ExpiresAt = shipDepartureDate // expire le jour du départ
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
