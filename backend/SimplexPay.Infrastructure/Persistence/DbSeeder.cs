using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SimplexPay.Application.Interfaces;
using SimplexPay.Domain.Entities;

namespace SimplexPay.Infrastructure.Persistence;

// Seed idempotent exécuté au démarrage. Ne toucher qu'aux données admin/system
// (les Countries / Currencies / PaymentMethods sont seed via HasData dans les
// configurations EF — pas ici).
public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db, IPasswordHasher hasher, ILogger logger, CancellationToken ct = default)
    {
        await SeedSuperAdminAsync(db, hasher, logger, ct);
    }

    private static async Task SeedSuperAdminAsync(AppDbContext db, IPasswordHasher hasher, ILogger logger, CancellationToken ct)
    {
        const string email = "stidjani@proconsulting-info.com";

        var existing = await db.Users.FirstOrDefaultAsync(u => u.Email == email, ct);
        if (existing is not null)
        {
            // Réaligner l'état admin/verified au cas où on aurait toggle manuellement.
            if (!existing.IsAdmin) existing.GrantAdmin();
            if (!existing.EmailVerified) existing.MarkEmailVerified();
            await db.SaveChangesAsync(ct);
            return;
        }

        var admin = User.Create(
            firstName: "Saïdh",
            lastName: "Tidjani",
            email: email,
            passwordHash: hasher.Hash("Pr@Const2007"),
            phoneNumber: "+22800000000",
            country: "TG"
        );
        admin.MarkEmailVerified();
        admin.GrantAdmin();
        admin.SetCertified(true);

        db.Users.Add(admin);
        await db.SaveChangesAsync(ct);
        logger.LogInformation("[Seed] SuperAdmin créé: {Email}", email);
    }
}
