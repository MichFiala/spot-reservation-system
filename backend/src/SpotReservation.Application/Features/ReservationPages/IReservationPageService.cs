namespace SpotReservation.Application.Features.ReservationPages;

public interface IReservationPageService
{
    Task<ReservationPageDto> GetAsync(string slug, CancellationToken cancellationToken = default);
}
