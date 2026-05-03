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
        var bob = User.Register("bob@example.com", hasher.Hash("User123!"), UserRole.User, now);

        db.Users.AddRange(admin, alice, bob);

        // --- ReservationPage ---
        var page = ReservationPage.Create(
            "rybnik-u-lesa", "Rybník U Lesa", "Kempování a rybaření u rybníka",
            new MapOptions(new Point(13.049666, 49.327535) { SRID = 4326 }, 18, 15, 18),
            new ContactInformations("Jan Vomacka", "Rybník U Lesa, 12345, Česká republika", "+420 123 456 789", null),
            new OwnerPayementInformations("CZ5508000000001234567899", "CZK"));
        db.ReservationPages.Add(page);
        await db.SaveChangesAsync();
        // --- Spots (coordinates near Rybník U Lesa, Česko; Point(longitude, latitude)) ---
        var spot1 = Spot.Create("Místo u dubu", "Klidné místo ve stínu starého dubu", 150, now,
            new Point(13.0515255792, 49.3271558384) { SRID = 4326 }, page.Id);

        var spot2 = Spot.Create("Břeh u mola", "Přímo u dřevěného mola s přístupem k vodě", 120, now,
            new Point(13.0513108662, 49.3278970273) { SRID = 4326 }, page.Id);

        var spot3 = Spot.Create("Slunečná louka", "Otevřené místo s celodenním sluncem", 100, now,
            new Point(13.0507740838, 49.3281837106) { SRID = 4326 }, page.Id);

        var spot4 = Spot.Create("Zátoka u rákosí", "Odlehlé místo u rákosového porostu", 80, now,
            new Point(13.0512142454, 49.3265405033) { SRID = 4326 }, page.Id);

        var spot5 = Spot.Create("Místo u ohniště", "Vybavené ohništěm a lavičkami", 90, now,
            new Point(13.0507848195, 49.3273516253) { SRID = 4326 }, page.Id);

        var spot6 = Spot.Create("Pláž u přítoku", "Písčitý břeh u vtoku potoka", 110, now,
            new Point(13.0501836232, 49.3266943378) { SRID = 4326 }, page.Id);

        var spot7 = Spot.Create("Lesní stanoviště", "Zastíněné místo na okraji lesa", 100, now,
            new Point(13.0509673255, 49.3275893654) { SRID = 4326 }, page.Id);

        var spot8 = Spot.Create("Vyhlídka na hrázi", "Místo na hrázi s výhledem na celý rybník", 120, now,
            new Point(13.0502909797, 49.3283165633) { SRID = 4326 }, page.Id);

        var spot9 = Spot.Create("Tábořiště u bříz", "Prostorné místo obklopené břízami", 130, now,
            new Point(13.0484766551, 49.3274075642) { SRID = 4326 }, page.Id);

        var spot10 = Spot.Create("Rybářský posed", "Ideální pro rybaření, klidná část rybníka", 140, now,
            new Point(13.0518047060, 49.3276453041) { SRID = 4326 }, page.Id);

        var spot11 = Spot.Create("Servisní místo E5", "Dočasně mimo provoz – údržba", 150, now,
            new Point(13.0492820000, 49.3283040000) { SRID = 4326 }, page.Id);
        spot11.Deactivate();

        var spot12 = Spot.Create("Kemp u cesty", "Snadno dostupné místo u příjezdové cesty", 160, now,
            new Point(13.0510102681, 49.3270159902) { SRID = 4326 }, page.Id);

        var spot13 = Spot.Create("Polostrov", "Unikátní místo na malém poloostrově", 170, now,
            new Point(13.0497434616, 49.3285473065) { SRID = 4326 }, page.Id);

        db.Spots.AddRange(spot1, spot2, spot3, spot4, spot5, spot6, spot7, spot8, spot9, spot10, spot11, spot12, spot13);

        // Save users and spots before reservations (FK constraint)
        await db.SaveChangesAsync();

        // --- Reservations ---
        var tomorrow = now.Date.AddDays(1);

        var pending1 = Reservation.Place(spot1,
            TimeRange.Create(tomorrow.AddHours(9), tomorrow.AddHours(11)), now);

        var pending2 = Reservation.Place(spot2,
            TimeRange.Create(tomorrow.AddHours(13), tomorrow.AddHours(15)), now);

        var toApprove = Reservation.Place(spot3,
            TimeRange.Create(tomorrow.AddDays(7).AddHours(10), tomorrow.AddDays(7).AddHours(12)), now);
        var approved = toApprove.Approve(now);

        var toCancel = Reservation.Place(spot4,
            TimeRange.Create(tomorrow.AddDays(14).AddHours(9), tomorrow.AddDays(14).AddHours(11)), now);
        var cancelled = toCancel.Cancel(now);

        db.Reservations.AddRange(pending1, pending2, approved, cancelled);
        await db.SaveChangesAsync();
    }
}
