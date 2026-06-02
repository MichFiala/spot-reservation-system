using Microsoft.EntityFrameworkCore;
using SpotReservation.Domain.Entities;
using SpotReservation.Domain.Repositories;
using SpotReservation.Domain.ValueObjects;

namespace SpotReservation.Infrastructure.Persistence.Repositories;

internal sealed class ReservationRepository(AppDbContext db) : IReservationRepository
{
    public Task<Reservation?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        db.Reservations
            .Include(r => r.ReservationPage)
            .Include(r => r.Spot)
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);

    public async Task<IReadOnlyList<Reservation>> ListForSpotAsync(Guid spotId, CancellationToken cancellationToken = default)
    {
        return await db.Reservations
            .AsNoTracking()
            .Include(r => r.Spot)
            .Where(r => r.SpotId == spotId)
            .OrderBy(r => r.Period.StartUtc)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Reservation>> ListForUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await db.Reservations
            .AsNoTracking()
            .Include(r => r.Spot)
            .OrderByDescending(r => r.Period.StartUtc)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Reservation>> ListForPageAsync(
        string reservationPageId, int year, int month, CancellationToken cancellationToken = default)
    {
        var monthStart = new DateTime(year, month, 1, 0, 0, 0, DateTimeKind.Utc);
        var monthEnd = monthStart.AddMonths(1);

        return await db.Reservations
            .AsNoTracking()
            .Include(r => r.Spot)
            .Include(r => r.ReservationPage)
            .Where(r => r.ReservationPageId == reservationPageId
                        // && r.Period.StartUtc.Month == month
                        // && r.Period.StartUtc.Year == year
                        )
            .OrderBy(r => r.Period.StartUtc)
            .ToListAsync(cancellationToken);
    }

    public Task<bool> HasOverlapAsync(Guid spotId, TimeRange period, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(period);

        // Only Pending and Approved reservations block a slot; Cancelled ones do not.
        return db.Reservations.AnyAsync(
            r => r.SpotId == spotId
                 && r.Status != ReservationStatus.Cancelled
                 && r.Period.StartUtc < period.EndUtc
                 && r.Period.EndUtc > period.StartUtc,
            cancellationToken);
    }

    public async Task AddAsync(Reservation reservation, CancellationToken cancellationToken = default)
    {
        await db.Reservations.AddAsync(reservation, cancellationToken);
    }

    public async Task TransitionAsync(Reservation from, Reservation to, CancellationToken cancellationToken = default)
    {
        db.Remove(from);
        
        await db.SaveChangesAsync(cancellationToken);
        
        db.Add(to); 

        await db.SaveChangesAsync(cancellationToken);
    }
}
