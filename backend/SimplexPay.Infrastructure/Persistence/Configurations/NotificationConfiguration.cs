using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SimplexPay.Domain.Entities;

namespace SimplexPay.Infrastructure.Persistence.Configurations;

public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> b)
    {
        b.HasKey(n => n.Id);
        b.Property(n => n.Type).HasMaxLength(50).IsRequired();
        b.Property(n => n.Title).HasMaxLength(200).IsRequired();
        b.Property(n => n.Body).HasMaxLength(1000).IsRequired();
        b.Property(n => n.Link).HasMaxLength(500);

        b.HasOne(n => n.User)
            .WithMany()
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // (UserId, IsRead) : la query cloche = WHERE UserId=@me AND IsRead=false. (UserId, CreatedAt) pour paginer.
        b.HasIndex(n => new { n.UserId, n.IsRead });
        b.HasIndex(n => new { n.UserId, n.CreatedAt });
    }
}
