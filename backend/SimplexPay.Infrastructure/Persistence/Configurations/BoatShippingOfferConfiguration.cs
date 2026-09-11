using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SimplexPay.Domain.Entities;

namespace SimplexPay.Infrastructure.Persistence.Configurations;

public class BoatShippingOfferConfiguration : IEntityTypeConfiguration<BoatShippingOffer>
{
    public void Configure(EntityTypeBuilder<BoatShippingOffer> builder)
    {
        builder.HasKey(o => o.Id);
        builder.Property(o => o.AvailableLbs).HasPrecision(10, 2).IsRequired();
        builder.Property(o => o.PricePerLb).HasPrecision(10, 2).IsRequired();
        builder.Property(o => o.DeparturePort).HasMaxLength(100).IsRequired();
        builder.Property(o => o.DestinationPort).HasMaxLength(100).IsRequired();
        builder.Property(o => o.DepartureCountryCode).HasMaxLength(3).IsRequired();
        builder.Property(o => o.DestinationCountryCode).HasMaxLength(3).IsRequired();
        builder.Property(o => o.Notes).HasMaxLength(500);
        builder.Property(o => o.Status).HasConversion<string>();

        builder.HasOne(o => o.User)
            .WithMany()
            .HasForeignKey(o => o.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(o => o.DepartureCountry)
            .WithMany()
            .HasForeignKey(o => o.DepartureCountryCode)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(o => o.DestinationCountry)
            .WithMany()
            .HasForeignKey(o => o.DestinationCountryCode)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(o => new { o.DepartureCountryCode, o.DestinationCountryCode, o.Status });
        builder.HasIndex(o => o.ShipDepartureDate);
        builder.HasIndex(o => o.UserId);
        builder.HasIndex(o => new { o.Status, o.ExpiresAt });
        builder.HasIndex(o => o.CreatedAt);
    }
}
