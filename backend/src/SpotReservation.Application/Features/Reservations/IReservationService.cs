namespace SpotReservation.Application.Features.Reservations;

public interface IReservationService
{
    Task<ReservationDto> CreateAsync(CreateReservationRequest request, CancellationToken cancellationToken = default);

    Task<ReservationDto> GetAsync(Guid id, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<ReservationDto>> ListMineAsync(CancellationToken cancellationToken = default);

    Task<IReadOnlyList<ReservationDto>> ListForSpotAsync(Guid spotId, CancellationToken cancellationToken = default);

    Task CancelAsync(Guid id, CancellationToken cancellationToken = default);
}
