using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UserManagement.Migrations
{
    /// <inheritdoc />
    public partial class AddScanRunStartedByUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {

            migrationBuilder.AddColumn<int>(
                name: "started_by_user_id",
                table: "scan_runs",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_scan_runs_started_by_user_id",
                table: "scan_runs",
                column: "started_by_user_id");

            migrationBuilder.AddForeignKey(
                name: "FK_scan_runs_users_started_by_user_id",
                table: "scan_runs",
                column: "started_by_user_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_scan_runs_users_started_by_user_id",
                table: "scan_runs");

            migrationBuilder.DropIndex(
                name: "IX_scan_runs_started_by_user_id",
                table: "scan_runs");

            migrationBuilder.DropColumn(
                name: "started_by_user_id",
                table: "scan_runs");

        }
    }
}
