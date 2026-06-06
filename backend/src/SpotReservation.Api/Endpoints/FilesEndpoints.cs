using Microsoft.AspNetCore.Mvc;
using SpotReservation.Application.Abstractions;

namespace SpotReservation.Api.Endpoints;

public static class FilesEndpoints
{
    public static IEndpointRouteBuilder MapFiles(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("api/files").WithTags("Files");

        group.MapGet("/{bucket}/{**objectKey}", async (string bucket, string objectKey, IFileStorage storage, CancellationToken ct) =>
        {
            var stream = await storage.DownloadAsync(bucket, objectKey, ct);
            var contentType = ResolveContentType(objectKey);
            return Results.Stream(stream, contentType);
        })
        .AllowAnonymous()
        .Produces(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status404NotFound);

        group.MapPost("/{bucket}", async (string bucket, IFormFile file, [FromQuery] string? objectKey, IFileStorage storage, CancellationToken ct) =>
        {
            var key = objectKey ?? $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";

            using var stream = file.OpenReadStream();
            await storage.UploadAsync(bucket, key, stream, file.ContentType, ct);

            return Results.Ok(new { Url = storage.GetPublicUrl(bucket, key) });
        })
        .RequireAuthorization()
        .DisableAntiforgery()
        .Produces(StatusCodes.Status200OK);

        return app;
    }

    private static string ResolveContentType(string objectKey) =>
        Path.GetExtension(objectKey).ToLowerInvariant() switch
        {
            ".png" => "image/png",
            ".jpg" or ".jpeg" => "image/jpeg",
            ".gif" => "image/gif",
            ".webp" => "image/webp",
            ".svg" => "image/svg+xml",
            ".pdf" => "application/pdf",
            _ => "application/octet-stream"
        };
}
