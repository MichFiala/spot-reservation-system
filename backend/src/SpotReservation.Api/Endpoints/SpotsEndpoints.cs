using SpotReservation.Application.Features.Spots;

namespace SpotReservation.Api.Endpoints;

public static class SpotsEndpoints
{
    public static IEndpointRouteBuilder MapSpots(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("api/spots").WithTags("Spots");

        group.MapGet("/", async (ISpotService spots, bool onlyActive = true, CancellationToken ct = default) =>
            Results.Ok(await spots.ListAsync(onlyActive, ct)))
            .AllowAnonymous()
            .Produces<IReadOnlyList<SpotDto>>();

        group.MapGet("/{id:guid}", async (Guid id, ISpotService spots, CancellationToken ct) =>
            Results.Ok(await spots.GetAsync(id, ct)))
            .AllowAnonymous()
            .Produces<SpotDto>()
            .Produces(StatusCodes.Status404NotFound);

        group.MapPost("/", async (CreateSpotRequest request, ISpotService spots, CancellationToken ct) =>
        {
            var created = await spots.CreateAsync(request, ct);
            return Results.Created($"/api/spots/{created.Id}", created);
        })
        .RequireAuthorization(pb => pb.RequireRole("Admin"))
        .Produces<SpotDto>(StatusCodes.Status201Created);

        group.MapPut("/{id:guid}", async (Guid id, UpdateSpotRequest request, ISpotService spots, CancellationToken ct) =>
            Results.Ok(await spots.UpdateAsync(id, request, ct)))
            .RequireAuthorization(pb => pb.RequireRole("Admin"))
            .Produces<SpotDto>()
            .Produces(StatusCodes.Status404NotFound);

        group.MapDelete("/{id:guid}", async (Guid id, ISpotService spots, CancellationToken ct) =>
        {
            await spots.DeleteAsync(id, ct);
            return Results.NoContent();
        })
        .RequireAuthorization(pb => pb.RequireRole("Admin"))
        .Produces(StatusCodes.Status204NoContent)
        .Produces(StatusCodes.Status404NotFound);

        return app;
    }
}
