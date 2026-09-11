using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SimplexPay.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddIsCertifiedAndDecoupleReviews : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_Transactions_TransactionId",
                table: "Reviews");

            migrationBuilder.DropIndex(
                name: "IX_Reviews_ReviewerId",
                table: "Reviews");

            migrationBuilder.DropIndex(
                name: "IX_Reviews_TransactionId_ReviewerId",
                table: "Reviews");

            migrationBuilder.DropColumn(
                name: "TransactionId",
                table: "Reviews");

            migrationBuilder.AddColumn<bool>(
                name: "IsCertified",
                table: "Users",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "ReviewCount",
                table: "Users",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_ReviewerId_ReviewedUserId",
                table: "Reviews",
                columns: new[] { "ReviewerId", "ReviewedUserId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Reviews_ReviewerId_ReviewedUserId",
                table: "Reviews");

            migrationBuilder.DropColumn(
                name: "IsCertified",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ReviewCount",
                table: "Users");

            migrationBuilder.AddColumn<Guid>(
                name: "TransactionId",
                table: "Reviews",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_ReviewerId",
                table: "Reviews",
                column: "ReviewerId");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_TransactionId_ReviewerId",
                table: "Reviews",
                columns: new[] { "TransactionId", "ReviewerId" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_Transactions_TransactionId",
                table: "Reviews",
                column: "TransactionId",
                principalTable: "Transactions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
