using SpotReservation.Application.Features.Reservations;

namespace SpotReservation.Api.Endpoints;

public static class ReservationsEndpoints
{
    public static IEndpointRouteBuilder MapReservations(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("api/reservations").WithTags("Reservations").RequireAuthorization();

        group.MapPost("/", async (CreateReservationRequest request, IReservationService reservations, CancellationToken ct) =>
        {
            var created = await reservations.CreateAsync(request, ct);
            return Results.Created($"/api/reservations/{created.Id}", created);
        })
        .Produces<ReservationDto>(StatusCodes.Status201Created)
        .Produces(StatusCodes.Status409Conflict);

        group.MapGet("/{id:guid}", async (Guid id, IReservationService reservations, CancellationToken ct) =>
            Results.Ok(await reservations.GetAsync(id, ct)))
            .Produces<ReservationDto>()
            .Produces(StatusCodes.Status404NotFound);

        group.MapGet("/mine", async (IReservationService reservations, CancellationToken ct) =>
            Results.Ok(await reservations.ListMineAsync(ct)))
            .Produces<IReadOnlyList<ReservationDto>>();

        group.MapGet("/by-spot/{spotId:guid}", async (Guid spotId, IReservationService reservations, CancellationToken ct) =>
            Results.Ok(await reservations.ListForSpotAsync(spotId, ct)))
            .Produces<IReadOnlyList<ReservationDto>>();

        group.MapPost("/{id:guid}/cancel", async (Guid id, IReservationService reservations, CancellationToken ct) =>
        {
            await reservations.CancelAsync(id, ct);
            return Results.NoContent();
        })
        .Produces(StatusCodes.Status204NoContent)
        .Produces(StatusCodes.Status404NotFound)
        .Produces(StatusCodes.Status409Conflict);

        return app;
    }
}
