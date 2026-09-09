using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace SimplexPay.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RestructureCurrenciesAndOffers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Offers_Countries_FromCountryCode",
                table: "Offers");

            migrationBuilder.DropForeignKey(
                name: "FK_Offers_Countries_ToCountryCode",
                table: "Offers");

            migrationBuilder.DropIndex(
                name: "IX_Offers_FromCountryCode",
                table: "Offers");

            migrationBuilder.DropColumn(
                name: "FromCountryCode",
                table: "Offers");

            migrationBuilder.DropColumn(
                name: "FromCurrency",
                table: "Offers");

            migrationBuilder.DropColumn(
                name: "Currency",
                table: "Countries");

            migrationBuilder.RenameColumn(
                name: "ToCurrency",
                table: "Offers",
                newName: "SellCountryCode");

            migrationBuilder.RenameColumn(
                name: "ToCountryCode",
                table: "Offers",
                newName: "BuyCountryCode");

            migrationBuilder.RenameIndex(
                name: "IX_Offers_ToCountryCode",
                table: "Offers",
                newName: "IX_Offers_BuyCountryCode");

            migrationBuilder.AddColumn<string>(
                name: "BuyCurrencyCode",
                table: "Offers",
                type: "character varying(5)",
                maxLength: 5,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "SellCurrencyCode",
                table: "Offers",
                type: "character varying(5)",
                maxLength: 5,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "Offers",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CurrencyCode",
                table: "Countries",
                type: "character varying(5)",
                maxLength: 5,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "SupportedCurrencies",
                columns: table => new
                {
                    Code = table.Column<string>(type: "character varying(5)", maxLength: 5, nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    NameFr = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Symbol = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    Type = table.Column<string>(type: "text", nullable: false),
                    DecimalPlaces = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SupportedCurrencies", x => x.Code);
                });

            migrationBuilder.UpdateData(
                table: "Countries",
                keyColumn: "Code",
                keyValue: "BF",
                column: "CurrencyCode",
                value: "XOF");

            migrationBuilder.UpdateData(
                table: "Countries",
                keyColumn: "Code",
                keyValue: "BJ",
                column: "CurrencyCode",
                value: "XOF");

            migrationBuilder.UpdateData(
                table: "Countries",
                keyColumn: "Code",
                keyValue: "CA",
                column: "CurrencyCode",
                value: "CAD");

            migrationBuilder.UpdateData(
                table: "Countries",
                keyColumn: "Code",
                keyValue: "CF",
                column: "CurrencyCode",
                value: "XAF");

            migrationBuilder.UpdateData(
                table: "Countries",
                keyColumn: "Code",
                keyValue: "CG",
                column: "CurrencyCode",
                value: "XAF");

            migrationBuilder.UpdateData(
                table: "Countries",
                keyColumn: "Code",
                keyValue: "CI",
                column: "CurrencyCode",
                value: "XOF");

            migrationBuilder.UpdateData(
                table: "Countries",
                keyColumn: "Code",
                keyValue: "CM",
                column: "CurrencyCode",
                value: "XAF");

            migrationBuilder.UpdateData(
                table: "Countries",
                keyColumn: "Code",
                keyValue: "GA",
                column: "CurrencyCode",
                value: "XAF");

            migrationBuilder.UpdateData(
                table: "Countries",
                keyColumn: "Code",
                keyValue: "GQ",
                column: "CurrencyCode",
                value: "XAF");

            migrationBuilder.UpdateData(
                table: "Countries",
                keyColumn: "Code",
                keyValue: "GW",
                column: "CurrencyCode",
                value: "XOF");

            migrationBuilder.UpdateData(
                table: "Countries",
                keyColumn: "Code",
                keyValue: "ML",
                column: "CurrencyCode",
                value: "XOF");

            migrationBuilder.UpdateData(
                table: "Countries",
                keyColumn: "Code",
                keyValue: "NE",
                column: "CurrencyCode",
                value: "XOF");

            migrationBuilder.UpdateData(
                table: "Countries",
                keyColumn: "Code",
                keyValue: "SN",
                column: "CurrencyCode",
                value: "XOF");

            migrationBuilder.UpdateData(
                table: "Countries",
                keyColumn: "Code",
                keyValue: "TD",
                column: "CurrencyCode",
                value: "XAF");

            migrationBuilder.UpdateData(
                table: "Countries",
                keyColumn: "Code",
                keyValue: "TG",
                column: "CurrencyCode",
                value: "XOF");

            migrationBuilder.UpdateData(
                table: "PaymentMethods",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000003"),
                column: "Description",
                value: "Virement SWIFT / bancaire");

            migrationBuilder.UpdateData(
                table: "PaymentMethods",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000005"),
                columns: new[] { "Description", "Name" },
                values: new object[] { "Orange Money Sénégal", "Orange Money SN" });

            migrationBuilder.UpdateData(
                table: "PaymentMethods",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000006"),
                column: "Description",
                value: "Free Money Sénégal");

            migrationBuilder.UpdateData(
                table: "PaymentMethods",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000007"),
                columns: new[] { "Description", "Name" },
                values: new object[] { "MTN Mobile Money Côte d'Ivoire", "MTN MoMo CI" });

            migrationBuilder.UpdateData(
                table: "PaymentMethods",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000010"),
                columns: new[] { "Description", "Name" },
                values: new object[] { "MTN Mobile Money Cameroun", "MTN MoMo CM" });

            migrationBuilder.UpdateData(
                table: "PaymentMethods",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000012"),
                column: "Name",
                value: "Orange Money ML");

            migrationBuilder.UpdateData(
                table: "PaymentMethods",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000013"),
                column: "Name",
                value: "Moov Money ML");

            migrationBuilder.InsertData(
                table: "PaymentMethods",
                columns: new[] { "Id", "Description", "IsActive", "LogoUrl", "Name", "Type" },
                values: new object[,]
                {
                    { new Guid("10000000-0000-0000-0000-000000000014"), "OPay Nigeria", true, null, "OPay", "MobileMoney" },
                    { new Guid("10000000-0000-0000-0000-000000000015"), "PalmPay Nigeria", true, null, "PalmPay", "MobileMoney" },
                    { new Guid("10000000-0000-0000-0000-000000000016"), "MTN Mobile Money Nigeria", true, null, "MTN MoMo NG", "MobileMoney" },
                    { new Guid("10000000-0000-0000-0000-000000000017"), "Virement bancaire Nigeria (GTB, Access, Zenith…)", true, null, "Virement bancaire NG", "BankTransfer" },
                    { new Guid("10000000-0000-0000-0000-000000000018"), "MTN Mobile Money Ghana", true, null, "MTN MoMo GH", "MobileMoney" },
                    { new Guid("10000000-0000-0000-0000-000000000019"), "Vodafone Cash Ghana", true, null, "Vodafone Cash GH", "MobileMoney" },
                    { new Guid("10000000-0000-0000-0000-000000000020"), "AirtelTigo Money Ghana", true, null, "AirtelTigo Money GH", "MobileMoney" }
                });

            migrationBuilder.InsertData(
                table: "SupportedCurrencies",
                columns: new[] { "Code", "DecimalPlaces", "IsActive", "Name", "NameFr", "Symbol", "Type" },
                values: new object[,]
                {
                    { "CAD", 2, true, "Canadian Dollar", "Dollar canadien", "CA$", "Buy" },
                    { "EUR", 2, false, "Euro", "Euro", "€", "Buy" },
                    { "GHS", 2, true, "Ghanaian Cedi", "Cedi ghanéen", "₵", "Sell" },
                    { "NGN", 2, true, "Nigerian Naira", "Naira nigérian", "₦", "Sell" },
                    { "USD", 2, false, "US Dollar", "Dollar américain", "US$", "Buy" },
                    { "XAF", 0, true, "Central African CFA Franc", "Franc CFA BEAC", "FCFA", "Sell" },
                    { "XOF", 0, true, "West African CFA Franc", "Franc CFA BCEAO", "FCFA", "Sell" }
                });

            migrationBuilder.InsertData(
                table: "Countries",
                columns: new[] { "Code", "CurrencyCode", "Flag", "IsActive", "Name", "NameFr" },
                values: new object[,]
                {
                    { "GH", "GHS", "🇬🇭", true, "Ghana", "Ghana" },
                    { "NG", "NGN", "🇳🇬", true, "Nigeria", "Nigeria" }
                });

            migrationBuilder.InsertData(
                table: "CountryPaymentMethods",
                columns: new[] { "CountryCode", "PaymentMethodId", "IsPopular" },
                values: new object[,]
                {
                    { "GH", new Guid("10000000-0000-0000-0000-000000000001"), true },
                    { "GH", new Guid("10000000-0000-0000-0000-000000000018"), true },
                    { "GH", new Guid("10000000-0000-0000-0000-000000000019"), true },
                    { "GH", new Guid("10000000-0000-0000-0000-000000000020"), false },
                    { "NG", new Guid("10000000-0000-0000-0000-000000000001"), true },
                    { "NG", new Guid("10000000-0000-0000-0000-000000000014"), true },
                    { "NG", new Guid("10000000-0000-0000-0000-000000000015"), true },
                    { "NG", new Guid("10000000-0000-0000-0000-000000000016"), false },
                    { "NG", new Guid("10000000-0000-0000-0000-000000000017"), true }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Offers_BuyCurrencyCode",
                table: "Offers",
                column: "BuyCurrencyCode");

            migrationBuilder.CreateIndex(
                name: "IX_Offers_SellCountryCode",
                table: "Offers",
                column: "SellCountryCode");

            migrationBuilder.CreateIndex(
                name: "IX_Offers_SellCurrencyCode_BuyCurrencyCode_Status",
                table: "Offers",
                columns: new[] { "SellCurrencyCode", "BuyCurrencyCode", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Offers_Type_Status",
                table: "Offers",
                columns: new[] { "Type", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Countries_CurrencyCode",
                table: "Countries",
                column: "CurrencyCode");

            migrationBuilder.AddForeignKey(
                name: "FK_Countries_SupportedCurrencies_CurrencyCode",
                table: "Countries",
                column: "CurrencyCode",
                principalTable: "SupportedCurrencies",
                principalColumn: "Code",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Offers_Countries_BuyCountryCode",
                table: "Offers",
                column: "BuyCountryCode",
                principalTable: "Countries",
                principalColumn: "Code",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Offers_Countries_SellCountryCode",
                table: "Offers",
                column: "SellCountryCode",
                principalTable: "Countries",
                principalColumn: "Code",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Offers_SupportedCurrencies_BuyCurrencyCode",
                table: "Offers",
                column: "BuyCurrencyCode",
                principalTable: "SupportedCurrencies",
                principalColumn: "Code",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Offers_SupportedCurrencies_SellCurrencyCode",
                table: "Offers",
                column: "SellCurrencyCode",
                principalTable: "SupportedCurrencies",
                principalColumn: "Code",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Countries_SupportedCurrencies_CurrencyCode",
                table: "Countries");

            migrationBuilder.DropForeignKey(
                name: "FK_Offers_Countries_BuyCountryCode",
                table: "Offers");

            migrationBuilder.DropForeignKey(
                name: "FK_Offers_Countries_SellCountryCode",
                table: "Offers");

            migrationBuilder.DropForeignKey(
                name: "FK_Offers_SupportedCurrencies_BuyCurrencyCode",
                table: "Offers");

            migrationBuilder.DropForeignKey(
                name: "FK_Offers_SupportedCurrencies_SellCurrencyCode",
                table: "Offers");

            migrationBuilder.DropTable(
                name: "SupportedCurrencies");

            migrationBuilder.DropIndex(
                name: "IX_Offers_BuyCurrencyCode",
                table: "Offers");

            migrationBuilder.DropIndex(
                name: "IX_Offers_SellCountryCode",
                table: "Offers");

            migrationBuilder.DropIndex(
                name: "IX_Offers_SellCurrencyCode_BuyCurrencyCode_Status",
                table: "Offers");

            migrationBuilder.DropIndex(
                name: "IX_Offers_Type_Status",
                table: "Offers");

            migrationBuilder.DropIndex(
                name: "IX_Countries_CurrencyCode",
                table: "Countries");

            migrationBuilder.DeleteData(
                table: "CountryPaymentMethods",
                keyColumns: new[] { "CountryCode", "PaymentMethodId" },
                keyValues: new object[] { "GH", new Guid("10000000-0000-0000-0000-000000000001") });

            migrationBuilder.DeleteData(
                table: "CountryPaymentMethods",
                keyColumns: new[] { "CountryCode", "PaymentMethodId" },
                keyValues: new object[] { "GH", new Guid("10000000-0000-0000-0000-000000000018") });

            migrationBuilder.DeleteData(
                table: "CountryPaymentMethods",
                keyColumns: new[] { "CountryCode", "PaymentMethodId" },
                keyValues: new object[] { "GH", new Guid("10000000-0000-0000-0000-000000000019") });

            migrationBuilder.DeleteData(
                table: "CountryPaymentMethods",
                keyColumns: new[] { "CountryCode", "PaymentMethodId" },
                keyValues: new object[] { "GH", new Guid("10000000-0000-0000-0000-000000000020") });

            migrationBuilder.DeleteData(
                table: "CountryPaymentMethods",
                keyColumns: new[] { "CountryCode", "PaymentMethodId" },
                keyValues: new object[] { "NG", new Guid("10000000-0000-0000-0000-000000000001") });

            migrationBuilder.DeleteData(
                table: "CountryPaymentMethods",
                keyColumns: new[] { "CountryCode", "PaymentMethodId" },
                keyValues: new object[] { "NG", new Guid("10000000-0000-0000-0000-000000000014") });

            migrationBuilder.DeleteData(
                table: "CountryPaymentMethods",
                keyColumns: new[] { "CountryCode", "PaymentMethodId" },
                keyValues: new object[] { "NG", new Guid("10000000-0000-0000-0000-000000000015") });

            migrationBuilder.DeleteData(
                table: "CountryPaymentMethods",
                keyColumns: new[] { "CountryCode", "PaymentMethodId" },
                keyValues: new object[] { "NG", new Guid("10000000-0000-0000-0000-000000000016") });

            migrationBuilder.DeleteData(
                table: "CountryPaymentMethods",
                keyColumns: new[] { "CountryCode", "PaymentMethodId" },
                keyValues: new object[] { "NG", new Guid("10000000-0000-0000-0000-000000000017") });

            migrationBuilder.DeleteData(
                table: "Countries",
                keyColumn: "Code",
                keyValue: "GH");

            migrationBuilder.DeleteData(
                table: "Countries",
                keyColumn: "Code",
                keyValue: "NG");

            migrationBuilder.DeleteData(
                table: "PaymentMethods",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000014"));

            migrationBuilder.DeleteData(
                table: "PaymentMethods",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000015"));

            migrationBuilder.DeleteData(
                table: "PaymentMethods",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000016"));

            migrationBuilder.DeleteData(
                table: "PaymentMethods",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000017"));

            migrationBuilder.DeleteData(
                table: "PaymentMethods",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000018"));

            migrationBuilder.DeleteData(
                table: "PaymentMethods",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000019"));

            migrationBuilder.DeleteData(
                table: "PaymentMethods",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000020"));

            migrationBuilder.DropColumn(
                name: "BuyCurrencyCode",
                table: "Offers");

            migrationBuilder.DropColumn(
                name: "SellCurrencyCode",
                table: "Offers");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "Offers");

            migrationBuilder.DropColumn(
                name: "CurrencyCode",
                table: "Countries");

            migrationBuilder.RenameColumn(
                name: "SellCountryCode",
                table: "Offers",
                newName: "ToCurrency");

            migrationBuilder.RenameColumn(
                name: "BuyCountryCode",
                table: "Offers",
                newName: "ToCountryCode");

            migrationBuilder.RenameIndex(
                name: "IX_Offers_BuyCountryCode",
                table: "Offers",
                newName: "IX_Offers_ToCountryCode");

            migrationBuilder.AddColumn<string>(
                name: "FromCountryCode",
                table: "Offers",
                type: "character varying(3)",
                maxLength: 3,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "FromCurrency",
                table: "Offers",
                type: "character varying(3)",
                maxLength: 3,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Currency",
                table: "Countries",
                type: "character varying(3)",
                maxLength: 3,
                nullable: false,
                defaultValue: "");

            migrationBuilder.UpdateData(
                table: "Countries",
                keyColumn: "Code",
                keyValue: "BF",
                column: "Currency",
                value: "XOF");

            migrationBuilder.UpdateData(
                table: "Countries",
                keyColumn: "Code",
                keyValue: "BJ",
                column: "Currency",
                value: "XOF");

            migrationBuilder.UpdateData(
                table: "Countries",
                keyColumn: "Code",
                keyValue: "CA",
                column: "Currency",
                value: "CAD");

            migrationBuilder.UpdateData(
                table: "Countries",
                keyColumn: "Code",
                keyValue: "CF",
                column: "Currency",
                value: "XAF");

            migrationBuilder.UpdateData(
                table: "Countries",
                keyColumn: "Code",
                keyValue: "CG",
                column: "Currency",
                value: "XAF");

            migrationBuilder.UpdateData(
                table: "Countries",
                keyColumn: "Code",
                keyValue: "CI",
                column: "Currency",
                value: "XOF");

            migrationBuilder.UpdateData(
                table: "Countries",
                keyColumn: "Code",
                keyValue: "CM",
                column: "Currency",
                value: "XAF");

            migrationBuilder.UpdateData(
                table: "Countries",
                keyColumn: "Code",
                keyValue: "GA",
                column: "Currency",
                value: "XAF");

            migrationBuilder.UpdateData(
                table: "Countries",
                keyColumn: "Code",
                keyValue: "GQ",
                column: "Currency",
                value: "XAF");

            migrationBuilder.UpdateData(
                table: "Countries",
                keyColumn: "Code",
                keyValue: "GW",
                column: "Currency",
                value: "XOF");

            migrationBuilder.UpdateData(
                table: "Countries",
                keyColumn: "Code",
                keyValue: "ML",
                column: "Currency",
                value: "XOF");

            migrationBuilder.UpdateData(
                table: "Countries",
                keyColumn: "Code",
                keyValue: "NE",
                column: "Currency",
                value: "XOF");

            migrationBuilder.UpdateData(
                table: "Countries",
                keyColumn: "Code",
                keyValue: "SN",
                column: "Currency",
                value: "XOF");

            migrationBuilder.UpdateData(
                table: "Countries",
                keyColumn: "Code",
                keyValue: "TD",
                column: "Currency",
                value: "XAF");

            migrationBuilder.UpdateData(
                table: "Countries",
                keyColumn: "Code",
                keyValue: "TG",
                column: "Currency",
                value: "XOF");

            migrationBuilder.UpdateData(
                table: "PaymentMethods",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000003"),
                column: "Description",
                value: "Virement bancaire SWIFT/SEPA");

            migrationBuilder.UpdateData(
                table: "PaymentMethods",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000005"),
                columns: new[] { "Description", "Name" },
                values: new object[] { "Mobile Money Orange Sénégal", "Orange Money Sénégal" });

            migrationBuilder.UpdateData(
                table: "PaymentMethods",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000006"),
                column: "Description",
                value: "Mobile Money Free (Sénégal)");

            migrationBuilder.UpdateData(
                table: "PaymentMethods",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000007"),
                columns: new[] { "Description", "Name" },
                values: new object[] { "MTN MoMo Côte d'Ivoire", "MTN Mobile Money CI" });

            migrationBuilder.UpdateData(
                table: "PaymentMethods",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000010"),
                columns: new[] { "Description", "Name" },
                values: new object[] { "MTN MoMo Cameroun", "MTN Mobile Money CM" });

            migrationBuilder.UpdateData(
                table: "PaymentMethods",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000012"),
                column: "Name",
                value: "Orange Money Mali");

            migrationBuilder.UpdateData(
                table: "PaymentMethods",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000013"),
                column: "Name",
                value: "Moov Money Mali");

            migrationBuilder.CreateIndex(
                name: "IX_Offers_FromCountryCode",
                table: "Offers",
                column: "FromCountryCode");

            migrationBuilder.AddForeignKey(
                name: "FK_Offers_Countries_FromCountryCode",
                table: "Offers",
                column: "FromCountryCode",
                principalTable: "Countries",
                principalColumn: "Code",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Offers_Countries_ToCountryCode",
                table: "Offers",
                column: "ToCountryCode",
                principalTable: "Countries",
                principalColumn: "Code",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
