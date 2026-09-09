namespace SimplexPay.Domain.Entities;

public class CountryPaymentMethod
{
    public string CountryCode { get; private set; } = default!;
    public Country Country { get; private set; } = default!;

    public Guid PaymentMethodId { get; private set; }
    public PaymentMethod PaymentMethod { get; private set; } = default!;

    public bool IsPopular { get; private set; } = false;

    private CountryPaymentMethod() { }

    public static CountryPaymentMethod Create(string countryCode, Guid paymentMethodId, bool isPopular = false) =>
        new() { CountryCode = countryCode, PaymentMethodId = paymentMethodId, IsPopular = isPopular };
}
