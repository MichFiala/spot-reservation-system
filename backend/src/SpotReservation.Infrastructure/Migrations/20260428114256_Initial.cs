using System;
using Microsoft.EntityFrameworkCore.Migrations;
using NetTopologySuite.Geometries;

#nullable disable

namespace SpotReservation.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Initial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:PostgresExtension:postgis", ",,");

            migrationBuilder.CreateTable(
                name: "reservation_pages",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    map_center = table.Column<Point>(type: "geometry(Point, 4326)", nullable: true),
                    map_zoom = table.Column<int>(type: "integer", nullable: false),
                    map_min_zoom = table.Column<int>(type: "integer", nullable: false),
                    map_max_zoom = table.Column<int>(type: "integer", nullable: false),
                    PayementInformations_Iban = table.Column<string>(type: "character varying(34)", maxLength: 34, nullable: false),
                    PayementInformations_Currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    TermsAndConditionsUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ContactInformations_Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ContactInformations_Email = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ContactInformations_Phone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    contact_opening_hours_json = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_reservation_pages", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    PasswordHash = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: false),
                    Role = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "spots",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    PricePerDay = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    location = table.Column<Point>(type: "geometry(Point, 4326)", nullable: true),
                    ReservationPageId = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_spots", x => x.Id);
                    table.ForeignKey(
                        name: "FK_spots_reservation_pages_ReservationPageId",
                        column: x => x.ReservationPageId,
                        principalTable: "reservation_pages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "reservations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    start_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    end_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    SpotId = table.Column<Guid>(type: "uuid", nullable: false),
                    ReservationPageId = table.Column<string>(type: "text", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric", nullable: false),
                    VariableSymbol = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    status = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    approved_at_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    cancelled_at_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_reservations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_reservations_reservation_pages_ReservationPageId",
                        column: x => x.ReservationPageId,
                        principalTable: "reservation_pages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_reservations_spots_SpotId",
                        column: x => x.SpotId,
                        principalTable: "spots",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_reservations_end_utc",
                table: "reservations",
                column: "end_utc");

            migrationBuilder.CreateIndex(
                name: "IX_reservations_ReservationPageId",
                table: "reservations",
                column: "ReservationPageId");

            migrationBuilder.CreateIndex(
                name: "IX_reservations_SpotId",
                table: "reservations",
                column: "SpotId");

            migrationBuilder.CreateIndex(
                name: "IX_reservations_start_utc",
                table: "reservations",
                column: "start_utc");

            migrationBuilder.CreateIndex(
                name: "IX_spots_Name",
                table: "spots",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_spots_ReservationPageId",
                table: "spots",
                column: "ReservationPageId");

            migrationBuilder.CreateIndex(
                name: "IX_users_Email",
                table: "users",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "reservations");

            migrationBuilder.DropTable(
                name: "users");

            migrationBuilder.DropTable(
                name: "spots");

            migrationBuilder.DropTable(
                name: "reservation_pages");
        }
    }
}
