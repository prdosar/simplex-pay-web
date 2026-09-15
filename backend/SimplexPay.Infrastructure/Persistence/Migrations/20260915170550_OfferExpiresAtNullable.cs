using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SimplexPay.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class OfferExpiresAtNullable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "ExpiresAt",
                table: "Offers",
                type: "timestamp with time zone",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            // Étend les offres actives existantes : elles n'expirent plus (le créateur les clôture manuellement).
            migrationBuilder.Sql(
                @"UPDATE ""Offers"" SET ""ExpiresAt"" = NULL WHERE ""Status"" IN ('Open', 'PartiallyFilled');");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "ExpiresAt",
                table: "Offers",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldNullable: true);
        }
    }
}
