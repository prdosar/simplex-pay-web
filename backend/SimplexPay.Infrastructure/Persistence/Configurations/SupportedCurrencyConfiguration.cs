using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SimplexPay.Domain.Entities;
using SimplexPay.Domain.Enums;

namespace SimplexPay.Infrastructure.Persistence.Configurations;

public class SupportedCurrencyConfiguration : IEntityTypeConfiguration<SupportedCurrency>
{
    public void Configure(EntityTypeBuilder<SupportedCurrency> builder)
    {
        builder.HasKey(c => c.Code);
        builder.Property(c => c.Code).HasMaxLength(5).IsRequired();
        builder.Property(c => c.Name).HasMaxLength(100).IsRequired();
        builder.Property(c => c.NameFr).HasMaxLength(100).IsRequired();
        builder.Property(c => c.Symbol).HasMaxLength(10).IsRequired();
        builder.Property(c => c.Type).HasConversion<string>();

        builder.HasData(
            // Devises d'achat (Buy)
            new { Code = "CAD", Name = "Canadian Dollar",  NameFr = "Dollar canadien",    Symbol = "CA$",   Type = CurrencyType.Buy,  DecimalPlaces = 2, IsActive = true },
            new { Code = "USD", Name = "US Dollar",        NameFr = "Dollar américain",    Symbol = "US$",   Type = CurrencyType.Buy,  DecimalPlaces = 2, IsActive = false },
            new { Code = "EUR", Name = "Euro",             NameFr = "Euro",                Symbol = "€",     Type = CurrencyType.Buy,  DecimalPlaces = 2, IsActive = false },

            // Devises-produits (Sell)
            new { Code = "XOF", Name = "West African CFA Franc", NameFr = "Franc CFA BCEAO",  Symbol = "FCFA",  Type = CurrencyType.Sell, DecimalPlaces = 0, IsActive = true },
            new { Code = "XAF", Name = "Central African CFA Franc", NameFr = "Franc CFA BEAC", Symbol = "FCFA",  Type = CurrencyType.Sell, DecimalPlaces = 0, IsActive = true },
            new { Code = "NGN", Name = "Nigerian Naira",   NameFr = "Naira nigérian",      Symbol = "₦",     Type = CurrencyType.Sell, DecimalPlaces = 2, IsActive = true },
            new { Code = "GHS", Name = "Ghanaian Cedi",   NameFr = "Cedi ghanéen",        Symbol = "₵",     Type = CurrencyType.Sell, DecimalPlaces = 2, IsActive = true }
        );
    }
}
