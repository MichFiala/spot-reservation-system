using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SpotReservation.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class CascadeDelete : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_reservations_reservation_pages_ReservationPageId",
                table: "reservations");

            migrationBuilder.DropForeignKey(
                name: "FK_reservations_spots_SpotId",
                table: "reservations");

            migrationBuilder.AddForeignKey(
                name: "FK_reservations_reservation_pages_ReservationPageId",
                table: "reservations",
                column: "ReservationPageId",
                principalTable: "reservation_pages",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_reservations_spots_SpotId",
                table: "reservations",
                column: "SpotId",
                principalTable: "spots",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_reservations_reservation_pages_ReservationPageId",
                table: "reservations");

            migrationBuilder.DropForeignKey(
                name: "FK_reservations_spots_SpotId",
                table: "reservations");

            migrationBuilder.AddForeignKey(
                name: "FK_reservations_reservation_pages_ReservationPageId",
                table: "reservations",
                column: "ReservationPageId",
                principalTable: "reservation_pages",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_reservations_spots_SpotId",
                table: "reservations",
                column: "SpotId",
                principalTable: "spots",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
