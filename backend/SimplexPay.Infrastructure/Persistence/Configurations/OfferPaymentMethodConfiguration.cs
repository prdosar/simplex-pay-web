using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SimplexPay.Domain.Entities;

namespace SimplexPay.Infrastructure.Persistence.Configurations;

public class OfferPaymentMethodConfiguration : IEntityTypeConfiguration<OfferPaymentMethod>
{
    public void Configure(EntityTypeBuilder<OfferPaymentMethod> builder)
    {
        builder.HasKey(opm => new { opm.OfferId, opm.PaymentMethodId, opm.Side });

        builder.Property(opm => opm.Side).HasConversion<string>();

        builder.HasOne(opm => opm.Offer)
            .WithMany(o => o.PaymentMethods)
            .HasForeignKey(opm => opm.OfferId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(opm => opm.PaymentMethod)
            .WithMany()
            .HasForeignKey(opm => opm.PaymentMethodId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
