namespace SpotReservation.Application.Features.SpotPhotos;

public interface ISpotPhotoService
{
    Task<IReadOnlyList<SpotPhotoDto>> ListBySpotAsync(Guid spotId, CancellationToken cancellationToken = default);

    Task<SpotPhotoDto> AddAsync(Guid spotId, int sortOrder, Stream fileStream, string contentType, string fileName, CancellationToken cancellationToken = default);

    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
