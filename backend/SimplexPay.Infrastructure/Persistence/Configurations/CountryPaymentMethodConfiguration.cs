using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SimplexPay.Domain.Entities;
using static SimplexPay.Infrastructure.Persistence.Configurations.PaymentMethodConfiguration;

namespace SimplexPay.Infrastructure.Persistence.Configurations;

public class CountryPaymentMethodConfiguration : IEntityTypeConfiguration<CountryPaymentMethod>
{
    public void Configure(EntityTypeBuilder<CountryPaymentMethod> builder)
    {
        builder.HasKey(cpm => new { cpm.CountryCode, cpm.PaymentMethodId });

        builder.HasOne(cpm => cpm.Country)
            .WithMany(c => c.PaymentMethods)
            .HasForeignKey(cpm => cpm.CountryCode);

        builder.HasOne(cpm => cpm.PaymentMethod)
            .WithMany(pm => pm.Countries)
            .HasForeignKey(cpm => cpm.PaymentMethodId);

        builder.HasData(
            // Canada (CAD)
            S("CA", CashId,           true),
            S("CA", InteracId,        true),
            S("CA", BankTransferId,   false),

            // Sénégal (XOF)
            S("SN", CashId,           true),
            S("SN", WaveId,           true),
            S("SN", OrangeSenId,      true),
            S("SN", FreeMoneySenId,   false),
            S("SN", BankTransferId,   false),

            // Côte d'Ivoire (XOF)
            S("CI", CashId,           true),
            S("CI", WaveId,           true),
            S("CI", OrangeCiId,       true),
            S("CI", MtnCiId,          true),
            S("CI", MoovCiId,         false),
            S("CI", BankTransferId,   false),

            // Mali (XOF)
            S("ML", CashId,           true),
            S("ML", OrangeMlId,       true),
            S("ML", MoovMlId,         false),
            S("ML", BankTransferId,   false),

            // Burkina Faso (XOF)
            S("BF", CashId,           true),
            S("BF", OrangeCiId,       true),
            S("BF", MoovCiId,         false),

            // Bénin (XOF)
            S("BJ", CashId,           true),
            S("BJ", MtnCiId,          true),
            S("BJ", MoovCiId,         false),

            // Niger (XOF)
            S("NE", CashId,           true),
            S("NE", OrangeSenId,      true),

            // Togo (XOF) — Wave n'opère pas au Togo
            S("TG", CashId,           true),
            S("TG", TMoneyTgId,       true),
            S("TG", MoovCiId,         false),

            // Guinée-Bissau (XOF)
            S("GW", CashId,           true),
            S("GW", OrangeSenId,      false),

            // Cameroun (XAF)
            S("CM", CashId,           true),
            S("CM", MtnCmId,          true),
            S("CM", OrangeCmId,       true),
            S("CM", BankTransferId,   false),

            // Tchad (XAF)
            S("TD", CashId,           true),
            S("TD", OrangeCmId,       true),

            // Congo (XAF)
            S("CG", CashId,           true),
            S("CG", MtnCmId,          true),

            // Gabon (XAF)
            S("GA", CashId,           true),
            S("GA", OrangeCmId,       true),
            S("GA", MtnCmId,          false),

            // RCA (XAF)
            S("CF", CashId,           true),

            // Guinée Équatoriale (XAF)
            S("GQ", CashId,           true),

            // Nigeria (NGN)
            S("NG", CashId,           true),
            S("NG", OPayId,           true),
            S("NG", PalmPayId,        true),
            S("NG", MtnNgId,          false),
            S("NG", BankTransferNgId, true),

            // Ghana (GHS)
            S("GH", CashId,           true),
            S("GH", MtnGhId,          true),
            S("GH", VodafoneGhId,     true),
            S("GH", AirtelGhId,       false)
        );
    }

    private static object S(string countryCode, Guid paymentMethodId, bool isPopular) =>
        new { CountryCode = countryCode, PaymentMethodId = paymentMethodId, IsPopular = isPopular };
}
