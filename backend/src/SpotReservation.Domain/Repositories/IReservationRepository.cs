using SpotReservation.Domain.Entities;
using SpotReservation.Domain.ValueObjects;

namespace SpotReservation.Domain.Repositories;

public interface IReservationRepository
{
    Task<Reservation?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Reservation>> ListForSpotAsync(
        Guid spotId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Reservation>> ListForUserAsync(
        Guid userId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Returns true if an active reservation overlapping <paramref name="period"/>
    /// already exists for the given spot.
    /// </summary>
    Task<bool> HasOverlapAsync(
        Guid spotId,
        TimeRange period,
        CancellationToken cancellationToken = default);

    Task AddAsync(Reservation reservation, CancellationToken cancellationToken = default);

    Task TransitionAsync(Reservation from, Reservation to, CancellationToken cancellationToken = default);
}
