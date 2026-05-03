using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SpotReservation.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SpotPhotos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "spot_photos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SpotId = table.Column<Guid>(type: "uuid", nullable: false),
                    ObjectKey = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    UploadedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_spot_photos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_spot_photos_spots_SpotId",
                        column: x => x.SpotId,
                        principalTable: "spots",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_spot_photos_SpotId",
                table: "spot_photos",
                column: "SpotId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "spot_photos");
        }
    }
}
