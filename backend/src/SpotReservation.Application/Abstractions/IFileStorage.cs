namespace SpotReservation.Application.Abstractions;

public interface IFileStorage
{
    Task<string> UploadAsync(string bucket, string objectKey, Stream content, string contentType, CancellationToken cancellationToken = default);

    Task DeleteAsync(string bucket, string objectKey, CancellationToken cancellationToken = default);

    Task<Stream> DownloadAsync(string bucket, string objectKey, CancellationToken cancellationToken = default);

    /// <summary>
    /// Returns the API-relative path for the given file, e.g. /api/files/{bucket}/{objectKey}.
    /// </summary>
    string GetPublicUrl(string bucket, string objectKey);
}
