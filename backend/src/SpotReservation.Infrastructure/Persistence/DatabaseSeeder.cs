using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using NetTopologySuite.Geometries;
using SpotReservation.Application.Abstractions;
using SpotReservation.Domain.Entities;
using SpotReservation.Domain.Enums;
using SpotReservation.Domain.ValueObjects;

namespace SpotReservation.Infrastructure.Persistence;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var hasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();

        await db.Database.MigrateAsync();

        if (await db.Users.AnyAsync())
            return;

        var now = DateTime.UtcNow;

        // --- Users ---
        var admin = User.Register("admin@example.com", hasher.Hash("Admin123!"), UserRole.Admin, now);
        var alice = User.Register("alice@example.com", hasher.Hash("User123!"), UserRole.User, now);
        var bob   = User.Register("bob@example.com",   hasher.Hash("User123!"), UserRole.User, now);

        db.Users.AddRange(admin, alice, bob);

        // --- Spots (coordinates near Warsaw, Poland; Point(longitude, latitude)) ---
        var spotA1 = Spot.Create("Spot A1", "Ground floor, near entrance", now,
            new Point(21.012325, 52.229625) { SRID = 4326 });

        var spotB2 = Spot.Create("Spot B2", "Covered parking, level 1", now,
            new Point(21.012625, 52.229625) { SRID = 4326 });

        var spotC3 = Spot.Create("Spot C3", "VIP spot, reserved area", now,
            new Point(21.012925, 52.229625) { SRID = 4326 });

        var spotD4 = Spot.Create("Spot D4", "Outdoor, uncovered", now,
            new Point(21.012325, 52.229325) { SRID = 4326 });

        var spotE5 = Spot.Create("Spot E5", "Under maintenance", now,
            new Point(21.012625, 52.229325) { SRID = 4326 });
        spotE5.Deactivate();

        db.Spots.AddRange(spotA1, spotB2, spotC3, spotD4, spotE5);

        // Save users and spots before reservations (FK constraint)
        await db.SaveChangesAsync();

        // --- Reservations ---
        var tomorrow = now.Date.AddDays(1);

        var pending1 = Reservation.Place(spotA1, alice.Id,
            TimeRange.Create(tomorrow.AddHours(9), tomorrow.AddHours(11)), now);

        var pending2 = Reservation.Place(spotB2, bob.Id,
            TimeRange.Create(tomorrow.AddHours(13), tomorrow.AddHours(15)), now);

        var toApprove = Reservation.Place(spotC3, alice.Id,
            TimeRange.Create(tomorrow.AddDays(7).AddHours(10), tomorrow.AddDays(7).AddHours(12)), now);
        var approved = toApprove.Approve(now);

        var toCancel = Reservation.Place(spotD4, bob.Id,
            TimeRange.Create(tomorrow.AddDays(14).AddHours(9), tomorrow.AddDays(14).AddHours(11)), now);
        var cancelled = toCancel.Cancel(now);

        db.Reservations.AddRange(pending1, pending2, approved, cancelled);
        await db.SaveChangesAsync();
    }
}
