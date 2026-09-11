using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SimplexPay.Domain.Entities;

namespace SimplexPay.Infrastructure.Persistence.Configurations;

public class OfferCountryConfiguration : IEntityTypeConfiguration<OfferCountry>
{
    public void Configure(EntityTypeBuilder<OfferCountry> builder)
    {
        builder.HasKey(oc => new { oc.OfferId, oc.CountryCode });

        builder.Property(oc => oc.CountryCode).HasMaxLength(3).IsRequired();

        builder.HasOne(oc => oc.Offer)
            .WithMany(o => o.Countries)
            .HasForeignKey(oc => oc.OfferId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(oc => oc.Country)
            .WithMany()
            .HasForeignKey(oc => oc.CountryCode)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(oc => oc.CountryCode);
    }
}
