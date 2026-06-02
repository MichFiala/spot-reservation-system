using SpotReservation.Application.Features.Reservations;

namespace SpotReservation.Api.Endpoints;

public static class ReservationsEndpoints
{
    public static IEndpointRouteBuilder MapReservations(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("api/reservations").WithTags("Reservations");

        group.MapGet("/{id:guid}", async (Guid id, IReservationService reservations, CancellationToken ct) =>
            Results.Ok(await reservations.GetAsync(id, ct)))
            .AllowAnonymous()
            .Produces<ReservationDto>()
            .Produces(StatusCodes.Status404NotFound);

        group.MapGet("/by-spot/{spotId:guid}", async (Guid spotId, IReservationService reservations, CancellationToken ct) =>
            Results.Ok(await reservations.ListForSpotAsync(spotId, ct)))
            .Produces<IReadOnlyList<ReservationDto>>()
            .RequireAuthorization();


        group.MapGet("/by-page/{pageId}/{year:int}/{month:int}",
            async (string pageId, int year, int month, IReservationService reservations, CancellationToken ct) =>
                Results.Ok(await reservations.ListForPageByMonthAsync(pageId, year, month, ct)))
            .Produces<IReadOnlyList<ReservationDto>>()
            .Produces(StatusCodes.Status404NotFound)
            .RequireAuthorization(pb => pb.RequireRole("Admin"));


        /// Create reservation anonymous user
        group.MapPost("/", async (CreateReservationRequest request, IReservationService reservations, CancellationToken ct) =>
        {
            var created = await reservations.CreateAsync(request, ct);

            return Results.Created($"/api/reservations/{created.Id}", created);
        })
        .AllowAnonymous()
        .Produces<ReservationDto>(StatusCodes.Status201Created)
        .Produces(StatusCodes.Status409Conflict);

        /// Approve reservation by id
        group.MapPost("/{id:guid}/approve", async (Guid id, IReservationService reservations, CancellationToken ct) =>
        {
            await reservations.ApproveAsync(id, ct);
            return Results.NoContent();
        })
        .Produces(StatusCodes.Status204NoContent)
        .Produces(StatusCodes.Status404NotFound)
        .Produces(StatusCodes.Status409Conflict)
        .RequireAuthorization(pb => pb.RequireRole("Admin"));

        /// Cancel reservation by id
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
