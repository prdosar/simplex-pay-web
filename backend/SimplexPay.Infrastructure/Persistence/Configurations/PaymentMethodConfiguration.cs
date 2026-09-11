using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SimplexPay.Domain.Entities;
using SimplexPay.Domain.Enums;

namespace SimplexPay.Infrastructure.Persistence.Configurations;

public class PaymentMethodConfiguration : IEntityTypeConfiguration<PaymentMethod>
{
    // IDs fixes pour la stabilité des migrations
    public static readonly Guid CashId           = new("10000000-0000-0000-0000-000000000001");
    public static readonly Guid InteracId        = new("10000000-0000-0000-0000-000000000002");
    public static readonly Guid BankTransferId   = new("10000000-0000-0000-0000-000000000003");
    public static readonly Guid WaveId           = new("10000000-0000-0000-0000-000000000004");
    public static readonly Guid OrangeSenId      = new("10000000-0000-0000-0000-000000000005");
    public static readonly Guid FreeMoneySenId   = new("10000000-0000-0000-0000-000000000006");
    public static readonly Guid MtnCiId          = new("10000000-0000-0000-0000-000000000007");
    public static readonly Guid OrangeCiId       = new("10000000-0000-0000-0000-000000000008");
    public static readonly Guid MoovCiId         = new("10000000-0000-0000-0000-000000000009");
    public static readonly Guid MtnCmId          = new("10000000-0000-0000-0000-000000000010");
    public static readonly Guid OrangeCmId       = new("10000000-0000-0000-0000-000000000011");
    public static readonly Guid OrangeMlId       = new("10000000-0000-0000-0000-000000000012");
    public static readonly Guid MoovMlId         = new("10000000-0000-0000-0000-000000000013");
    // Nigeria
    public static readonly Guid OPayId           = new("10000000-0000-0000-0000-000000000014");
    public static readonly Guid PalmPayId        = new("10000000-0000-0000-0000-000000000015");
    public static readonly Guid MtnNgId          = new("10000000-0000-0000-0000-000000000016");
    public static readonly Guid BankTransferNgId = new("10000000-0000-0000-0000-000000000017");
    // Ghana
    public static readonly Guid MtnGhId          = new("10000000-0000-0000-0000-000000000018");
    public static readonly Guid VodafoneGhId     = new("10000000-0000-0000-0000-000000000019");
    public static readonly Guid AirtelGhId       = new("10000000-0000-0000-0000-000000000020");
    // Togo
    public static readonly Guid TMoneyTgId       = new("10000000-0000-0000-0000-000000000021");

    public void Configure(EntityTypeBuilder<PaymentMethod> builder)
    {
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Name).HasMaxLength(100).IsRequired();
        builder.Property(p => p.Description).HasMaxLength(300);
        builder.Property(p => p.LogoUrl).HasMaxLength(500);
        builder.Property(p => p.Type).HasConversion<string>();

        builder.HasData(
            PM(CashId,           "Cash",                  PaymentMethodType.Cash,         "Remise en main propre"),
            PM(InteracId,        "Interac e-Transfer",    PaymentMethodType.BankTransfer,  "Virement Interac (Canada)"),
            PM(BankTransferId,   "Virement bancaire",     PaymentMethodType.BankTransfer,  "Virement SWIFT / bancaire"),
            PM(WaveId,           "Wave",                  PaymentMethodType.MobileMoney,   "Mobile Money Wave"),
            PM(OrangeSenId,      "Orange Money SN",       PaymentMethodType.MobileMoney,   "Orange Money Sénégal"),
            PM(FreeMoneySenId,   "Free Money",            PaymentMethodType.MobileMoney,   "Free Money Sénégal"),
            PM(MtnCiId,          "MTN MoMo CI",           PaymentMethodType.MobileMoney,   "MTN Mobile Money Côte d'Ivoire"),
            PM(OrangeCiId,       "Orange Money CI",       PaymentMethodType.MobileMoney,   "Orange Money Côte d'Ivoire"),
            PM(MoovCiId,         "Moov Money CI",         PaymentMethodType.MobileMoney,   "Moov Money Côte d'Ivoire"),
            PM(MtnCmId,          "MTN MoMo CM",           PaymentMethodType.MobileMoney,   "MTN Mobile Money Cameroun"),
            PM(OrangeCmId,       "Orange Money CM",       PaymentMethodType.MobileMoney,   "Orange Money Cameroun"),
            PM(OrangeMlId,       "Orange Money ML",       PaymentMethodType.MobileMoney,   "Orange Money Mali"),
            PM(MoovMlId,         "Moov Money ML",         PaymentMethodType.MobileMoney,   "Moov Money Mali"),
            PM(OPayId,           "OPay",                  PaymentMethodType.MobileMoney,   "OPay Nigeria"),
            PM(PalmPayId,        "PalmPay",               PaymentMethodType.MobileMoney,   "PalmPay Nigeria"),
            PM(MtnNgId,          "MTN MoMo NG",           PaymentMethodType.MobileMoney,   "MTN Mobile Money Nigeria"),
            PM(BankTransferNgId, "Virement bancaire NG",  PaymentMethodType.BankTransfer,  "Virement bancaire Nigeria (GTB, Access, Zenith…)"),
            PM(MtnGhId,          "MTN MoMo GH",           PaymentMethodType.MobileMoney,   "MTN Mobile Money Ghana"),
            PM(VodafoneGhId,     "Vodafone Cash GH",      PaymentMethodType.MobileMoney,   "Vodafone Cash Ghana"),
            PM(AirtelGhId,       "AirtelTigo Money GH",   PaymentMethodType.MobileMoney,   "AirtelTigo Money Ghana"),
            PM(TMoneyTgId,       "T-Money (Yas) TG",      PaymentMethodType.MobileMoney,   "T-Money / Yas — Togocom (Togo)")
        );
    }

    private static object PM(Guid id, string name, PaymentMethodType type, string desc) =>
        new { Id = id, Name = name, Type = type, Description = desc, LogoUrl = (string?)null, IsActive = true };
}
