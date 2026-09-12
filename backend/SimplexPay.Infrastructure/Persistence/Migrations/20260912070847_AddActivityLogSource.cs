using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SimplexPay.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddActivityLogSource : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Source",
                table: "ActivityLogs",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_ActivityLogs_Source",
                table: "ActivityLogs",
                column: "Source");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ActivityLogs_Source",
                table: "ActivityLogs");

            migrationBuilder.DropColumn(
                name: "Source",
                table: "ActivityLogs");
        }
    }
}
