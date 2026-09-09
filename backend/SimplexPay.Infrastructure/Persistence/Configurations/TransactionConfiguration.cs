using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SimplexPay.Domain.Entities;

namespace SimplexPay.Infrastructure.Persistence.Configurations;

public class TransactionConfiguration : IEntityTypeConfiguration<Transaction>
{
    public void Configure(EntityTypeBuilder<Transaction> builder)
    {
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Amount).HasPrecision(18, 4).IsRequired();
        builder.Property(t => t.Rate).HasPrecision(18, 6).IsRequired();
        builder.Property(t => t.TotalValue).HasPrecision(18, 4);
        builder.Property(t => t.PlatformFee).HasPrecision(18, 4);
        builder.Property(t => t.Status).HasConversion<string>();
        builder.Property(t => t.DisputeReason).HasMaxLength(1000);

        builder.HasOne(t => t.Offer)
            .WithMany(o => o.Transactions)
            .HasForeignKey(t => t.OfferId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(t => t.Buyer)
            .WithMany()
            .HasForeignKey(t => t.BuyerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(t => t.Seller)
            .WithMany()
            .HasForeignKey(t => t.SellerId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
