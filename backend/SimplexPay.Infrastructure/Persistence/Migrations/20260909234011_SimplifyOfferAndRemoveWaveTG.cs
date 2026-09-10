using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SimplexPay.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class SimplifyOfferAndRemoveWaveTG : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "CountryPaymentMethods",
                keyColumns: new[] { "CountryCode", "PaymentMethodId" },
                keyValues: new object[] { "TG", new Guid("10000000-0000-0000-0000-000000000004") });

            migrationBuilder.AlterColumn<decimal>(
                name: "Rate",
                table: "Offers",
                type: "numeric(18,6)",
                precision: 18,
                scale: 6,
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,6)",
                oldPrecision: 18,
                oldScale: 6);

            migrationBuilder.AlterColumn<decimal>(
                name: "MaxAmount",
                table: "Offers",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,4)",
                oldPrecision: 18,
                oldScale: 4);

            migrationBuilder.AddColumn<string>(
                name: "RateMode",
                table: "Offers",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "Fixed");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RateMode",
                table: "Offers");

            migrationBuilder.AlterColumn<decimal>(
                name: "Rate",
                table: "Offers",
                type: "numeric(18,6)",
                precision: 18,
                scale: 6,
                nullable: false,
                defaultValue: 0m,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,6)",
                oldPrecision: 18,
                oldScale: 6,
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "MaxAmount",
                table: "Offers",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: false,
                defaultValue: 0m,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,4)",
                oldPrecision: 18,
                oldScale: 4,
                oldNullable: true);

            migrationBuilder.InsertData(
                table: "CountryPaymentMethods",
                columns: new[] { "CountryCode", "PaymentMethodId", "IsPopular" },
                values: new object[] { "TG", new Guid("10000000-0000-0000-0000-000000000004"), false });
        }
    }
}
