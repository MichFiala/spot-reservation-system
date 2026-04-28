namespace SpotReservation.Application.Features.Spots;

public interface ISpotService
{
    Task<IReadOnlyList<SpotDto>> ListAsync(bool onlyActive, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<SpotDto>> ListByPageAsync(string pageSlug, bool onlyActive, CancellationToken cancellationToken = default);

    Task<SpotDto> GetAsync(Guid id, CancellationToken cancellationToken = default);

    Task<SpotDto> CreateAsync(CreateSpotRequest request, CancellationToken cancellationToken = default);

    Task<SpotDto> UpdateAsync(Guid id, UpdateSpotRequest request, CancellationToken cancellationToken = default);

    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
