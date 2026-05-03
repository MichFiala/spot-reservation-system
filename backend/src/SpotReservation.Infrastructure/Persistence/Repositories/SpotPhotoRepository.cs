using Microsoft.EntityFrameworkCore;
using SpotReservation.Domain.Entities;
using SpotReservation.Domain.Repositories;

namespace SpotReservation.Infrastructure.Persistence.Repositories;

internal sealed class SpotPhotoRepository(AppDbContext db) : ISpotPhotoRepository
{
    public Task<SpotPhoto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        db.SpotPhotos.FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

    public async Task<IReadOnlyList<SpotPhoto>> ListBySpotAsync(Guid spotId, CancellationToken cancellationToken = default) =>
        await db.SpotPhotos
            .AsNoTracking()
            .Where(p => p.SpotId == spotId)
            .OrderBy(p => p.SortOrder)
            .ToListAsync(cancellationToken);

    public async Task AddAsync(SpotPhoto photo, CancellationToken cancellationToken = default) =>
        await db.SpotPhotos.AddAsync(photo, cancellationToken);

    public void Remove(SpotPhoto photo) => db.SpotPhotos.Remove(photo);
}
