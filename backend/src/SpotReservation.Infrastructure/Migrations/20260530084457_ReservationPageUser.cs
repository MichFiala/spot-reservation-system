using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SpotReservation.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ReservationPageUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "UserId",
                table: "reservation_pages",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_reservation_pages_UserId",
                table: "reservation_pages",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_reservation_pages_users_UserId",
                table: "reservation_pages",
                column: "UserId",
                principalTable: "users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_reservation_pages_users_UserId",
                table: "reservation_pages");

            migrationBuilder.DropIndex(
                name: "IX_reservation_pages_UserId",
                table: "reservation_pages");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "reservation_pages");
        }
    }
}
