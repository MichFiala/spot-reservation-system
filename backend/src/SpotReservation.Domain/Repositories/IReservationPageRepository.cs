using SpotReservation.Domain.Entities;

namespace SpotReservation.Domain.Repositories;

public interface IReservationPageRepository
{
    Task<ReservationPage?> GetByPageAsync(string pageId, CancellationToken cancellationToken = default);

    Task AddAsync(ReservationPage page, CancellationToken cancellationToken = default);

    Task<HashSet<Guid>> GetOccupiedSpotIdsAsync(string pageId, DateTime utcNow, CancellationToken cancellationToken = default);
}
