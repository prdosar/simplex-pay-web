using SimplexPay.Domain.Enums;

namespace SimplexPay.Domain.Entities;

public class Offer : BaseEntity
{
    public Guid UserId { get; private set; }
    public User User { get; private set; } = default!;

    // Type de l'offre du point de vue du créateur
    public OfferType Type { get; private set; }

    // Devise-produit (XOF, XAF, NGN, GHS)
    public string SellCurrencyCode { get; private set; } = default!;
    public SupportedCurrency SellCurrency { get; private set; } = default!;

    // Devise d'achat (CAD, USD, EUR)
    public string BuyCurrencyCode { get; private set; } = default!;
    public SupportedCurrency BuyCurrency { get; private set; } = default!;

    // Pays côté devise d'achat (ex: CA)
    public string BuyCountryCode { get; private set; } = default!;
    public Country BuyCountry { get; private set; } = default!;

    // Montant en devise-produit (XOF, XAF, etc.)
    public decimal Amount { get; private set; }
    public decimal AmountFilled { get; private set; } = 0;

    // Taux : combien d'unités de devise-produit pour 1 unité de devise d'achat
    // Ex: 490 XOF pour 1 CAD. Null si RateMode != Fixed (taux Google/XE résolu à l'affichage).
    public decimal? Rate { get; private set; }
    public OfferRateMode RateMode { get; private set; } = OfferRateMode.Fixed;

    public decimal MinAmount { get; private set; }
    public decimal? MaxAmount { get; private set; }
    public string? Notes { get; private set; }
    public OfferStatus Status { get; private set; } = OfferStatus.Open;
    // Nullable = ne jamais expirer. Seul le créateur peut clôturer via Cancel().
    public DateTime? ExpiresAt { get; private set; }

    private readonly List<OfferCountry> _countries = [];
    private readonly List<OfferPaymentMethod> _paymentMethods = [];
    private readonly List<Transaction> _transactions = [];

    // Pays côté devise-produit — plusieurs autorisés (intégrations UEMOA/CEMAC : XOF partagé par
    // 8 pays, XAF par 6). Tous doivent partager SellCurrencyCode.
    public IReadOnlyCollection<OfferCountry> Countries => _countries.AsReadOnly();
    public IReadOnlyCollection<OfferPaymentMethod> PaymentMethods => _paymentMethods.AsReadOnly();
    public IReadOnlyCollection<Transaction> Transactions => _transactions.AsReadOnly();

    public decimal RemainingAmount => Amount - AmountFilled;
    public decimal BuyEquivalent => Rate is > 0 ? Amount / Rate.Value : 0;

    private Offer() { }

    public static Offer Create(
        Guid userId,
        OfferType type,
        string sellCurrencyCode,
        string buyCurrencyCode,
        IEnumerable<string> sellCountryCodes,
        string buyCountryCode,
        decimal amount,
        OfferRateMode rateMode,
        decimal? rate,
        decimal minAmount,
        decimal? maxAmount,
        string? notes,
        int? expiryHours = null)
    {
        if (amount <= 0) throw new ArgumentException("Le montant doit être positif.");
        if (rateMode == OfferRateMode.Fixed && (rate is null || rate <= 0))
            throw new ArgumentException("Un taux positif est requis en mode fixe.");
        if (minAmount <= 0) throw new ArgumentException("Le montant minimum doit être positif.");
        if (maxAmount is not null && minAmount > maxAmount)
            throw new ArgumentException("Le minimum ne peut pas dépasser le maximum.");
        if (minAmount > amount) throw new ArgumentException("Le minimum ne peut pas dépasser le montant total.");

        var codes = sellCountryCodes?
            .Where(c => !string.IsNullOrWhiteSpace(c))
            .Select(c => c.ToUpperInvariant())
            .Distinct()
            .ToList() ?? [];
        if (codes.Count == 0) throw new ArgumentException("Au moins un pays de vente est requis.");

        var offer = new Offer
        {
            UserId = userId,
            Type = type,
            SellCurrencyCode = sellCurrencyCode.ToUpperInvariant(),
            BuyCurrencyCode = buyCurrencyCode.ToUpperInvariant(),
            BuyCountryCode = buyCountryCode.ToUpperInvariant(),
            Amount = amount,
            RateMode = rateMode,
            Rate = rateMode == OfferRateMode.Fixed ? rate : null,
            MinAmount = minAmount,
            MaxAmount = maxAmount,
            Notes = notes,
            ExpiresAt = expiryHours is > 0 ? DateTime.UtcNow.AddHours(expiryHours.Value) : null
        };
        foreach (var code in codes)
            offer._countries.Add(OfferCountry.Create(offer.Id, code));
        return offer;
    }

    public void AddPaymentMethod(Guid paymentMethodId, OfferSide side)
    {
        if (_paymentMethods.Any(pm => pm.PaymentMethodId == paymentMethodId && pm.Side == side))
            return;
        _paymentMethods.Add(OfferPaymentMethod.Create(Id, paymentMethodId, side));
    }

    public void Fill(decimal filledAmount)
    {
        if (filledAmount > RemainingAmount)
            throw new InvalidOperationException("Le montant dépasse le solde restant de l'offre.");
        AmountFilled += filledAmount;
        Status = AmountFilled >= Amount ? OfferStatus.Filled : OfferStatus.PartiallyFilled;
        MarkUpdated();
    }

    public void Cancel()
    {
        if (Status == OfferStatus.Filled)
            throw new InvalidOperationException("Impossible d'annuler une offre complétée.");
        Status = OfferStatus.Cancelled;
        MarkUpdated();
    }

    /// <summary>Mise à jour éditoriale par le propriétaire.
    /// Immuables : devises (recréer une offre pour changer). Pays et modes de paiement modifiables.</summary>
    public void Update(
        decimal amount,
        decimal remainingAmount,
        OfferRateMode rateMode,
        decimal? rate,
        decimal minAmount,
        decimal? maxAmount,
        string? notes,
        DateTime? expiresAt,
        OfferStatus status)
    {
        if (amount <= 0) throw new ArgumentException("Le montant doit être positif.");
        if (remainingAmount < 0 || remainingAmount > amount)
            throw new ArgumentException("Le montant restant doit être entre 0 et le montant total.");
        if (rateMode == OfferRateMode.Fixed && (rate is null || rate <= 0))
            throw new ArgumentException("Un taux positif est requis en mode fixe.");
        if (minAmount <= 0) throw new ArgumentException("Le montant minimum doit être positif.");
        if (maxAmount is not null && minAmount > maxAmount)
            throw new ArgumentException("Le minimum ne peut pas dépasser le maximum.");
        if (minAmount > amount) throw new ArgumentException("Le minimum ne peut pas dépasser le montant total.");

        Amount = amount;
        AmountFilled = amount - remainingAmount;
        RateMode = rateMode;
        Rate = rateMode == OfferRateMode.Fixed ? rate : null;
        MinAmount = minAmount;
        MaxAmount = maxAmount;
        Notes = notes;
        ExpiresAt = expiresAt;
        Status = status;
        MarkUpdated();
    }

    /// <summary>Remplace intégralement la liste des pays de vente. Tous doivent partager SellCurrencyCode
    /// (validation à la charge du handler qui a accès aux entités Country).</summary>
    public void SetCountries(IEnumerable<string> countryCodes)
    {
        var codes = countryCodes?
            .Where(c => !string.IsNullOrWhiteSpace(c))
            .Select(c => c.ToUpperInvariant())
            .Distinct()
            .ToList() ?? [];
        if (codes.Count == 0) throw new ArgumentException("Au moins un pays de vente est requis.");
        _countries.Clear();
        foreach (var code in codes)
            _countries.Add(OfferCountry.Create(Id, code));
    }

    /// <summary>Remplace les modes de paiement (côté vendeur uniquement).
    /// Appelé par le handler qui a une visibilité sur l'ID de la relation.</summary>
    public void ClearPaymentMethods() => _paymentMethods.Clear();
}
