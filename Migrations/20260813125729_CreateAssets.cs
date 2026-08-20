using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace UserManagement.Migrations
{
    /// <inheritdoc />
    public partial class CreateAssets : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "assets",
                columns: table => new
                {
                    id = table.Column<int>(
                        type: "integer",
                        nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),

                    name = table.Column<string>(
                        type: "character varying(200)",
                        maxLength: 200,
                        nullable: false),

                    type = table.Column<string>(
                        type: "character varying(50)",
                        maxLength: 50,
                        nullable: false),

                    url = table.Column<string>(
                        type: "character varying(500)",
                        maxLength: 500,
                        nullable: false),

                    description = table.Column<string>(
                        type: "character varying(1000)",
                        maxLength: 1000,
                        nullable: false),

                    is_active = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: true),

                    created_at = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false),

                    updated_at = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_assets", x => x.id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "assets");
        }
    }
}