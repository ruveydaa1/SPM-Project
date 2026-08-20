using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace UserManagement.Migrations
{
    /// <inheritdoc />
    public partial class AddFindings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ScanSource",
                table: "assets",
                newName: "scan_source");

            migrationBuilder.AlterColumn<string>(
                name: "scan_source",
                table: "assets",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.CreateTable(
                name: "findings",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    asset_id = table.Column<int>(type: "integer", nullable: false),
                    check_id = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    path = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    start_line = table.Column<int>(type: "integer", nullable: false),
                    start_column = table.Column<int>(type: "integer", nullable: false),
                    end_line = table.Column<int>(type: "integer", nullable: false),
                    end_column = table.Column<int>(type: "integer", nullable: false),
                    message = table.Column<string>(type: "character varying(5000)", maxLength: 5000, nullable: false),
                    category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    severity = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    confidence = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    impact = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    cwe = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    owasp = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    vulnerability_class = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    reference = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_findings", x => x.id);
                    table.ForeignKey(
                        name: "FK_findings_assets_asset_id",
                        column: x => x.asset_id,
                        principalTable: "assets",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_findings_asset_id",
                table: "findings",
                column: "asset_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "findings");

            migrationBuilder.RenameColumn(
                name: "scan_source",
                table: "assets",
                newName: "ScanSource");

            migrationBuilder.AlterColumn<string>(
                name: "ScanSource",
                table: "assets",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(1000)",
                oldMaxLength: 1000);
        }
    }
}
