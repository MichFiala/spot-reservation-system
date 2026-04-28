using Microsoft.EntityFrameworkCore;
using SpotReservation.Domain.Entities;
using SpotReservation.Domain.Repositories;

namespace SpotReservation.Infrastructure.Persistence.Repositories;

internal sealed class ReservationPageRepository(AppDbContext db) : IReservationPageRepository
{
    public Task<ReservationPage?> GetByPageAsync(string id, CancellationToken cancellationToken = default) =>
        db.ReservationPages.Include(p => p.Spots).ThenInclude(s => s.Reservations).AsNoTracking()
          .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

    public async Task AddAsync(ReservationPage page, CancellationToken cancellationToken = default)
    {
        await db.ReservationPages.AddAsync(page, cancellationToken);
    }

    public async Task<HashSet<Guid>> GetOccupiedSpotIdsAsync(string pageId, DateTime utcNow, CancellationToken cancellationToken = default)
    {
        var ids = await db.Reservations
            .Where(r => r.ReservationPageId == pageId
                && !(r is CancelledReservation)
                && r.Period.StartUtc <= utcNow
                && r.Period.EndUtc > utcNow)
            .Select(r => r.SpotId)
            .Distinct()
            .ToListAsync(cancellationToken);

        return [.. ids];
    }
}
