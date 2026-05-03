using SpotReservation.Application.Features.SpotPhotos;

namespace SpotReservation.Api.Endpoints;

public static class SpotPhotosEndpoints
{
    public static IEndpointRouteBuilder MapSpotPhotos(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("api/spot-photos").WithTags("SpotPhotos");

        group.MapGet("/by-spot/{spotId:guid}", async (Guid spotId, ISpotPhotoService photos, CancellationToken ct) =>
            Results.Ok(await photos.ListBySpotAsync(spotId, ct)))
            .AllowAnonymous()
            .Produces<IReadOnlyList<SpotPhotoDto>>();

        group.MapPost("/", async (IFormFile file, Guid spotId, int sortOrder, ISpotPhotoService photos, CancellationToken ct) =>
        {
            using var stream = file.OpenReadStream();
            var created = await photos.AddAsync(spotId, sortOrder, stream, file.ContentType, file.FileName, ct);
            return Results.Created($"/api/spot-photos/{created.Id}", created);
        })
        .RequireAuthorization(pb => pb.RequireRole("Admin"))
        .DisableAntiforgery()
        .Produces<SpotPhotoDto>(StatusCodes.Status201Created)
        .Produces(StatusCodes.Status404NotFound);

        group.MapDelete("/{id:guid}", async (Guid id, ISpotPhotoService photos, CancellationToken ct) =>
        {
            await photos.DeleteAsync(id, ct);
            return Results.NoContent();
        })
        .RequireAuthorization(pb => pb.RequireRole("Admin"))
        .Produces(StatusCodes.Status204NoContent)
        .Produces(StatusCodes.Status404NotFound);

        return app;
    }
}
