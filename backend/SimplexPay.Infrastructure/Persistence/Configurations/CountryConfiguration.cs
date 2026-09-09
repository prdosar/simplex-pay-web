using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SimplexPay.Domain.Entities;

namespace SimplexPay.Infrastructure.Persistence.Configurations;

public class CountryConfiguration : IEntityTypeConfiguration<Country>
{
    public void Configure(EntityTypeBuilder<Country> builder)
    {
        builder.HasKey(c => c.Code);
        builder.Property(c => c.Code).HasMaxLength(3).IsRequired();
        builder.Property(c => c.Name).HasMaxLength(100).IsRequired();
        builder.Property(c => c.NameFr).HasMaxLength(100).IsRequired();
        builder.Property(c => c.CurrencyCode).HasMaxLength(5).IsRequired();
        builder.Property(c => c.Flag).HasMaxLength(10);

        builder.HasOne(c => c.Currency)
            .WithMany()
            .HasForeignKey(c => c.CurrencyCode)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(c => c.PaymentMethods)
            .WithOne(cpm => cpm.Country)
            .HasForeignKey(cpm => cpm.CountryCode);

        builder.HasData(
            // Canada — Buy (CAD)
            new { Code = "CA", Name = "Canada",                    NameFr = "Canada",               CurrencyCode = "CAD", Flag = "🇨🇦", IsActive = true },
            // Zone XOF
            new { Code = "SN", Name = "Senegal",                   NameFr = "Sénégal",              CurrencyCode = "XOF", Flag = "🇸🇳", IsActive = true },
            new { Code = "CI", Name = "Ivory Coast",               NameFr = "Côte d'Ivoire",        CurrencyCode = "XOF", Flag = "🇨🇮", IsActive = true },
            new { Code = "ML", Name = "Mali",                      NameFr = "Mali",                 CurrencyCode = "XOF", Flag = "🇲🇱", IsActive = true },
            new { Code = "BF", Name = "Burkina Faso",              NameFr = "Burkina Faso",         CurrencyCode = "XOF", Flag = "🇧🇫", IsActive = true },
            new { Code = "BJ", Name = "Benin",                     NameFr = "Bénin",                CurrencyCode = "XOF", Flag = "🇧🇯", IsActive = true },
            new { Code = "NE", Name = "Niger",                     NameFr = "Niger",                CurrencyCode = "XOF", Flag = "🇳🇪", IsActive = true },
            new { Code = "TG", Name = "Togo",                      NameFr = "Togo",                 CurrencyCode = "XOF", Flag = "🇹🇬", IsActive = true },
            new { Code = "GW", Name = "Guinea-Bissau",             NameFr = "Guinée-Bissau",        CurrencyCode = "XOF", Flag = "🇬🇼", IsActive = true },
            // Zone XAF
            new { Code = "CM", Name = "Cameroon",                  NameFr = "Cameroun",             CurrencyCode = "XAF", Flag = "🇨🇲", IsActive = true },
            new { Code = "TD", Name = "Chad",                      NameFr = "Tchad",                CurrencyCode = "XAF", Flag = "🇹🇩", IsActive = true },
            new { Code = "CG", Name = "Congo",                     NameFr = "Congo-Brazzaville",    CurrencyCode = "XAF", Flag = "🇨🇬", IsActive = true },
            new { Code = "GA", Name = "Gabon",                     NameFr = "Gabon",                CurrencyCode = "XAF", Flag = "🇬🇦", IsActive = true },
            new { Code = "CF", Name = "Central African Republic",  NameFr = "RCA",                  CurrencyCode = "XAF", Flag = "🇨🇫", IsActive = true },
            new { Code = "GQ", Name = "Equatorial Guinea",         NameFr = "Guinée Équatoriale",   CurrencyCode = "XAF", Flag = "🇬🇶", IsActive = true },
            // Naira
            new { Code = "NG", Name = "Nigeria",                   NameFr = "Nigeria",              CurrencyCode = "NGN", Flag = "🇳🇬", IsActive = true },
            // Cedis
            new { Code = "GH", Name = "Ghana",                     NameFr = "Ghana",                CurrencyCode = "GHS", Flag = "🇬🇭", IsActive = true }
        );
    }
}
