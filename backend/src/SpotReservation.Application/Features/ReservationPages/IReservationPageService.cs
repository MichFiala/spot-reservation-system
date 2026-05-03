namespace SpotReservation.Application.Features.ReservationPages;

public interface IReservationPageService
{
    Task<IReadOnlyList<ReservationPageSummaryDto>> ListAsync(CancellationToken cancellationToken = default);

    Task<ReservationPageDto> GetAsync(string slug, CancellationToken cancellationToken = default);

    Task<ReservationPageDto> CreateAsync(CreateReservationPageRequest request, CancellationToken cancellationToken = default);

    Task<ReservationPageDto> UpdateAsync(string slug, UpdateReservationPageRequest request, CancellationToken cancellationToken = default);

    Task DeleteAsync(string id, CancellationToken cancellationToken = default);
}
