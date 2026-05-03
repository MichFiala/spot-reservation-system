using SpotReservation.Domain.Entities;

namespace SpotReservation.Domain.Repositories;

public interface IReservationPageRepository
{
    Task<IReadOnlyList<ReservationPage>> ListAsync(CancellationToken cancellationToken = default);

    Task<ReservationPage?> GetByPageAsync(string pageId, CancellationToken cancellationToken = default);

    Task AddAsync(ReservationPage page, CancellationToken cancellationToken = default);

    void Remove(ReservationPage page);

    Task<HashSet<Guid>> GetOccupiedSpotIdsAsync(string pageId, DateTime utcNow, CancellationToken cancellationToken = default);
}
