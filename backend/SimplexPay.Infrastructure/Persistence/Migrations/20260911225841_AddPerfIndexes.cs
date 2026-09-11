using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SimplexPay.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddPerfIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Reviews_ReviewedUserId",
                table: "Reviews");

            migrationBuilder.CreateIndex(
                name: "IX_TravelKiloOffers_CreatedAt",
                table: "TravelKiloOffers",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_TravelKiloOffers_Status_ExpiresAt",
                table: "TravelKiloOffers",
                columns: new[] { "Status", "ExpiresAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_ReviewedUserId_CreatedAt",
                table: "Reviews",
                columns: new[] { "ReviewedUserId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Offers_CreatedAt",
                table: "Offers",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Offers_Status_ExpiresAt",
                table: "Offers",
                columns: new[] { "Status", "ExpiresAt" });

            migrationBuilder.CreateIndex(
                name: "IX_BoatShippingOffers_CreatedAt",
                table: "BoatShippingOffers",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_BoatShippingOffers_Status_ExpiresAt",
                table: "BoatShippingOffers",
                columns: new[] { "Status", "ExpiresAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_TravelKiloOffers_CreatedAt",
                table: "TravelKiloOffers");

            migrationBuilder.DropIndex(
                name: "IX_TravelKiloOffers_Status_ExpiresAt",
                table: "TravelKiloOffers");

            migrationBuilder.DropIndex(
                name: "IX_Reviews_ReviewedUserId_CreatedAt",
                table: "Reviews");

            migrationBuilder.DropIndex(
                name: "IX_Offers_CreatedAt",
                table: "Offers");

            migrationBuilder.DropIndex(
                name: "IX_Offers_Status_ExpiresAt",
                table: "Offers");

            migrationBuilder.DropIndex(
                name: "IX_BoatShippingOffers_CreatedAt",
                table: "BoatShippingOffers");

            migrationBuilder.DropIndex(
                name: "IX_BoatShippingOffers_Status_ExpiresAt",
                table: "BoatShippingOffers");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_ReviewedUserId",
                table: "Reviews",
                column: "ReviewedUserId");
        }
    }
}
