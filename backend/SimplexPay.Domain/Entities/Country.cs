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
}
