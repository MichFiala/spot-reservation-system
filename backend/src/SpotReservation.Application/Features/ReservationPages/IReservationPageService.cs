namespace SpotReservation.Application.Features.ReservationPages;

public interface IReservationPageService
{
    Task<ReservationPageDto> GetAsync(string slug, CancellationToken cancellationToken = default);

    Task<ReservationPageDto> CreateAsync(CreateReservationPageRequest request, CancellationToken cancellationToken = default);

    Task<ReservationPageDto> UpdateAsync(string slug, UpdateReservationPageRequest request, CancellationToken cancellationToken = default);
}
