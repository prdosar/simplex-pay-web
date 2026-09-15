using SimplexPay.Domain.Enums;

namespace SimplexPay.Domain.Entities;

public class PaymentMethod
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public string Name { get; private set; } = default!;
    public string? Description { get; private set; }
    public PaymentMethodType Type { get; private set; }
    public string? LogoUrl { get; private set; }
    public bool IsActive { get; private set; } = true;

    private readonly List<CountryPaymentMethod> _countries = [];
    public IReadOnlyCollection<CountryPaymentMethod> Countries => _countries.AsReadOnly();

    private PaymentMethod() { }

    public static PaymentMethod Create(string name, PaymentMethodType type, string? description = null) =>
        new() { Name = name, Type = type, Description = description };

    public void Update(string name, string? description, PaymentMethodType type, bool isActive)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Le nom est requis.");
        Name = name.Trim();
        Description = string.IsNullOrWhiteSpace(description) ? null : description.Trim();
        Type = type;
        IsActive = isActive;
    }
}
