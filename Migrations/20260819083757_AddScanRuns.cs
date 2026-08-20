using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace UserManagement.Migrations
{
    /// <inheritdoc />
    public partial class AddScanRuns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "scan_runs",
                columns: table => new
                {
                    id = table.Column<int>(
                        type: "integer",
                        nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),

                    asset_id = table.Column<int>(
                        type: "integer",
                        nullable: false),

                    scanner = table.Column<string>(
                        type: "character varying(100)",
                        maxLength: 100,
                        nullable: false),

                    source = table.Column<string>(
                        type: "character varying(1000)",
                        maxLength: 1000,
                        nullable: false),

                    status = table.Column<string>(
                        type: "character varying(50)",
                        maxLength: 50,
                        nullable: false),

                    started_at = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false),

                    completed_at = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true),

                    error = table.Column<string>(
                        type: "character varying(5000)",
                        maxLength: 5000,
                        nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_scan_runs", x => x.id);

                    table.ForeignKey(
                        name: "FK_scan_runs_assets_asset_id",
                        column: x => x.asset_id,
                        principalTable: "assets",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.AddColumn<int>(
                name: "scan_run_id",
                table: "findings",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_findings_scan_run_id",
                table: "findings",
                column: "scan_run_id");

            migrationBuilder.CreateIndex(
                name: "IX_scan_runs_asset_id",
                table: "scan_runs",
                column: "asset_id");

            migrationBuilder.Sql("""
        INSERT INTO scan_runs
            (asset_id, scanner, source, status, started_at, completed_at, error)
        SELECT
            f.asset_id,
            'Semgrep',
            COALESCE(a.scan_source, ''),
            'Completed',
            MIN(f.created_at),
            MAX(f.created_at),
            ''
        FROM findings f
        INNER JOIN assets a ON a.id = f.asset_id
        GROUP BY f.asset_id, a.scan_source;
        """);

            migrationBuilder.Sql("""
        UPDATE findings f
        SET scan_run_id = sr.id
        FROM scan_runs sr
        WHERE sr.asset_id = f.asset_id;
        """);

            migrationBuilder.AlterColumn<int>(
                name: "scan_run_id",
                table: "findings",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_findings_scan_runs_scan_run_id",
                table: "findings",
                column: "scan_run_id",
                principalTable: "scan_runs",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_findings_scan_runs_scan_run_id",
                table: "findings");

            migrationBuilder.DropTable(
                name: "scan_runs");

            migrationBuilder.DropIndex(
                name: "IX_findings_scan_run_id",
                table: "findings");

            migrationBuilder.DropColumn(
                name: "scan_run_id",
                table: "findings");
        }
    }
}
