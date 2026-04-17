using Microsoft.EntityFrameworkCore;
using SpotReservation.Domain.Entities;
using SpotReservation.Domain.Repositories;

namespace SpotReservation.Infrastructure.Persistence.Repositories;

internal sealed class SpotRepository : ISpotRepository
{
    private readonly AppDbContext _db;

    public SpotRepository(AppDbContext db) => _db = db;

    public Task<Spot?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        _db.Spots.FirstOrDefaultAsync(s => s.Id == id, cancellationToken);

    public async Task<IReadOnlyList<Spot>> ListAsync(bool onlyActive, CancellationToken cancellationToken = default)
    {
        var query = _db.Spots.AsNoTracking().AsQueryable();
        if (onlyActive)
        {
            query = query.Where(s => s.IsActive);
        }

        return await query.OrderBy(s => s.Name).ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Spot spot, CancellationToken cancellationToken = default)
    {
        await _db.Spots.AddAsync(spot, cancellationToken);
    }

    public void Remove(Spot spot) => _db.Spots.Remove(spot);
}
