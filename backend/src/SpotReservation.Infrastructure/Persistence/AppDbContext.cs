using Microsoft.EntityFrameworkCore;
using SpotReservation.Domain.Entities;
using SpotReservation.Domain.Repositories;

namespace SpotReservation.Infrastructure.Persistence;

public sealed class AppDbContext : DbContext, IUnitOfWork
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();

    public DbSet<Spot> Spots => Set<Spot>();

    public DbSet<Reservation> Reservations => Set<Reservation>();

    public DbSet<ReservationPage> ReservationPages => Set<ReservationPage>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.HasPostgresExtension("postgis");
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
