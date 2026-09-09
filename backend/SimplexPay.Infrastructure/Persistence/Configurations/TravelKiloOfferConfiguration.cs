using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SimplexPay.Domain.Entities;

namespace SimplexPay.Infrastructure.Persistence.Configurations;

public class TravelKiloOfferConfiguration : IEntityTypeConfiguration<TravelKiloOffer>
{
    public void Configure(EntityTypeBuilder<TravelKiloOffer> builder)
    {
        builder.HasKey(o => o.Id);
        builder.Property(o => o.AvailableKg).HasPrecision(10, 2).IsRequired();
        builder.Property(o => o.PricePerKg).HasPrecision(10, 2).IsRequired();
        builder.Property(o => o.DepartureCity).HasMaxLength(100).IsRequired();
        builder.Property(o => o.DestinationCity).HasMaxLength(100).IsRequired();
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
        builder.HasIndex(o => o.TravelDate);
        builder.HasIndex(o => o.UserId);
    }
}
