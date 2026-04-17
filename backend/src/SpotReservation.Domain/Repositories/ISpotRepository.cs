using SpotReservation.Domain.Entities;

namespace SpotReservation.Domain.Repositories;

public interface ISpotRepository
{
    Task<Spot?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Spot>> ListAsync(bool onlyActive, CancellationToken cancellationToken = default);

    Task AddAsync(Spot spot, CancellationToken cancellationToken = default);

    void Remove(Spot spot);
}
