using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SimplexPay.Domain.Entities;

namespace SimplexPay.Infrastructure.Persistence.Configurations;

public class OfferConfiguration : IEntityTypeConfiguration<Offer>
{
    public void Configure(EntityTypeBuilder<Offer> builder)
    {
        builder.HasKey(o => o.Id);
        builder.Property(o => o.Amount).HasPrecision(18, 4).IsRequired();
        builder.Property(o => o.AmountFilled).HasPrecision(18, 4);
        builder.Property(o => o.Rate).HasPrecision(18, 6);
        builder.Property(o => o.RateMode).HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.Property(o => o.MinAmount).HasPrecision(18, 4);
        builder.Property(o => o.MaxAmount).HasPrecision(18, 4);
        builder.Property(o => o.SellCurrencyCode).HasMaxLength(5).IsRequired();
        builder.Property(o => o.BuyCurrencyCode).HasMaxLength(5).IsRequired();
        builder.Property(o => o.BuyCountryCode).HasMaxLength(3).IsRequired();
        builder.Property(o => o.Type).HasConversion<string>();
        builder.Property(o => o.Status).HasConversion<string>();
        builder.Property(o => o.Notes).HasMaxLength(500);
        builder.Property(o => o.ExpiresAt).IsRequired(false);

        builder.HasOne(o => o.User)
            .WithMany(u => u.Offers)
            .HasForeignKey(o => o.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(o => o.SellCurrency)
            .WithMany()
            .HasForeignKey(o => o.SellCurrencyCode)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(o => o.BuyCurrency)
            .WithMany()
            .HasForeignKey(o => o.BuyCurrencyCode)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(o => o.BuyCountry)
            .WithMany()
            .HasForeignKey(o => o.BuyCountryCode)
            .OnDelete(DeleteBehavior.Restrict);

        // Index pour les requêtes fréquentes
        builder.HasIndex(o => new { o.SellCurrencyCode, o.BuyCurrencyCode, o.Status });
        builder.HasIndex(o => new { o.Type, o.Status });
        builder.HasIndex(o => o.UserId);
        // (Status, ExpiresAt) : WHERE Status IN (Open, PartiallyFilled) AND (ExpiresAt IS NULL OR ExpiresAt > now()).
        // ExpiresAt nullable depuis 2026-09-15 — offres devises n'expirent plus par défaut.
        builder.HasIndex(o => new { o.Status, o.ExpiresAt });
        // ORDER BY CreatedAt DESC (default sort "recent")
        builder.HasIndex(o => o.CreatedAt);
    }
}
