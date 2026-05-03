namespace SpotReservation.Application.Features.SpotPhotos;

public sealed record SpotPhotoDto(
    Guid Id,
    Guid SpotId,
    string ObjectKey,
    string Url,
    int SortOrder,
    DateTime UploadedAtUtc);
