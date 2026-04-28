using Microsoft.EntityFrameworkCore;
using SpotReservation.Domain.Entities;
using SpotReservation.Domain.Repositories;
using SpotReservation.Domain.ValueObjects;

namespace SpotReservation.Infrastructure.Persistence.Repositories;

internal sealed class ReservationRepository(AppDbContext db) : IReservationRepository
{
    public Task<Reservation?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        db.Reservations.FirstOrDefaultAsync(r => r.Id == id, cancellationToken);

    public async Task<IReadOnlyList<Reservation>> ListForSpotAsync(Guid spotId, CancellationToken cancellationToken = default)
    {
        return await db.Reservations
            .AsNoTracking()
            .Where(r => r.SpotId == spotId)
            .OrderBy(r => r.Period.StartUtc)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Reservation>> ListForUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await db.Reservations
            .AsNoTracking()
            // .Where(r => r.UserId == userId)
            .OrderByDescending(r => r.Period.StartUtc)
            .ToListAsync(cancellationToken);
    }

    public Task<bool> HasOverlapAsync(Guid spotId, TimeRange period, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(period);

        // Only Pending and Approved reservations block a slot; Cancelled ones do not.
        return db.Reservations.AnyAsync(
            r => r.SpotId == spotId
                 && EF.Property<string>(r, "status") != "Cancelled"
                 && r.Period.StartUtc < period.EndUtc
                 && r.Period.EndUtc > period.StartUtc,
            cancellationToken);
    }

    public async Task AddAsync(Reservation reservation, CancellationToken cancellationToken = default)
    {
        await db.Reservations.AddAsync(reservation, cancellationToken);
    }

    public Task TransitionAsync(Reservation from, Reservation to, CancellationToken cancellationToken = default)
    {
        db.Entry(from).State = EntityState.Detached;

        return to switch
        {
            ApprovedReservation a => db.Reservations
                .Where(r => r.Id == a.Id)
                .ExecuteUpdateAsync(s => s
                    .SetProperty(r => EF.Property<string>(r, "status"), "Approved")
                    .SetProperty(r => EF.Property<DateTime>(r, "approved_at_utc"), a.ApprovedAtUtc),
                    cancellationToken),

            CancelledReservation c => db.Reservations
                .Where(r => r.Id == c.Id)
                .ExecuteUpdateAsync(s => s
                    .SetProperty(r => EF.Property<string>(r, "status"), "Cancelled")
                    .SetProperty(r => EF.Property<DateTime>(r, "cancelled_at_utc"), c.CancelledAtUtc),
                    cancellationToken),

            _ => throw new ArgumentException($"Unknown reservation type: {to.GetType().Name}")
        };
    }
}
