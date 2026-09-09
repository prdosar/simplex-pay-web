using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SimplexPay.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddTravelKiloAndBoatShipping : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BoatShippingOffers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    AvailableLbs = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    PricePerLb = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    ShipDepartureDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeparturePort = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    DestinationPort = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    DepartureCountryCode = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    DestinationCountryCode = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    Notes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BoatShippingOffers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BoatShippingOffers_Countries_DepartureCountryCode",
                        column: x => x.DepartureCountryCode,
                        principalTable: "Countries",
                        principalColumn: "Code",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_BoatShippingOffers_Countries_DestinationCountryCode",
                        column: x => x.DestinationCountryCode,
                        principalTable: "Countries",
                        principalColumn: "Code",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_BoatShippingOffers_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TravelKiloOffers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    AvailableKg = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    PricePerKg = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    TravelDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DepartureCity = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    DestinationCity = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    DepartureCountryCode = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    DestinationCountryCode = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    Notes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TravelKiloOffers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TravelKiloOffers_Countries_DepartureCountryCode",
                        column: x => x.DepartureCountryCode,
                        principalTable: "Countries",
                        principalColumn: "Code",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TravelKiloOffers_Countries_DestinationCountryCode",
                        column: x => x.DestinationCountryCode,
                        principalTable: "Countries",
                        principalColumn: "Code",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TravelKiloOffers_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BoatShippingOffers_DepartureCountryCode_DestinationCountryC~",
                table: "BoatShippingOffers",
                columns: new[] { "DepartureCountryCode", "DestinationCountryCode", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_BoatShippingOffers_DestinationCountryCode",
                table: "BoatShippingOffers",
                column: "DestinationCountryCode");

            migrationBuilder.CreateIndex(
                name: "IX_BoatShippingOffers_ShipDepartureDate",
                table: "BoatShippingOffers",
                column: "ShipDepartureDate");

            migrationBuilder.CreateIndex(
                name: "IX_BoatShippingOffers_UserId",
                table: "BoatShippingOffers",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_TravelKiloOffers_DepartureCountryCode_DestinationCountryCod~",
                table: "TravelKiloOffers",
                columns: new[] { "DepartureCountryCode", "DestinationCountryCode", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_TravelKiloOffers_DestinationCountryCode",
                table: "TravelKiloOffers",
                column: "DestinationCountryCode");

            migrationBuilder.CreateIndex(
                name: "IX_TravelKiloOffers_TravelDate",
                table: "TravelKiloOffers",
                column: "TravelDate");

            migrationBuilder.CreateIndex(
                name: "IX_TravelKiloOffers_UserId",
                table: "TravelKiloOffers",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BoatShippingOffers");

            migrationBuilder.DropTable(
                name: "TravelKiloOffers");
        }
    }
}
