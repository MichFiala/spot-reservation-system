using SpotReservation.Application.Abstractions;
using SpotReservation.Application.Common.Exceptions;
using SpotReservation.Domain.Entities;
using SpotReservation.Domain.Repositories;

namespace SpotReservation.Application.Features.SpotPhotos;

internal sealed class SpotPhotoService(
    ISpotPhotoRepository photos,
    ISpotRepository spots,
    IFileStorage fileStorage,
    IUnitOfWork uow,
    IDateTimeProvider clock) : ISpotPhotoService
{
    private const string BucketName = "spot-photos";

    public async Task<IReadOnlyList<SpotPhotoDto>> ListBySpotAsync(Guid spotId, CancellationToken cancellationToken = default)
    {
        var result = await photos.ListBySpotAsync(spotId, cancellationToken);
        return [.. result.Select(ToDto)];
    }

    public async Task<SpotPhotoDto> AddAsync(Guid spotId, int sortOrder, Stream fileStream, string contentType, string fileName, CancellationToken cancellationToken = default)
    {
        var spot = await spots.GetByIdAsync(spotId, cancellationToken)
            ?? throw new NotFoundException(nameof(Spot), spotId);

        var extension = Path.GetExtension(fileName);
        var objectKey = $"spots/{spot.Id}/{Guid.NewGuid()}{extension}";

        await fileStorage.UploadAsync(BucketName, objectKey, fileStream, contentType, cancellationToken);

        var photo = new SpotPhoto(
            Guid.NewGuid(),
            spot.Id,
            objectKey,
            sortOrder,
            clock.UtcNow);

        await photos.AddAsync(photo, cancellationToken);
        await uow.SaveChangesAsync(cancellationToken);

        return ToDto(photo);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var photo = await photos.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException(nameof(SpotPhoto), id);

        await fileStorage.DeleteAsync(BucketName, photo.ObjectKey, cancellationToken);

        photos.Remove(photo);
        await uow.SaveChangesAsync(cancellationToken);
    }

    private SpotPhotoDto ToDto(SpotPhoto photo) => new(
        photo.Id,
        photo.SpotId,
        photo.ObjectKey,
        fileStorage.GetPublicUrl(BucketName, photo.ObjectKey),
        photo.SortOrder,
        photo.UploadedAtUtc);
}
