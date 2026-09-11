using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SimplexPay.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class MultiCountryOffer : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Reset : offres devises → multi-pays. Aucune donnée réelle à préserver.
            // Ordre : Transactions (Restrict FK vers Offers) puis OfferPaymentMethods (Cascade) puis Offers.
            migrationBuilder.Sql(@"DELETE FROM ""Transactions"" WHERE ""OfferId"" IS NOT NULL;");
            migrationBuilder.Sql(@"DELETE FROM ""OfferPaymentMethods"";");
            migrationBuilder.Sql(@"DELETE FROM ""Offers"";");

            migrationBuilder.DropForeignKey(
                name: "FK_Offers_Countries_SellCountryCode",
                table: "Offers");

            migrationBuilder.DropIndex(
                name: "IX_Offers_SellCountryCode",
                table: "Offers");

            migrationBuilder.DropColumn(
                name: "SellCountryCode",
                table: "Offers");

            migrationBuilder.CreateTable(
                name: "OfferCountries",
                columns: table => new
                {
                    OfferId = table.Column<Guid>(type: "uuid", nullable: false),
                    CountryCode = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OfferCountries", x => new { x.OfferId, x.CountryCode });
                    table.ForeignKey(
                        name: "FK_OfferCountries_Countries_CountryCode",
                        column: x => x.CountryCode,
                        principalTable: "Countries",
                        principalColumn: "Code",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_OfferCountries_Offers_OfferId",
                        column: x => x.OfferId,
                        principalTable: "Offers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_OfferCountries_CountryCode",
                table: "OfferCountries",
                column: "CountryCode");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "OfferCountries");

            migrationBuilder.AddColumn<string>(
                name: "SellCountryCode",
                table: "Offers",
                type: "character varying(3)",
                maxLength: 3,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Offers_SellCountryCode",
                table: "Offers",
                column: "SellCountryCode");

            migrationBuilder.AddForeignKey(
                name: "FK_Offers_Countries_SellCountryCode",
                table: "Offers",
                column: "SellCountryCode",
                principalTable: "Countries",
                principalColumn: "Code",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
