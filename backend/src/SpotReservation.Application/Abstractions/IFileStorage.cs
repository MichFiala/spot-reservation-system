namespace SpotReservation.Application.Abstractions;

public interface IFileStorage
{
    /// <summary>
    /// Uploads a file and returns the object key.
    /// </summary>
    Task<string> UploadAsync(string bucket, string objectKey, Stream content, string contentType, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a file by its object key.
    /// </summary>
    Task DeleteAsync(string bucket, string objectKey, CancellationToken cancellationToken = default);

    /// <summary>
    /// Returns a public URL for the given object key.
    /// </summary>
    string GetPublicUrl(string bucket, string objectKey);
}
