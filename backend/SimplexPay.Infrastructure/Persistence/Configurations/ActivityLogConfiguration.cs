using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SimplexPay.Domain.Entities;

namespace SimplexPay.Infrastructure.Persistence.Configurations;

public class ActivityLogConfiguration : IEntityTypeConfiguration<ActivityLog>
{
    public void Configure(EntityTypeBuilder<ActivityLog> b)
    {
        b.HasKey(x => x.Id);
        b.Property(x => x.IpAddress).HasMaxLength(45).IsRequired();
        b.Property(x => x.UserAgent).HasMaxLength(500);
        b.Property(x => x.Method).HasMaxLength(10).IsRequired();
        b.Property(x => x.Path).HasMaxLength(500).IsRequired();
        b.Property(x => x.Action).HasMaxLength(100).IsRequired();
        b.Property(x => x.Country).HasMaxLength(2);
        b.Property(x => x.City).HasMaxLength(100);

        // Index pour les filtres admin fréquents.
        b.HasIndex(x => x.Timestamp);                         // ORDER BY DESC + range from/to
        b.HasIndex(x => x.Action);                            // filter par action
        b.HasIndex(x => x.IpAddress);                         // filter par IP
        b.HasIndex(x => x.Country);                           // filter par pays
        b.HasIndex(x => x.UserId);                            // filter par user

        // Pas de FK sur User (log garde son historique même si le user est supprimé plus tard).
    }
}
