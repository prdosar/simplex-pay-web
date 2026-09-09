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

    // Pays côté devise-produit (ex: SN, CM, NG, GH)
    public string SellCountryCode { get; private set; } = default!;
    public Country SellCountry { get; private set; } = default!;

    // Montant en devise-produit (XOF, XAF, etc.)
    public decimal Amount { get; private set; }
    public decimal AmountFilled { get; private set; } = 0;

    // Taux : combien d'unités de devise-produit pour 1 unité de devise d'achat
    // Ex: 490 XOF pour 1 CAD
    public decimal Rate { get; private set; }

    public decimal MinAmount { get; private set; }
    public decimal MaxAmount { get; private set; }
    public string? Notes { get; private set; }
    public OfferStatus Status { get; private set; } = OfferStatus.Open;
    public DateTime ExpiresAt { get; private set; }

    private readonly List<OfferPaymentMethod> _paymentMethods = [];
    private readonly List<Transaction> _transactions = [];

    public IReadOnlyCollection<OfferPaymentMethod> PaymentMethods => _paymentMethods.AsReadOnly();
    public IReadOnlyCollection<Transaction> Transactions => _transactions.AsReadOnly();

    public decimal RemainingAmount => Amount - AmountFilled;
    public decimal BuyEquivalent => Rate > 0 ? Amount / Rate : 0;

    private Offer() { }

    public static Offer Create(
        Guid userId,
        OfferType type,
        string sellCurrencyCode,
        string buyCurrencyCode,
        string sellCountryCode,
        string buyCountryCode,
        decimal amount,
        decimal rate,
        decimal minAmount,
        decimal maxAmount,
        string? notes,
        int expiryHours = 24)
    {
        if (amount <= 0) throw new ArgumentException("Le montant doit être positif.");
        if (rate <= 0) throw new ArgumentException("Le taux doit être positif.");
        if (minAmount <= 0) throw new ArgumentException("Le montant minimum doit être positif.");
        if (minAmount > maxAmount) throw new ArgumentException("Le minimum ne peut pas dépasser le maximum.");
        if (minAmount > amount) throw new ArgumentException("Le minimum ne peut pas dépasser le montant total.");

        return new Offer
        {
            UserId = userId,
            Type = type,
            SellCurrencyCode = sellCurrencyCode.ToUpperInvariant(),
            BuyCurrencyCode = buyCurrencyCode.ToUpperInvariant(),
            SellCountryCode = sellCountryCode.ToUpperInvariant(),
            BuyCountryCode = buyCountryCode.ToUpperInvariant(),
            Amount = amount,
            Rate = rate,
            MinAmount = minAmount,
            MaxAmount = maxAmount,
            Notes = notes,
            ExpiresAt = DateTime.UtcNow.AddHours(expiryHours)
        };
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
}
