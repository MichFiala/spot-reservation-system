using SpotReservation.Domain.Entities;

namespace SpotReservation.Domain.Repositories;

public interface ISpotPhotoRepository
{
    Task<SpotPhoto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<SpotPhoto>> ListBySpotAsync(Guid spotId, CancellationToken cancellationToken = default);

    Task AddAsync(SpotPhoto photo, CancellationToken cancellationToken = default);

    void Remove(SpotPhoto photo);
}
