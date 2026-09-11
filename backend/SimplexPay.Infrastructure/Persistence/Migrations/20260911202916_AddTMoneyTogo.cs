using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SimplexPay.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddTMoneyTogo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "CountryPaymentMethods",
                keyColumns: new[] { "CountryCode", "PaymentMethodId" },
                keyValues: new object[] { "TG", new Guid("10000000-0000-0000-0000-000000000009") },
                column: "IsPopular",
                value: false);

            migrationBuilder.InsertData(
                table: "PaymentMethods",
                columns: new[] { "Id", "Description", "IsActive", "LogoUrl", "Name", "Type" },
                values: new object[] { new Guid("10000000-0000-0000-0000-000000000021"), "T-Money / Yas — Togocom (Togo)", true, null, "T-Money (Yas) TG", "MobileMoney" });

            migrationBuilder.InsertData(
                table: "CountryPaymentMethods",
                columns: new[] { "CountryCode", "PaymentMethodId", "IsPopular" },
                values: new object[] { "TG", new Guid("10000000-0000-0000-0000-000000000021"), true });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "CountryPaymentMethods",
                keyColumns: new[] { "CountryCode", "PaymentMethodId" },
                keyValues: new object[] { "TG", new Guid("10000000-0000-0000-0000-000000000021") });

            migrationBuilder.DeleteData(
                table: "PaymentMethods",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000021"));

            migrationBuilder.UpdateData(
                table: "CountryPaymentMethods",
                keyColumns: new[] { "CountryCode", "PaymentMethodId" },
                keyValues: new object[] { "TG", new Guid("10000000-0000-0000-0000-000000000009") },
                column: "IsPopular",
                value: true);
        }
    }
}
