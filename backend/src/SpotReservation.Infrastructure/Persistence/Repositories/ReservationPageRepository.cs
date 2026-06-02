using Microsoft.EntityFrameworkCore;
using SpotReservation.Domain.Entities;
using SpotReservation.Domain.Repositories;

namespace SpotReservation.Infrastructure.Persistence.Repositories;

internal sealed class ReservationPageRepository(AppDbContext db) : IReservationPageRepository
{
    public async Task<IReadOnlyList<ReservationPage>> ListAsync(CancellationToken cancellationToken = default) =>
        await db.ReservationPages
                .AsNoTracking()
                .OrderBy(p => p.Name)
                .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<ReservationPage>> ListByOwnerIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await db.ReservationPages
            .AsNoTracking()
            .Where(p => p.UserId == userId)
            .OrderBy(p => p.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> OwnsPageAsync(Guid userId, string pageId, CancellationToken cancellationToken = default)
    {
        return await db.ReservationPages
            .AnyAsync(p => p.UserId == userId && p.Id == pageId, cancellationToken);
    }

    public Task<ReservationPage?> GetByPageAsync(string id, CancellationToken cancellationToken = default) =>
        db.ReservationPages
          .Include(p => p.Spots)
          .ThenInclude(s => s.Reservations)
          .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

    public async Task AddAsync(ReservationPage page, CancellationToken cancellationToken = default)
    {
        await db.ReservationPages.AddAsync(page, cancellationToken);
    }

    public void Remove(ReservationPage page)
    {
        db.ReservationPages.Remove(page);
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
