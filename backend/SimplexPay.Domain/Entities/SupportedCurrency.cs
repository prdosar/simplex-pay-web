using SimplexPay.Domain.Enums;

namespace SimplexPay.Domain.Entities;

public class SupportedCurrency
{
    public string Code { get; private set; } = default!;       // "CAD", "XOF", "NGN"…
    public string Name { get; private set; } = default!;       // "Canadian Dollar"
    public string NameFr { get; private set; } = default!;     // "Dollar canadien"
    public string Symbol { get; private set; } = default!;     // "$", "FCFA", "₦"
    public CurrencyType Type { get; private set; }             // Buy ou Sell
    public int DecimalPlaces { get; private set; } = 2;
    public bool IsActive { get; private set; } = true;

    private SupportedCurrency() { }

    public static SupportedCurrency Create(string code, string name, string nameFr,
        string symbol, CurrencyType type, int decimalPlaces = 2) =>
        new()
        {
            Code = code,
            Name = name,
            NameFr = nameFr,
            Symbol = symbol,
            Type = type,
            DecimalPlaces = decimalPlaces
        };
}
