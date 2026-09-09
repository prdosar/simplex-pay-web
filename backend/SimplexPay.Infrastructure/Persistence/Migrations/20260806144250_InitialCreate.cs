using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace SimplexPay.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Countries",
                columns: table => new
                {
                    Code = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    NameFr = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    Flag = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Countries", x => x.Code);
                });

            migrationBuilder.CreateTable(
                name: "PaymentMethods",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    Type = table.Column<string>(type: "text", nullable: false),
                    LogoUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PaymentMethods", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FirstName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    LastName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: false),
                    PhoneNumber = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    WhatsAppNumber = table.Column<string>(type: "text", nullable: true),
                    Country = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    Rating = table.Column<decimal>(type: "numeric(3,2)", precision: 3, scale: 2, nullable: false),
                    TransactionCount = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CountryPaymentMethods",
                columns: table => new
                {
                    CountryCode = table.Column<string>(type: "character varying(3)", nullable: false),
                    PaymentMethodId = table.Column<Guid>(type: "uuid", nullable: false),
                    IsPopular = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CountryPaymentMethods", x => new { x.CountryCode, x.PaymentMethodId });
                    table.ForeignKey(
                        name: "FK_CountryPaymentMethods_Countries_CountryCode",
                        column: x => x.CountryCode,
                        principalTable: "Countries",
                        principalColumn: "Code",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CountryPaymentMethods_PaymentMethods_PaymentMethodId",
                        column: x => x.PaymentMethodId,
                        principalTable: "PaymentMethods",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Offers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    FromCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    ToCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    FromCountryCode = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    ToCountryCode = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    AmountFilled = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    Rate = table.Column<decimal>(type: "numeric(18,6)", precision: 18, scale: 6, nullable: false),
                    MinAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    MaxAmount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    Notes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Offers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Offers_Countries_FromCountryCode",
                        column: x => x.FromCountryCode,
                        principalTable: "Countries",
                        principalColumn: "Code",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Offers_Countries_ToCountryCode",
                        column: x => x.ToCountryCode,
                        principalTable: "Countries",
                        principalColumn: "Code",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Offers_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "OfferPaymentMethods",
                columns: table => new
                {
                    OfferId = table.Column<Guid>(type: "uuid", nullable: false),
                    PaymentMethodId = table.Column<Guid>(type: "uuid", nullable: false),
                    Side = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OfferPaymentMethods", x => new { x.OfferId, x.PaymentMethodId, x.Side });
                    table.ForeignKey(
                        name: "FK_OfferPaymentMethods_Offers_OfferId",
                        column: x => x.OfferId,
                        principalTable: "Offers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OfferPaymentMethods_PaymentMethods_PaymentMethodId",
                        column: x => x.PaymentMethodId,
                        principalTable: "PaymentMethods",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Transactions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OfferId = table.Column<Guid>(type: "uuid", nullable: false),
                    BuyerId = table.Column<Guid>(type: "uuid", nullable: false),
                    SellerId = table.Column<Guid>(type: "uuid", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    Rate = table.Column<decimal>(type: "numeric(18,6)", precision: 18, scale: 6, nullable: false),
                    TotalValue = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    PlatformFee = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    SellerPaymentProof = table.Column<string>(type: "text", nullable: true),
                    BuyerPaymentProof = table.Column<string>(type: "text", nullable: true),
                    DisputeReason = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Transactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Transactions_Offers_OfferId",
                        column: x => x.OfferId,
                        principalTable: "Offers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Transactions_Users_BuyerId",
                        column: x => x.BuyerId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Transactions_Users_SellerId",
                        column: x => x.SellerId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Reviews",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TransactionId = table.Column<Guid>(type: "uuid", nullable: false),
                    ReviewerId = table.Column<Guid>(type: "uuid", nullable: false),
                    ReviewedUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Rating = table.Column<int>(type: "integer", nullable: false),
                    Comment = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reviews", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Reviews_Transactions_TransactionId",
                        column: x => x.TransactionId,
                        principalTable: "Transactions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Reviews_Users_ReviewedUserId",
                        column: x => x.ReviewedUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Reviews_Users_ReviewerId",
                        column: x => x.ReviewerId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "Countries",
                columns: new[] { "Code", "Currency", "Flag", "IsActive", "Name", "NameFr" },
                values: new object[,]
                {
                    { "BF", "XOF", "🇧🇫", true, "Burkina Faso", "Burkina Faso" },
                    { "BJ", "XOF", "🇧🇯", true, "Benin", "Bénin" },
                    { "CA", "CAD", "🇨🇦", true, "Canada", "Canada" },
                    { "CF", "XAF", "🇨🇫", true, "Central African Republic", "RCA" },
                    { "CG", "XAF", "🇨🇬", true, "Congo", "Congo-Brazzaville" },
                    { "CI", "XOF", "🇨🇮", true, "Ivory Coast", "Côte d'Ivoire" },
                    { "CM", "XAF", "🇨🇲", true, "Cameroon", "Cameroun" },
                    { "GA", "XAF", "🇬🇦", true, "Gabon", "Gabon" },
                    { "GQ", "XAF", "🇬🇶", true, "Equatorial Guinea", "Guinée Équatoriale" },
                    { "GW", "XOF", "🇬🇼", true, "Guinea-Bissau", "Guinée-Bissau" },
                    { "ML", "XOF", "🇲🇱", true, "Mali", "Mali" },
                    { "NE", "XOF", "🇳🇪", true, "Niger", "Niger" },
                    { "SN", "XOF", "🇸🇳", true, "Senegal", "Sénégal" },
                    { "TD", "XAF", "🇹🇩", true, "Chad", "Tchad" },
                    { "TG", "XOF", "🇹🇬", true, "Togo", "Togo" }
                });

            migrationBuilder.InsertData(
                table: "PaymentMethods",
                columns: new[] { "Id", "Description", "IsActive", "LogoUrl", "Name", "Type" },
                values: new object[,]
                {
                    { new Guid("10000000-0000-0000-0000-000000000001"), "Remise en main propre", true, null, "Cash", "Cash" },
                    { new Guid("10000000-0000-0000-0000-000000000002"), "Virement Interac (Canada)", true, null, "Interac e-Transfer", "BankTransfer" },
                    { new Guid("10000000-0000-0000-0000-000000000003"), "Virement bancaire SWIFT/SEPA", true, null, "Virement bancaire", "BankTransfer" },
                    { new Guid("10000000-0000-0000-0000-000000000004"), "Mobile Money Wave", true, null, "Wave", "MobileMoney" },
                    { new Guid("10000000-0000-0000-0000-000000000005"), "Mobile Money Orange Sénégal", true, null, "Orange Money Sénégal", "MobileMoney" },
                    { new Guid("10000000-0000-0000-0000-000000000006"), "Mobile Money Free (Sénégal)", true, null, "Free Money", "MobileMoney" },
                    { new Guid("10000000-0000-0000-0000-000000000007"), "MTN MoMo Côte d'Ivoire", true, null, "MTN Mobile Money CI", "MobileMoney" },
                    { new Guid("10000000-0000-0000-0000-000000000008"), "Orange Money Côte d'Ivoire", true, null, "Orange Money CI", "MobileMoney" },
                    { new Guid("10000000-0000-0000-0000-000000000009"), "Moov Money Côte d'Ivoire", true, null, "Moov Money CI", "MobileMoney" },
                    { new Guid("10000000-0000-0000-0000-000000000010"), "MTN MoMo Cameroun", true, null, "MTN Mobile Money CM", "MobileMoney" },
                    { new Guid("10000000-0000-0000-0000-000000000011"), "Orange Money Cameroun", true, null, "Orange Money CM", "MobileMoney" },
                    { new Guid("10000000-0000-0000-0000-000000000012"), "Orange Money Mali", true, null, "Orange Money Mali", "MobileMoney" },
                    { new Guid("10000000-0000-0000-0000-000000000013"), "Moov Money Mali", true, null, "Moov Money Mali", "MobileMoney" }
                });

            migrationBuilder.InsertData(
                table: "CountryPaymentMethods",
                columns: new[] { "CountryCode", "PaymentMethodId", "IsPopular" },
                values: new object[,]
                {
                    { "BF", new Guid("10000000-0000-0000-0000-000000000001"), true },
                    { "BF", new Guid("10000000-0000-0000-0000-000000000008"), true },
                    { "BF", new Guid("10000000-0000-0000-0000-000000000009"), false },
                    { "BJ", new Guid("10000000-0000-0000-0000-000000000001"), true },
                    { "BJ", new Guid("10000000-0000-0000-0000-000000000007"), true },
                    { "BJ", new Guid("10000000-0000-0000-0000-000000000009"), false },
                    { "CA", new Guid("10000000-0000-0000-0000-000000000001"), true },
                    { "CA", new Guid("10000000-0000-0000-0000-000000000002"), true },
                    { "CA", new Guid("10000000-0000-0000-0000-000000000003"), false },
                    { "CF", new Guid("10000000-0000-0000-0000-000000000001"), true },
                    { "CG", new Guid("10000000-0000-0000-0000-000000000001"), true },
                    { "CG", new Guid("10000000-0000-0000-0000-000000000010"), true },
                    { "CI", new Guid("10000000-0000-0000-0000-000000000001"), true },
                    { "CI", new Guid("10000000-0000-0000-0000-000000000003"), false },
                    { "CI", new Guid("10000000-0000-0000-0000-000000000004"), true },
                    { "CI", new Guid("10000000-0000-0000-0000-000000000007"), true },
                    { "CI", new Guid("10000000-0000-0000-0000-000000000008"), true },
                    { "CI", new Guid("10000000-0000-0000-0000-000000000009"), false },
                    { "CM", new Guid("10000000-0000-0000-0000-000000000001"), true },
                    { "CM", new Guid("10000000-0000-0000-0000-000000000003"), false },
                    { "CM", new Guid("10000000-0000-0000-0000-000000000010"), true },
                    { "CM", new Guid("10000000-0000-0000-0000-000000000011"), true },
                    { "GA", new Guid("10000000-0000-0000-0000-000000000001"), true },
                    { "GA", new Guid("10000000-0000-0000-0000-000000000010"), false },
                    { "GA", new Guid("10000000-0000-0000-0000-000000000011"), true },
                    { "GQ", new Guid("10000000-0000-0000-0000-000000000001"), true },
                    { "GW", new Guid("10000000-0000-0000-0000-000000000001"), true },
                    { "GW", new Guid("10000000-0000-0000-0000-000000000005"), false },
                    { "ML", new Guid("10000000-0000-0000-0000-000000000001"), true },
                    { "ML", new Guid("10000000-0000-0000-0000-000000000003"), false },
                    { "ML", new Guid("10000000-0000-0000-0000-000000000012"), true },
                    { "ML", new Guid("10000000-0000-0000-0000-000000000013"), false },
                    { "NE", new Guid("10000000-0000-0000-0000-000000000001"), true },
                    { "NE", new Guid("10000000-0000-0000-0000-000000000005"), true },
                    { "SN", new Guid("10000000-0000-0000-0000-000000000001"), true },
                    { "SN", new Guid("10000000-0000-0000-0000-000000000003"), false },
                    { "SN", new Guid("10000000-0000-0000-0000-000000000004"), true },
                    { "SN", new Guid("10000000-0000-0000-0000-000000000005"), true },
                    { "SN", new Guid("10000000-0000-0000-0000-000000000006"), false },
                    { "TD", new Guid("10000000-0000-0000-0000-000000000001"), true },
                    { "TD", new Guid("10000000-0000-0000-0000-000000000011"), true },
                    { "TG", new Guid("10000000-0000-0000-0000-000000000001"), true },
                    { "TG", new Guid("10000000-0000-0000-0000-000000000004"), false },
                    { "TG", new Guid("10000000-0000-0000-0000-000000000009"), true }
                });

            migrationBuilder.CreateIndex(
                name: "IX_CountryPaymentMethods_PaymentMethodId",
                table: "CountryPaymentMethods",
                column: "PaymentMethodId");

            migrationBuilder.CreateIndex(
                name: "IX_OfferPaymentMethods_PaymentMethodId",
                table: "OfferPaymentMethods",
                column: "PaymentMethodId");

            migrationBuilder.CreateIndex(
                name: "IX_Offers_FromCountryCode",
                table: "Offers",
                column: "FromCountryCode");

            migrationBuilder.CreateIndex(
                name: "IX_Offers_ToCountryCode",
                table: "Offers",
                column: "ToCountryCode");

            migrationBuilder.CreateIndex(
                name: "IX_Offers_UserId",
                table: "Offers",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_ReviewedUserId",
                table: "Reviews",
                column: "ReviewedUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_ReviewerId",
                table: "Reviews",
                column: "ReviewerId");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_TransactionId_ReviewerId",
                table: "Reviews",
                columns: new[] { "TransactionId", "ReviewerId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_BuyerId",
                table: "Transactions",
                column: "BuyerId");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_OfferId",
                table: "Transactions",
                column: "OfferId");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_SellerId",
                table: "Transactions",
                column: "SellerId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CountryPaymentMethods");

            migrationBuilder.DropTable(
                name: "OfferPaymentMethods");

            migrationBuilder.DropTable(
                name: "Reviews");

            migrationBuilder.DropTable(
                name: "PaymentMethods");

            migrationBuilder.DropTable(
                name: "Transactions");

            migrationBuilder.DropTable(
                name: "Offers");

            migrationBuilder.DropTable(
                name: "Countries");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
