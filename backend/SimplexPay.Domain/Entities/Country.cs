namespace SimplexPay.Domain.Entities;

public class Country
{
    public string Code { get; private set; } = default!;
    public string Name { get; private set; } = default!;
    public string NameFr { get; private set; } = default!;
    public string CurrencyCode { get; private set; } = default!;
    public SupportedCurrency Currency { get; private set; } = default!;
    public string Flag { get; private set; } = default!;
    public bool IsActive { get; private set; } = true;

    private readonly List<CountryPaymentMethod> _paymentMethods = [];
    public IReadOnlyCollection<CountryPaymentMethod> PaymentMethods => _paymentMethods.AsReadOnly();

    private Country() { }

    public static Country Create(string code, string name, string nameFr, string currencyCode, string flag) =>
        new() { Code = code, Name = name, NameFr = nameFr, CurrencyCode = currencyCode, Flag = flag };

    /// <summary>Attache un moyen de paiement existant à ce pays. Ignore silencieusement si déjà attaché.</summary>
    public void AttachPaymentMethod(Guid paymentMethodId, bool isPopular = false)
    {
        if (_paymentMethods.Any(pm => pm.PaymentMethodId == paymentMethodId))
            return;
        _paymentMethods.Add(CountryPaymentMethod.Create(Code, paymentMethodId, isPopular));
    }

    /// <summary>Détache un moyen de paiement de ce pays.</summary>
    public void DetachPaymentMethod(Guid paymentMethodId)
    {
        var link = _paymentMethods.FirstOrDefault(pm => pm.PaymentMethodId == paymentMethodId);
        if (link is not null) _paymentMethods.Remove(link);
    }

    /// <summary>Marque ou démarque le moyen de paiement comme populaire pour ce pays.</summary>
    public void SetPaymentMethodPopularity(Guid paymentMethodId, bool isPopular)
    {
        var link = _paymentMethods.FirstOrDefault(pm => pm.PaymentMethodId == paymentMethodId)
            ?? throw new InvalidOperationException("Le moyen de paiement n'est pas rattaché à ce pays.");
        link.SetPopularity(isPopular);
    }
}
